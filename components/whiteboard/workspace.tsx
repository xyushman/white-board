"use client";

import { useEffect } from "react";
import { WhiteboardCanvas } from "@/components/whiteboard/whiteboard-canvas";
import { WorkspaceHeader } from "@/components/whiteboard/workspace-header";
import { AssistantPanel } from "@/components/whiteboard/assistant-panel";
import { useUserStore } from "@/lib/store";
import { useWhiteboardStore } from "@/lib/whiteboard-store";
import type { BoardData } from "@/lib/types";

export function WhiteboardWorkspace({ board }: { board: BoardData }) {
  const setUser = useUserStore((s) => s.setUser);
  const dirty = useWhiteboardStore((s) => s.dirty);
  const setFavorited = useWhiteboardStore((s) => s.setFavorited);
  const setShareToken = useWhiteboardStore((s) => s.setShareToken);
  const setBoardId = useWhiteboardStore((s) => s.setBoardId);
  const setTitle = useWhiteboardStore((s) => s.setTitle);

  useEffect(() => {
    setBoardId(board.id);
    setTitle(board.title);
    setFavorited(Boolean((board as BoardData & { favorited?: boolean }).favorited));
    setShareToken((board as BoardData & { shareToken?: string | null }).shareToken ?? null);
  }, [board, setBoardId, setFavorited, setShareToken, setTitle]);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            credit: data.user.credit,
          });
        }
      })
      .catch(() => {});
  }, [setUser]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <WorkspaceHeader />
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <WhiteboardCanvas board={board} />
        </div>
        <AssistantPanel boardId={board.id} />
      </div>
    </div>
  );
}

