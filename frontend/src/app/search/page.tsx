"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Search,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChunkCard } from "@/components/search/chunk-card";
import { api, type DocumentSummary, type ScoredChunk } from "@/lib/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState("5");
  const [docFilter, setDocFilter] = useState("all");
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [results, setResults] = useState<ScoredChunk[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listDocuments().then(setDocs).catch(() => setDocs([]));
  }, []);

  const run = useCallback(async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    try {
      const chunks = await api.search({
        query: q,
        top_k: Number(topK) || null,
        doc_ids: docFilter === "all" ? null : [docFilter],
      });
      setResults(chunks);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query, topK, docFilter, loading]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Hybrid search</h1>
        <p className="text-sm text-muted-foreground">
          Dense + BM25 + RRF + cross-encoder reranking
        </p>
      </div>

      <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-[1fr_auto_auto]">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Search terms or a phrase…"
          className="h-9"
        />
        <div className="flex items-center gap-2">
          <Label htmlFor="doc-filter" className="hidden sr-only sm:not-sr-only sm:inline">
            Document
          </Label>
          <Select value={docFilter} onValueChange={setDocFilter}>
            <SelectTrigger className="h-9 w-44" id="doc-filter">
              <SelectValue placeholder="All documents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All documents</SelectItem>
              {docs.map((d) => (
                <SelectItem key={d.doc_id} value={d.doc_id}>
                  <span className="max-w-[200px] truncate">{d.filename}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="topk" className="hidden sr-only sm:not-sr-only sm:inline">
            Top K
          </Label>
          <Select value={topK} onValueChange={setTopK}>
            <SelectTrigger className="h-9 w-24" id="topk">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["3", "5", "10", "15"].map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={run} disabled={loading || !query.trim()} className="h-9">
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Search
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 space-y-4">
        {loading && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </>
        )}

        {!loading && results !== null && results.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No chunks matched</p>
            <p className="text-xs text-muted-foreground">
              Try different terms or a broader document scope.
            </p>
          </div>
        )}

        {!loading &&
          results !== null &&
          results.map((chunk, i) => (
            <ChunkCard key={chunk.chunk_id} chunk={chunk} index={i} />
          ))}
      </div>

      {!loading && results === null && (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Run a search to inspect ranked chunks and retrieval telemetry.
        </p>
      )}
    </div>
  );
}
