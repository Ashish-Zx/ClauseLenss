"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bot, FileText, Loader2, Send, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MarkdownViewer } from "./markdown-viewer";
import { api, type RAGResponse } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  rag?: RAGResponse;
}

const SUGGESTIONS = [
  "Summarize the key points of these documents",
  "Extract the important obligations and deadlines",
  "What are the main risks or liabilities mentioned?",
];

let msgCounter = 0;
function nextId() {
  msgCounter += 1;
  return `m-${Date.now()}-${msgCounter}`;
}

export function Chat() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docFilter, setDocFilter] = useState<string | null>(
    () => searchParams.get("doc"),
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(override?: string) {
    const query = (override ?? input).trim();
    if (!query || loading) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: "user", content: query },
    ]);
    setLoading(true);
    try {
      const rag = await api.ask({
        query,
        doc_ids: docFilter ? [docFilter] : null,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: rag.answer,
          rag,
        },
      ]);
    } catch (err) {
      const detail =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error("Ask failed", {
        description: detail,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: `⚠️ Sorry, I couldn't complete that request. (${detail})`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-full min-h-dvh w-full max-w-3xl flex-col px-4 md:px-6">
      {docFilter && (
        <div className="flex items-center justify-center pt-4">
          <Badge variant="secondary" className="gap-1.5 py-1 pr-1 pl-3">
            <FileText className="size-3.5" />
            <span className="text-xs">Searching within</span>
            <span className="font-medium">{docFilter.slice(0, 8)}…</span>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setDocFilter(null)}
              aria-label="Clear document filter"
            >
              <X className="size-3" />
            </Button>
          </Badge>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-6 py-6">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
              <Sparkles className="size-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Ask your documents
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Get grounded answers with citations from your corpus — no
              hallucination, every claim backed by a source.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  variant="outline"
                  onClick={() => send(s)}
                  className="justify-start text-left"
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Bot className="size-4" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">ClauseLens</span>
                  {m.rag && (
                    <span className="text-xs text-muted-foreground">
                      {m.rag.total_latency_ms.toFixed(0)}ms ·{" "}
                      {m.rag.citations.length} citation
                      {m.rag.citations.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <div className="rounded-2xl rounded-tl-md border bg-card p-4 shadow-sm">
                  <MarkdownViewer
                    content={m.content}
                    citations={m.rag?.citations ?? []}
                  />
                  {m.rag?.unanswerable_reason && (
                    <Alert className="mt-3">
                      <AlertTitle className="text-xs font-semibold uppercase tracking-wide">
                        Not fully answerable
                      </AlertTitle>
                      <AlertDescription className="text-sm">
                        {m.rag.unanswerable_reason}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          ),
        )}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Bot className="size-4" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Retrieving evidence and generating…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t bg-background/80 py-3 backdrop-blur md:py-4">
        <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring/40">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Ask anything about your documents…"
            className="min-h-11 max-h-40 flex-1 resize-none border-0 bg-transparent !ring-0 focus-visible:ring-0"
            rows={2}
          />
          <Button
            size="icon"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Answers are grounded in your indexed documents. Enter to send,
          Shift+Enter for a new line.
        </p>
      </div>
    </div>
  );
}
