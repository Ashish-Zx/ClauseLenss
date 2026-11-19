"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Layers, RefreshCw, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UploadDropzone } from "@/components/documents/upload-dropzone";
import { api, type DocumentSummary } from "@/lib/api";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const list = await api.listDocuments();
      setDocs(list);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api.listDocuments();
        if (!cancelled) setDocs(list);
      } catch {
        if (!cancelled) setDocs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = () => {
    setLoading(true);
    void load();
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Upload PDFs and manage your indexed corpus
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <UploadDropzone onUploaded={load} />

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Indexed documents ({docs.length})
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No documents indexed yet</p>
            <p className="text-xs text-muted-foreground">
              Upload a PDF above to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {docs.map((doc) => (
            <Card key={doc.doc_id} className="transition-colors hover:border-border/70">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.filename}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {doc.doc_id}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">
                    <Layers className="mr-1 size-3" />
                    {doc.chunk_count} chunks
                  </Badge>
                  <Badge variant="secondary">
                    {doc.page_count} page{doc.page_count === 1 ? "" : "s"}
                  </Badge>
                  {doc.element_types.map((t) => (
                    <Badge key={t} variant="outline" className="font-normal">
                      {t === "table" ? (
                        <Table2 className="mr-1 size-3" />
                      ) : null}
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
