"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import "@excalidraw/excalidraw/index.css";
import type { BoardData } from "@/lib/types";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false },
);

type SharedBoard = Pick<BoardData, "id" | "title" | "elements" | "appState" | "files">;

export function SharedWhiteboard({ board }: { board: SharedBoard }) {
  return (
    <div className="flex h-screen w-full flex-col bg-white">
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-[#dadada] bg-white px-4">
        <div className="flex items-center gap-2">
          <span className="relative inline-flex h-[9px] w-[9px]">
            <span className="absolute inset-0 rounded-full bg-black" />
            <span className="absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d12a1e]" />
          </span>
          <span className="text-sm font-medium">{board.title}</span>
          <span className="text-xs text-black/50">Read-only</span>
        </div>
        <Link href="/" className="text-xs text-black/60 transition-colors hover:text-black">
          Create your own board
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        <Excalidraw
          initialData={{
            elements: board.elements as never,
            appState: {
              ...(board.appState as Record<string, unknown>),
              viewBackgroundColor: "#ffffff",
            } as never,
            files: board.files as never,
          }}
          viewModeEnabled
          theme="light"
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              export: false,
              saveAsImage: false,
            },
          }}
        />
      </div>
    </div>
  );
}

