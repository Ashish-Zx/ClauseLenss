/**
 * Typed API client for the ClauseLens FastAPI backend.
 * Types mirror the backend Pydantic schemas in backend/src/schemas/.
 */

export interface BoundingBox {
  l: number;
  t: number;
  r: number;
  b: number;
  page_number: number;
  coord_origin?: string;
}

export interface RetrievalTelemetry {
  chunk_id: string;
  dense_rank?: number | null;
  bm25_rank?: number | null;
  dense_score?: number | null;
  bm25_score?: number | null;
  rrf_score?: number | null;
  reranker_score?: number | null;
}

export interface ScoredChunk {
  chunk_id: string;
  doc_id: string;
  filename: string;
  page_number: number;
  section_path: string;
  raw_content: string;
  contextualized_content: string;
  bounding_box?: BoundingBox | null;
  telemetry: RetrievalTelemetry;
}

export interface Citation {
  citation_id: number;
  chunk_id: string;
  doc_name: string;
  page_number: number;
  section_path: string;
  verbatim_quote: string;
  bounding_box?: BoundingBox | null;
}

export interface RAGResponse {
  query: string;
  answer: string;
  citations: Citation[];
  telemetry: RetrievalTelemetry[];
  unanswerable_reason?: string | null;
  total_latency_ms: number;
}

export interface QueryRequest {
  query: string;
  doc_ids?: string[] | null;
  top_k?: number | null;
}

export interface IngestionResponse {
  doc_id: string;
  filename: string;
  page_count: number;
  chunk_count: number;
  table_count: number;
  status: string;
}

export interface DocumentSummary {
  doc_id: string;
  filename: string;
  chunk_count: number;
  page_count: number;
  pages: number[];
  element_types: string[];
}

export interface IndexStats {
  dense_count: number;
  sparse_count: number;
}

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8000";

class ApiError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : JSON.stringify(detail));
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    let detail: unknown = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function getApiBase(): string {
  return API_BASE;
}

export const api = {
  health: () => request<HealthStatus>("/health"),

  stats: () => request<IndexStats>("/api/documents/stats"),

  listDocuments: () => request<DocumentSummary[]>("/api/documents/list"),

  search: (req: QueryRequest) =>
    request<ScoredChunk[]>("/api/query/search", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  ask: (req: QueryRequest) =>
    request<RAGResponse>("/api/query/ask", {
      method: "POST",
      body: JSON.stringify(req),
    }),

  uploadPdf: async (file: File): Promise<IngestionResponse> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      let detail: unknown = res.statusText;
      try {
        const body = await res.json();
        detail = body.detail ?? body;
      } catch {
        // ignore
      }
      throw new ApiError(res.status, detail);
    }
    return (await res.json()) as IngestionResponse;
  },
};
