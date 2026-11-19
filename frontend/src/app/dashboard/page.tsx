"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  FileText,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type HealthStatus, type IndexStats } from "@/lib/api";

interface DashboardData {
  health: HealthStatus | null;
  stats: IndexStats | null;
  docCount: number;
  chunkCount: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Database;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
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

  const refresh = () => {
    setLoading(true);
    void load();
  };

  const online = data.health?.status === "healthy";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Index health and corpus overview
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Status banner */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span
              className={`relative flex size-3 rounded-full ${
                loading
                  ? "bg-muted-foreground/50"
                  : online
                    ? "bg-emerald-500"
                    : "bg-destructive"
              }`}
            >
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                  loading
                    ? "bg-muted-foreground/40"
                    : online
                      ? "bg-emerald-500"
                      : "bg-destructive"
                }`}
              />
            </span>
            <div>
              <div className="text-sm font-medium">
                {loading
                  ? "Checking backend…"
                  : online
                    ? "Backend online"
                    : "Backend unreachable"}
              </div>
              <div className="text-xs text-muted-foreground">
                {data.health
                  ? `${data.health.service} · ${data.health.timestamp.slice(0, 19)}Z`
                  : "Start uvicorn backend.src.api.main:app --port 8000"}
              </div>
            </div>
          </div>
          <div className="sm:ml-auto">
            <Badge variant={online ? "default" : "destructive"}>
              {online ? "Healthy" : "Offline"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatCard
              icon={Database}
              label="Dense vectors"
              value={data.stats?.dense_count?.toLocaleString() ?? "—"}
              hint="ChromaDB embeddings"
            />
            <StatCard
              icon={Layers}
              label="Sparse chunks"
              value={data.stats?.sparse_count?.toLocaleString() ?? "—"}
              hint="BM25 keyword index"
            />
            <StatCard
              icon={FileText}
              label="Documents"
              value={data.docCount.toLocaleString()}
              hint="Indexed files"
            />
            <StatCard
              icon={Sparkles}
              label="Total chunks"
              value={data.chunkCount.toLocaleString()}
              hint="Across all documents"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Quick actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link href="/chat">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="size-5" />
              </div>
              <div>
                <div className="font-medium">Ask questions</div>
                <p className="text-sm text-muted-foreground">
                  Start a grounded conversation
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/search">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Search className="size-5" />
              </div>
              <div>
                <div className="font-medium">Hybrid search</div>
                <p className="text-sm text-muted-foreground">
                  Explore ranked chunks and telemetry
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/documents">
          <Card className="h-full transition-colors hover:bg-accent/50">
            <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <div className="font-medium">Manage documents</div>
                <p className="text-sm text-muted-foreground">
                  Upload and review your corpus
                </p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
