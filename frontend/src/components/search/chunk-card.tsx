"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, FileText, MessageSquare } from "lucide-react";
import { cn } from "cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScoredChunk } from "@/lib/api";

function TelemetryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="truncate font-semibold text-foreground">{value}</div>
    </div>
  );
}

export function ChunkCard({ chunk, index }: { chunk: ScoredChunk; index: number }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = chunk.telemetry;

  const fmt = (v: number | null | undefined, digits = 3) =>
    typeof v === "number" ? v.toFixed(digits) : "—";

  return (
    <Card className="transition-colors hover:border-border/70">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="max-w-[220px] truncate font-normal"
                >
                  <FileText className="mr-1 size-3" />
                  {chunk.filename}
                </Badge>
                <Badge variant="secondary" className="font-normal">
                  p.{chunk.page_number}
                </Badge>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {chunk.section_path}
              </p>
            </div>
          </div>
          {typeof t.reranker_score === "number" && (
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
              {fmt(t.reranker_score)}
            </span>
          )}
        </div>

        <p
          className={cn(
            "text-sm leading-relaxed text-foreground/90",
            !open && "line-clamp-3",
          )}
        >
          {chunk.raw_content}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown
              className={cn("size-4 transition-transform", open && "rotate-180")}
            />
            Telemetry
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/chat?doc=${encodeURIComponent(chunk.doc_id)}`)
            }
          >
            <MessageSquare className="size-3.5" /> Ask in chat
          </Button>
        </div>

        {open && (
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/40 p-3 sm:grid-cols-5">
            <TelemetryItem label="Dense rank" value={fmt(t.dense_rank, 0)} />
            <TelemetryItem label="Dense score" value={fmt(t.dense_score)} />
            <TelemetryItem label="BM25 rank" value={fmt(t.bm25_rank, 0)} />
            <TelemetryItem label="BM25 score" value={fmt(t.bm25_score)} />
            <TelemetryItem label="RRF" value={fmt(t.rrf_score)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
