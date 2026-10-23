"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/lib/store";
import { useWhiteboardStore } from "@/lib/whiteboard-store";
import { AI_TOOLS, type AiTool, type DiagramResult } from "@/lib/ai-tools";
import {
  PLACEHOLDER_IDS,
  buildPlaceholderElements,
  diagramToElements,
  findEmptyCanvasPosition,
} from "@/lib/ai-canvas";

export function AssistantPanel({ boardId }: { boardId: string }) {
  void boardId;
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template");
  const initialTool =
    AI_TOOLS.find((t) => t.id === templateId) ?? AI_TOOLS[0];
  const initialPrompt = searchParams.get("prompt") ?? "";
  const [open, setOpen] = useState(Boolean(templateId || initialPrompt));
  const [tool, setTool] = useState<AiTool>(initialTool);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [pickerOpen, setPickerOpen] = useState(false);
  const api = useWhiteboardStore((s) => s.api);
  const running = useWhiteboardStore((s) => s.aiRunning);
  const setRunning = useWhiteboardStore((s) => s.setAiRunning);
  const setCredit = useUserStore((s) => s.setCredit);

  function addPlaceholder(): { x: number; y: number } | null {
    if (!api) return null;
    const current = api.getSceneElements();
    const pos = findEmptyCanvasPosition(current as unknown as Record<string, unknown>[]);
    const placeholder = buildPlaceholderElements(pos.x, pos.y);
    api.updateScene({
      elements: [...current, ...placeholder] as never,
    });
    return pos;
  }

  function removePlaceholder() {
    if (!api) return;
    const ids = Object.values(PLACEHOLDER_IDS) as string[];
    const current = api.getSceneElements();
    const filtered = current.filter(
      (el) => !ids.includes((el as { id: string }).id),
    );
    api.updateScene({ elements: filtered as never });
  }

  async function handleGenerate() {
    const value = prompt.trim();
    if (!value) {
      toast.error("Describe what you want to generate.");
      return;
    }

    setRunning(true);
    const pos = addPlaceholder();

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInput: value,
          tool: { id: tool.id, name: tool.name, prompt: tool.prompt },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "AI generation failed.");
      }

      const diagram = data.diagram as DiagramResult;
      if (typeof data.credit === "number") setCredit(data.credit);

      if (api && pos) {
        removePlaceholder();
        const elements = diagramToElements(diagram, pos.x, pos.y);
        const remaining = api.getSceneElements().filter(
          (el) =>
            !(Object.values(PLACEHOLDER_IDS) as string[]).includes(
              (el as { id: string }).id,
            ),
        );
        api.updateScene({
          elements: [...remaining, ...elements] as never,
        });
        api.scrollToContent(elements as never, { fitToContent: true });
      }

      toast.success("Diagram added to your canvas.");
      setPrompt("");
    } catch (err) {
      removePlaceholder();
      toast.error(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <>
      {open ? (
        <div className="absolute right-6 bottom-24 z-50 flex w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-none border border-black bg-white shadow-[0_40px_80px_-60px_rgba(0,0,0,0.9)]">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-[#d12a1e]" />
              </span>
              <h2 className="text-sm font-medium text-black">AI helper</h2>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-black/60 hover:bg-black/5 hover:text-black"
              aria-label="Close AI helper"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            <p className="text-xs text-black/60">
              Turn ideas into diagrams, flowcharts, and mockups in seconds.
            </p>

            <div className="relative">
              <button
                onClick={() => setPickerOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-none border border-black/10 bg-white px-3 py-2 text-left text-sm text-black hover:border-black/40"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: "#d12a1e" }}
                  />
                  {tool.name}
                </span>
                <ChevronDown className="size-4 text-black/50" />
              </button>

              {pickerOpen ? (
                <div className="absolute z-10 mt-1 w-full rounded-none border border-black bg-white p-1 shadow-xl">
                  {AI_TOOLS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTool(t);
                        setPickerOpen(false);
                      }}
                      className="flex w-full items-start gap-2 rounded-none px-2 py-2 text-left hover:bg-black/5"
                    >
                      <span
                        className="mt-1 size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "#d12a1e" }}
                      />
                      <span>
                        <span className="block text-xs font-medium text-black">
                          {t.name}
                        </span>
                        <span className="block text-[11px] text-black/60">
                          {t.description}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-black/60">
                Describe what you want to create
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. customer onboarding flow with decision points"
                rows={3}
                className="resize-none rounded-none border-black/10 bg-white text-sm text-black placeholder:text-black/40"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={running}
              className="w-full rounded-full bg-black text-white hover:bg-[#d12a1e]"
            >
              {running ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              {running ? "Generating…" : "Generate"}
            </Button>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setOpen((v) => !v)}
        className="absolute right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-medium text-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] transition hover:bg-[#d12a1e]"
      >
        <Sparkles className="size-4" />
        AI
      </button>
    </>
  );
}
