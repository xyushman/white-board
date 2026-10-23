"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "What exactly is an AI credit?",
    a: "One credit = one AI-generated scene. Each prompt produces a full diagram, flowchart, architecture map, web/mobile mockup, or mindmap drawn directly onto your canvas.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. It runs entirely in your browser on an infinite Excalidraw-powered canvas. Sign in and start drawing in seconds.",
  },
  {
    q: "Can I edit what the AI generates?",
    a: "Always. AI output is just regular canvas elements — every shape, label, and arrow is fully editable, movable, and restyleable by hand.",
  },
  {
    q: "Where are my boards stored?",
    a: "Boards autosave to the cloud as you work. Archive or trash them anytime, and restore anything you delete from the trash.",
  },
  {
    q: "Can I export my work?",
    a: "Yes — export any board as a crisp, high-resolution PNG in one click, ready for docs, decks, or tickets.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
      )}
    </div>
  );
}

export function FaqSection() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6">
      <div className="flex flex-col items-center text-center">
        <span className="rounded-full border border-accent/30 bg-accent-soft px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-accent-ink">
          FAQ
        </span>
        <h2 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
          Questions, answered
        </h2>
      </div>
      <div className="mt-12 space-y-3">
        {FAQS.map((f) => (
          <FaqItem key={f.q} {...f} />
        ))}
      </div>
    </div>
  );
}
