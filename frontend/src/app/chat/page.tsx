"use client";

import { Suspense } from "react";
import { Chat } from "@/components/chat/chat";

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
          Loading chat…
        </div>
      }
    >
      <Chat />
    </Suspense>
  );
}
