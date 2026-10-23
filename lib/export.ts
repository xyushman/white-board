"use client";

import { exportToBlob, exportToSvg } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { useWhiteboardStore } from "@/lib/whiteboard-store";

export async function exportBoardToPng(
  fileName: string,
  scale = 2,
): Promise<void> {
  const api = useWhiteboardStore.getState().api;
  if (!api) return;

  const elements = api.getSceneElements();
  const files = api.getFiles();
  const appState = api.getAppState();

  const blob = await exportToBlob({
    elements,
    files,
    appState: {
      ...appState,
      exportWithDarkMode: false,
      exportBackground: true,
    },
    mimeType: "image/png",
    quality: 1,
    exportPadding: 24,
    getDimensions: (width: number, height: number) => ({
      width: width * scale,
      height: height * scale,
      scale,
    }),
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.replace(/[^\w.-]+/g, "_") || "board"}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportBoardToSvg(
  api: ExcalidrawImperativeAPI | null,
  fileName: string,
): Promise<void> {
  const excalidrawApi = api ?? useWhiteboardStore.getState().api;
  if (!excalidrawApi) return;

  const elements = excalidrawApi.getSceneElements();
  const files = excalidrawApi.getFiles();
  const appState = excalidrawApi.getAppState();

  const svg = await exportToSvg({
    elements,
    files,
    appState: {
      ...appState,
      exportWithDarkMode: false,
      exportBackground: true,
    },
    exportPadding: 24,
  });

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName.replace(/[^\w.-]+/g, "_") || "board"}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportBoardToPdf(
  api: ExcalidrawImperativeAPI | null,
  fileName: string,
): Promise<void> {
  const excalidrawApi = api ?? useWhiteboardStore.getState().api;
  if (!excalidrawApi) return;

  const elements = excalidrawApi.getSceneElements();
  const files = excalidrawApi.getFiles();
  const appState = excalidrawApi.getAppState();

  const blob = await exportToBlob({
    elements,
    files,
    appState: {
      ...appState,
      exportWithDarkMode: false,
      exportBackground: true,
    },
    mimeType: "image/png",
    quality: 1,
    exportPadding: 24,
    getDimensions: (width: number, height: number) => ({
      width: width * 2,
      height: height * 2,
      scale: 2,
    }),
  });

  const { jsPDF } = await import("jspdf");
  const dataUrl = await blobToDataUrl(blob);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  const pdf = new jsPDF({
    orientation: img.width >= img.height ? "landscape" : "portrait",
    unit: "px",
    format: [img.width, img.height],
  });
  pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
  pdf.save(`${fileName.replace(/[^\w.-]+/g, "_") || "board"}.pdf`);
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function captureThumbnail(
  api: ExcalidrawImperativeAPI,
): Promise<string | null> {
  const elements = api.getSceneElements().filter((el) => !el.isDeleted);
  if (elements.length === 0) return null;

  try {
    const blob = await exportToBlob({
      elements,
      files: api.getFiles(),
      appState: {
        ...api.getAppState(),
        exportWithDarkMode: false,
        exportBackground: true,
        viewBackgroundColor: "#ffffff",
      },
      mimeType: "image/png",
      quality: 0.7,
      exportPadding: 16,
      getDimensions: (width: number, height: number) => {
        const max = 400;
        const scale = Math.min(max / width, max / height, 1);
        return {
          width: Math.round(width * scale),
          height: Math.round(height * scale),
          scale,
        };
      },
    });
    return await blobToDataUrl(blob);
  } catch {
    return null;
  }
}
