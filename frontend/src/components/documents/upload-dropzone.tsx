"use client";

import { useCallback, useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";
import { api, type IngestionResponse } from "@/lib/api";

export function UploadDropzone({ onUploaded }: { onUploaded: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [last, setLast] = useState<IngestionResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Unsupported file", {
          description: "Please select a PDF document.",
        });
        return;
      }
      setUploading(true);
      try {
        const res = await api.uploadPdf(file);
        setLast(res);
        toast.success("Document indexed", {
          description: `${res.filename} → ${res.chunk_count} chunks`,
        });
        onUploaded();
      } catch (err) {
        const detail = err instanceof Error ? err.message : "Upload failed";
        toast.error("Upload failed", { description: detail });
      } finally {
        setUploading(false);
      }
    },
    [onUploaded],
  );

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/40",
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {uploading ? (
          <Loader2 className="size-8 animate-spin text-primary" />
        ) : (
          <UploadCloud className="size-8 text-muted-foreground" />
        )}
        <div>
          <p className="text-sm font-medium">
            {uploading ? "Indexing document…" : "Drag & drop a PDF here"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or click to browse · parsed & dual-indexed automatically
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {last && (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-3 text-sm">
          <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{last.filename}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {last.page_count} pages · {last.chunk_count} chunks ·{" "}
              {last.table_count} tables
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{last.doc_id}</span>
        </div>
      )}
    </div>
  );
}
