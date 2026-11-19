"use client";

import { Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { Citation } from "@/lib/api";

export function CitationChip({ citation }: { citation: Citation }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="xs"
          variant="secondary"
          className="mx-0.5 inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full px-1.5 align-baseline text-[11px] font-bold leading-none shadow-none hover:bg-accent"
        >
          {citation.citation_id}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Quote className="mt-0.5 size-4 shrink-0 text-primary" />
            <blockquote className="border-l-2 border-primary pl-3 text-[13px] leading-relaxed text-muted-foreground italic">
              “{citation.verbatim_quote}”
            </blockquote>
          </div>
          <Separator />
          <div className="space-y-0.5 text-xs">
            <p className="font-medium text-foreground">{citation.doc_name}</p>
            <p className="text-muted-foreground">
              Page {citation.page_number} · {citation.section_path}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
