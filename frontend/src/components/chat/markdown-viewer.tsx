"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CitationChip } from "./citation-popover";
import type { Citation } from "@/lib/api";

// Rewrite inline [N] citation markers as links so we can intercept them
// via the `a` component (react-markdown's `text` override is unreliable).
function toMarkdownWithCitations(content: string): string {
  return content.replace(/\[(\d+)\]/g, (_m, n) => `[${n}](#cite-${n})`);
}

export function MarkdownViewer({
  content,
  citations,
}: {
  content: string;
  citations: Citation[];
}) {
  const source = toMarkdownWithCitations(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children, ...props }) => {
          if (typeof href === "string" && href.startsWith("#cite-")) {
            const num = Number(href.slice("#cite-".length));
            const citation = citations.find((c) => c.citation_id === num);
            if (citation) return <CitationChip citation={citation} />;
            return (
              <span
                className="mx-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-muted px-1.5 align-baseline text-[11px] font-bold"
                aria-label={`citation ${num}`}
              >
                {num}
              </span>
            );
          }
          return (
            <a
              {...props}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2 hover:text-primary/80"
            >
              {children}
            </a>
          );
        },
        p: (props) => <p {...props} className="my-2 leading-7" />,
        h1: (props) => <h1 {...props} className="mt-3 mb-2 text-xl font-semibold" />,
        h2: (props) => <h2 {...props} className="mt-3 mb-2 text-lg font-semibold" />,
        h3: (props) => <h3 {...props} className="mt-2 mb-1.5 text-base font-semibold" />,
        ul: (props) => <ul {...props} className="my-2 list-disc space-y-1 pl-5" />,
        ol: (props) => <ol {...props} className="my-2 list-decimal space-y-1 pl-5" />,
        li: (props) => <li {...props} className="leading-7" />,
        blockquote: (props) => (
          <blockquote
            {...props}
            className="my-2 border-l-2 border-primary pl-3 text-muted-foreground italic"
          />
        ),
        code: (props) => (
          <code
            {...props}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
          />
        ),
        pre: (props) => (
          <pre
            {...props}
            className="my-2 overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[13px]"
          />
        ),
        table: (props) => (
          <table {...props} className="my-2 w-full border-collapse text-sm" />
        ),
        th: (props) => (
          <th
            {...props}
            className="border bg-muted px-2.5 py-1.5 text-left text-xs font-semibold"
          />
        ),
        td: (props) => <td {...props} className="border px-2.5 py-1.5" />,
        strong: (props) => <strong {...props} className="font-semibold" />,
      }}
    >
      {source}
    </ReactMarkdown>
  );
}
