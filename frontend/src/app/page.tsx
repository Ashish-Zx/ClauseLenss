"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  FileText,
  Layers,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PipelineDiagram } from "@/components/home/pipeline-diagram";
import { api, type HealthStatus, type IndexStats } from "@/lib/api";
import { BrandLogo } from "@/components/brand-logo";

interface HomeData {
  health: HealthStatus | null;
  stats: IndexStats | null;
  docCount: number;
  chunkCount: number;
}

const FEATURES = [
  {
    href: "/chat",
    icon: MessageSquare,
    title: "Chat",
    description: "Ask anything and get grounded answers with clickable citations from your corpus.",
  },
  {
    href: "/search",
    icon: Search,
    title: "Hybrid search",
    description: "Inspect ranked chunks and per-stage retrieval telemetry (dense, BM25, RRF, rerank).",
  },
  {
    href: "/documents",
    icon: FileText,
    title: "Documents",
    description: "Upload PDFs and manage everything indexed in your knowledge base.",
  },
];

export default function HomePage() {
  const [data, setData] = useState<HomeData>({
    health: null,
    stats: null,
    docCount: 0,
    chunkCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [health, stats, docs] = await Promise.all([
        api.health().catch(() => null),
        api.stats().catch(() => null),
        api.listDocuments().catch(() => []),
      ]);
      setData({
        health,
        stats,
        docCount: docs.length,
        chunkCount: docs.reduce((acc, d) => acc + d.chunk_count, 0),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const online = data.health?.status === "healthy";

  const stats = [
    { icon: Database, label: "Dense vectors", value: data.stats?.dense_count },
    { icon: Layers, label: "Sparse chunks", value: data.stats?.sparse_count },
    { icon: FileText, label: "Documents", value: data.docCount },
    { icon: Sparkles, label: "Total chunks", value: data.chunkCount },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* soft radial glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-14 md:px-8 md:py-20">
        {/* Hero */}
        <div className="text-center">
          <Badge
            variant="outline"
            className="mb-5 gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          >
            <span
              className={`relative flex size-2 rounded-full ${
                loading ? "bg-muted-foreground" : online ? "bg-emerald-500" : "bg-destructive"
              }`}
            >
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                  loading ? "bg-muted-foreground/40" : online ? "bg-emerald-500" : "bg-destructive"
                }`}
              />
            </span>
            {loading
              ? "Checking backend…"
              : online
                ? "Backend connected"
                : "Backend offline"}
          </Badge>

          <BrandLogo linked className="mx-auto mb-8 aspect-[3/2] w-full max-w-[360px]" />
          <p className="mt-2 text-lg text-muted-foreground">
            Document intelligence, grounded in your own corpus. Ask questions and
            get answers you can trust — every claim backed by a citation.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6">
              <Link href="/chat">
                Start asking
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6">
              <Link href="/documents">Upload documents</Link>
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            : stats.map(({ icon: Icon, label, value }) => (
                <Card key={label}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-2xl font-semibold leading-none">
                        {value?.toLocaleString() ?? "—"}
                      </div>
                      <div className="mt-1 truncate text-xs text-muted-foreground">
                        {label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Pipeline */}
        <div className="mt-16">
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Behind the scenes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              How ClauseLens turns documents into grounded answers
            </p>
          </div>
          <PipelineDiagram />
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link key={f.href} href={f.href}>
                <Card className="group h-full transition-colors hover:bg-accent/50">
                  <CardContent className="flex h-full flex-col justify-between gap-4 p-5">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        {f.title}
                        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        {f.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="mt-12 text-center text-xs text-muted-foreground">
          ClauseLens hybrid RAG · dense + BM25 + RRF + cross-encoder reranking
        </p>
      </div>
    </div>
  );
}
