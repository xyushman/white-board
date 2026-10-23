"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download, Loader2, Share2, Star } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { CreditBadge } from "@/components/dashboard/credit-badge";
import { useWhiteboardStore } from "@/lib/whiteboard-store";
import { exportBoardToPng, exportBoardToSvg, exportBoardToPdf } from "@/lib/export";
import { toast } from "sonner";

export function WorkspaceHeader() {
  const title = useWhiteboardStore((s) => s.title);
  const setTitle = useWhiteboardStore((s) => s.setTitle);
  const saving = useWhiteboardStore((s) => s.saving);
  const dirty = useWhiteboardStore((s) => s.dirty);
  const lastSavedAt = useWhiteboardStore((s) => s.lastSavedAt);
  const boardId = useWhiteboardStore((s) => s.boardId);
  const api = useWhiteboardStore((s) => s.api);
  const favorited = useWhiteboardStore((s) => s.favorited);
  const setFavorited = useWhiteboardStore((s) => s.setFavorited);
  const shareToken = useWhiteboardStore((s) => s.shareToken);
  const setShareToken = useWhiteboardStore((s) => s.setShareToken);

  const [value, setValue] = useState(title);
  const [exporting, setExporting] = useState(false);
  const [exportingType, setExportingType] = useState<"png" | "svg" | "pdf" | null>(null);
  const [sharing, setSharing] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commit(next: string) {
    const trimmed = next.trim() || "Untitled board";
    setTitle(trimmed);
    if (boardId) {
      void fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
    }
  }

  function onTitleChange(next: string) {
    setValue(next);
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = setTimeout(() => commit(next), 800);
  }

  async function handleExport(type: "png" | "svg" | "pdf") {
    setExporting(true);
    setExportingType(type);
    try {
      if (type === "svg") {
        await exportBoardToSvg(api, title);
      } else if (type === "pdf") {
        await exportBoardToPdf(api, title);
      } else {
        await exportBoardToPng(title);
      }
    } finally {
      setExporting(false);
      setExportingType(null);
    }
  }

  async function toggleFavorite() {
    if (!boardId || favoriting) return;
    setFavoriting(true);
    const next = !favorited;
    setFavorited(next);
    try {
      await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorited: next }),
      });
    } catch {
      setFavorited(!next);
    } finally {
      setFavoriting(false);
    }
  }

  async function toggleShare() {
    if (!boardId || sharing) return;
    setSharing(true);
    try {
      if (shareToken) {
        await fetch(`/api/boards/${boardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ share: "disable" }),
        });
        setShareToken(null);
        toast.success("Sharing disabled");
      } else {
        const res = await fetch(`/api/boards/${boardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ share: "enable" }),
        });
        const data = await res.json();
        if (data?.board?.shareToken) {
          setShareToken(data.board.shareToken);
          const url = `${window.location.origin}/share/${data.board.shareToken}`;
          await navigator.clipboard.writeText(url);
          toast.success("Share link copied");
        }
      }
    } catch {
      toast.error("Failed to update sharing");
    } finally {
      setSharing(false);
    }
  }

  async function copyShareLink() {
    if (!shareToken) return;
    const url = `${window.location.origin}/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    toast.success("Share link copied");
  }

  const status = saving
    ? "Saving…"
    : dirty
      ? "Unsaved changes"
      : lastSavedAt
        ? "Saved"
        : null;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-black/10 bg-white px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/dashboard"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <input
          value={value}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={() => commit(value)}
          className="min-w-0 max-w-[40vw] truncate rounded-md bg-transparent px-2 py-1 text-sm font-medium text-black outline-none hover:bg-black/5 focus:bg-black/5"
          aria-label="Board title"
        />
        {status ? (
          <span className="flex items-center gap-1 text-xs text-black/50">
            {saving ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3" />
            )}
            {status}
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon-sm" onClick={toggleFavorite} disabled={favoriting} aria-label="Favorite">
          <Star className={`size-4 ${favorited ? "fill-[#d12a1e] text-[#d12a1e]" : "text-black/60"}`} />
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleShare} disabled={sharing}>
          {sharing ? <Loader2 className="size-3.5 animate-spin" /> : <Share2 className="size-3.5" />}
          {shareToken ? "Unshare" : "Share"}
        </Button>
        {shareToken ? (
          <Button variant="ghost" size="icon-sm" onClick={copyShareLink} aria-label="Copy share link">
            <Copy className="size-4" />
          </Button>
        ) : null}
        <CreditBadge />
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => handleExport("png")} disabled={exporting} className="rounded-full border-black/20">
            {exporting && exportingType === "png" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("svg")} disabled={exporting} className="rounded-full border-black/20">
            {exporting && exportingType === "svg" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            SVG
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={exporting} className="rounded-full border-black/20">
            {exporting && exportingType === "pdf" ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
            PDF
          </Button>
        </div>
      </div>
    </header>
  );
}

