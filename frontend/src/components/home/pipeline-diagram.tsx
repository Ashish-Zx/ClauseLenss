"use client";

import {
  ArrowUpDown,
  CheckCircle2,
  Database,
  FileSearch,
  GitMerge,
  MessageSquare,
  Scissors,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { cn } from "cn";

function FlowNode({
  icon: Icon,
  title,
  sub,
  index,
}: {
  icon: typeof Upload;
  title: string;
  sub?: string;
  index: number;
}) {
  return (
    <div
      className="cl-animate-fade-up flex w-28 shrink-0 flex-col items-center gap-2 text-center"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="relative flex size-12 items-center justify-center rounded-2xl border bg-card shadow-sm">
        <span className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
        <Icon className="relative size-5 text-primary" />
      </div>
      <div className="text-xs font-medium leading-tight">{title}</div>
      {sub && (
        <div className="text-[11px] leading-tight text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}

function Connector() {
  return (
    <div className="relative mx-1 h-[2px] w-10 shrink-0 rounded-full bg-gradient-to-r from-border to-border/30 sm:mx-2 sm:w-14">
      <span className="cl-animate-flow-dot absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary" />
    </div>
  );
}

function Flow({ items }: { items: { icon: typeof Upload; title: string; sub?: string }[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex w-max items-center">
        {items.map((it, i) => (
          <div key={it.title} className="flex items-center">
            {i > 0 && <Connector />}
            <FlowNode {...it} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StageBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function PipelineDiagram() {
  const ingestion = [
    { icon: Upload, title: "Upload PDF", sub: "multipart" },
    { icon: FileSearch, title: "Docling parse", sub: "layout / tables" },
    { icon: Scissors, title: "Contextual chunks", sub: "breadcrumbs" },
    { icon: Database, title: "Dual indexing", sub: "ChromaDB · BM25" },
  ];

  const query = [
    { icon: MessageSquare, title: "Your question" },
    { icon: Search, title: "Hybrid retrieval", sub: "dense + BM25" },
    { icon: GitMerge, title: "RRF fusion", sub: "reciprocal rank" },
    { icon: ArrowUpDown, title: "Cross-encoder", sub: "rerank" },
    { icon: Sparkles, title: "LLM synthesis", sub: "grounded prompt" },
    { icon: CheckCircle2, title: "Answer + citations", sub: "evidence [n]" },
  ];

  return (
    <div className="space-y-8">
      {/* Ingestion */}
      <div className="cl-animate-fade-up rounded-2xl border bg-card/50 p-5 sm:p-6" style={{ animationDelay: "150ms" }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Ingestion · offline</h3>
            <p className="text-xs text-muted-foreground">
              Documents are parsed and indexed once, ahead of any question.
            </p>
          </div>
          <StageBadge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Pipeline stage 1
          </StageBadge>
        </div>
        <Flow items={ingestion} />
      </div>

      {/* Query */}
      <div className="cl-animate-fade-up rounded-2xl border bg-card/50 p-5 sm:p-6" style={{ animationDelay: "300ms" }}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold">Query time · online</h3>
            <p className="text-xs text-muted-foreground">
              Every question runs through retrieval, fusion, and grounded generation.
            </p>
          </div>
          <StageBadge className="border-primary/30 bg-primary/10 text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            Pipeline stage 2
          </StageBadge>
        </div>
        <Flow items={query} />
      </div>
    </div>
  );
}
