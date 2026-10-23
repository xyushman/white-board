"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AI_TOOLS } from "@/lib/ai-tools";

type Template = {
  id: string;
  title: string;
  description: string;
  tool: string;
  prompt: string;
  tag: string;
};

const TEMPLATES: Template[] = [
  {
    id: "retro",
    title: "Sprint retro",
    description: "What went well, what didn't, and action items.",
    tool: "mindmap",
    prompt:
      "Create a sprint retrospective board with three columns: Went well, Didn't go well, Action items. Add 3 short sticky-note style items per column.",
    tag: "Teams",
  },
  {
    id: "flow",
    title: "User onboarding flow",
    description: "Step-by-step signup and activation journey.",
    tool: "flowchart",
    prompt:
      "Create an onboarding flow from landing page to activation. Include decision points for email verification and empty states.",
    tag: "Product",
  },
  {
    id: "architecture",
    title: "System architecture",
    description: "Layered services, data flow, and boundaries.",
    tool: "architecture",
    prompt:
      "Create a scalable web app architecture with a client, API gateway, auth service, application services, queue, and primary database. Label data flow arrows.",
    tag: "Engineering",
  },
  {
    id: "wireframe",
    title: "Landing page wireframe",
    description: "A clean desktop layout to iterate on.",
    tool: "web-mockup",
    prompt:
      "Create a low-fidelity desktop landing page wireframe with a nav bar, hero headline, primary CTA, feature cards, and footer.",
    tag: "Design",
  },
  {
    id: "mindmap",
    title: "Idea mind map",
    description: "Branch a single idea into themes and next steps.",
    tool: "mindmap",
    prompt:
      "Create a mind map starting from a central product idea, branching into audience, value, channels, and risks.",
    tag: "Strategy",
  },
  {
    id: "mobile",
    title: "Mobile app screen",
    description: "Phone frame with navigation and content blocks.",
    tool: "mobile-mockup",
    prompt:
      "Create a low-fidelity mobile screen for a dashboard app with a status bar, summary cards, and bottom navigation.",
    tag: "Design",
  },
];

export function TemplatesDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(template: Template) {
    setCreatingId(template.id);
    setError(null);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: template.title }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.board?.id) {
        throw new Error(data?.error ?? "Could not create a board.");
      }
      const tool = AI_TOOLS.find((t) => t.id === template.tool)?.id ?? "diagram";
      const query = new URLSearchParams({ template: tool, prompt: template.prompt });
      setOpen(false);
      router.push(`/board/${data.board.id}?${query.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create a board.");
      setCreatingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="h-9 rounded-full border-black/20 px-5 text-sm font-medium"
          />
        }
      >
        <LayoutTemplate className="size-4" />
        Templates
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-none border border-black bg-white p-0">
        <DialogHeader className="border-b border-black/10 px-5 py-4">
          <DialogTitle className="text-lg font-medium tracking-tight">
            Start from a template
          </DialogTitle>
          <DialogDescription className="text-xs text-black/60">
            Pick a starting point, then the AI helper drafts it on a fresh board.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] gap-0 overflow-y-auto sm:grid-cols-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => start(template)}
              disabled={creatingId !== null}
              className="group flex flex-col items-start gap-2 border-b border-black/10 px-5 py-4 text-left transition-colors hover:bg-[#f7f7f7] disabled:opacity-60 sm:[&:nth-child(odd)]:border-r"
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
                {template.tag}
              </span>
              <span className="flex w-full items-center justify-between gap-2 text-sm font-medium">
                {template.title}
                {creatingId === template.id ? (
                  <Loader2 className="size-4 shrink-0 animate-spin" />
                ) : (
                  <span className="size-1.5 shrink-0 rounded-full bg-[#d12a1e] opacity-0 transition-opacity group-hover:opacity-100" />
                )}
              </span>
              <span className="text-xs leading-relaxed text-black/60">
                {template.description}
              </span>
            </button>
          ))}
        </div>
        {error ? (
          <p className="border-t border-[#d12a1e] px-5 py-3 text-xs text-black">
            {error}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
