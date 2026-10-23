"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Excalidraw } from "@/components/whiteboard/excalidraw-wrapper";
import { useWhiteboardStore } from "@/lib/whiteboard-store";
import { captureThumbnail } from "@/lib/export";
import type { BoardData } from "@/lib/types";

const AUTOSAVE_DELAY = 1500;

export function WhiteboardCanvas({ board }: { board: BoardData }) {
  const setApi = useWhiteboardStore((s) => s.setApi);
  const markDirty = useWhiteboardStore((s) => s.markDirty);
  const setSaving = useWhiteboardStore((s) => s.setSaving);
  const setSaved = useWhiteboardStore((s) => s.setSaved);
  const setBoardId = useWhiteboardStore((s) => s.setBoardId);
  const setTitle = useWhiteboardStore((s) => s.setTitle);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{
    elements: readonly unknown[];
    appState: Record<string, unknown>;
    files: Record<string, unknown>;
  } | null>(null);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  useEffect(() => {
    setBoardId(board.id);
    setTitle(board.title);
  }, [board.id, board.title, setBoardId, setTitle]);

  const flush = useCallback(async () => {
    const data = pending.current;
    const currentApi = apiRef.current;
    if (!data && !currentApi) return;
    pending.current = null;
    setSaving(true);
    try {
      const thumbnail = currentApi
        ? await captureThumbnail(currentApi)
        : null;
      await fetch(`/api/boards/${board.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elements: data?.elements ?? [],
          appState: data?.appState ?? {},
          files: data?.files ?? {},
          ...(thumbnail ? { thumbnail } : {}),
        }),
      });
      setSaved();
    } catch {
      setSaving(false);
    }
  }, [board.id, setSaved, setSaving]);

  const handleChange = useCallback(
    (
      elements: readonly unknown[],
      appState: Record<string, unknown>,
      files: Record<string, unknown>,
    ) => {
      void appState;
      pending.current = { elements, appState: {}, files };
      markDirty();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void flush();
      }, AUTOSAVE_DELAY);
    },
    [flush, markDirty],
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      void flush();
    };
  }, [flush]);

  const handleApi = useCallback(
    (api: ExcalidrawImperativeAPI) => {
      apiRef.current = api;
      setApi(api);
      if (board.elements.length > 0) {
        api.updateScene({
          elements: board.elements as never,
        });
      }
      if (Object.keys(board.files).length > 0) {
        api.addFiles(Object.values(board.files) as never);
      }
      api.scrollToContent(undefined, { fitToContent: true });
    },
    [board.elements, board.files, setApi],
  );

  return (
    <div className="relative h-full w-full">
      <Excalidraw
        excalidrawAPI={handleApi}
        theme="light"
        initialData={{
          elements: board.elements as never,
          appState: {
            ...(board.appState as Record<string, unknown>),
            collaborators: new Map(),
          } as never,
          files: board.files as never,
          scrollToContent: true,
        }}
        onChange={handleChange}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            export: false,
          },
        }}
      />
    </div>
  );
}
