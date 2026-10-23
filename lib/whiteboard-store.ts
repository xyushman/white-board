"use client";

import { create } from "zustand";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

type AppState = Record<string, unknown>;

type WhiteboardStore = {
  boardId: string | null;
  title: string;
  api: ExcalidrawImperativeAPI | null;
  saving: boolean;
  lastSavedAt: number | null;
  dirty: boolean;
  favorited: boolean;
  shareToken: string | null;
  setBoardId: (id: string | null) => void;
  setTitle: (title: string) => void;
  setApi: (api: ExcalidrawImperativeAPI | null) => void;
  markDirty: () => void;
  setSaving: (saving: boolean) => void;
  setSaved: () => void;
  setFavorited: (favorited: boolean) => void;
  setShareToken: (shareToken: string | null) => void;
  exporting: boolean;
  setExporting: (exporting: boolean) => void;
  aiRunning: boolean;
  setAiRunning: (aiRunning: boolean) => void;
};

export const useWhiteboardStore = create<WhiteboardStore>((set) => ({
  boardId: null,
  title: "Untitled board",
  api: null,
  saving: false,
  lastSavedAt: null,
  dirty: false,
  favorited: false,
  shareToken: null,
  setBoardId: (boardId) => set({ boardId }),
  setTitle: (title) => set({ title }),
  setApi: (api) => set({ api }),
  markDirty: () => set({ dirty: true }),
  setSaving: (saving) => set({ saving }),
  setSaved: () =>
    set({ saving: false, dirty: false, lastSavedAt: Date.now() }),
  setFavorited: (favorited) => set({ favorited }),
  setShareToken: (shareToken) => set({ shareToken }),
  exporting: false,
  setExporting: (exporting) => set({ exporting }),
  aiRunning: false,
  setAiRunning: (aiRunning) => set({ aiRunning }),
}));

export type { AppState };

