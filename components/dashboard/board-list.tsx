"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Loader2,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesDialog } from "@/components/dashboard/templates";
import { useUserStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { BoardSummary } from "@/lib/types";

type Scope = "active" | "archived" | "trashed";

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function BoardListInner() {
  const router = useRouter();
  const setCredit = useUserStore((s) => s.setCredit);
  const scopeRef = useRef<Scope>("active");
  const [scope, setScopeState] = useState<Scope>("active");
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const setScope = useCallback((next: Scope) => {
    scopeRef.current = next;
    setBoards(null);
    setScopeState(next);
  }, []);

  const fetchBoards = useCallback(async (nextScope: Scope) => {
    try {
      const res = await fetch(`/api/boards?scope=${nextScope}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setBoards(data.boards);
      if (typeof data.credit === "number") setCredit(data.credit);
      setError(null);
    } catch {
      setBoards([]);
      setError(
        "Could not reach the database. Add DATABASE_URL to .env.local to load boards.",
      );
    }
  }, [setCredit]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!cancelled) await fetchBoards(scope);
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, fetchBoards]);

  async function createBoard() {
    setCreating(true);
    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled board" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error ?? "Could not create a board.");
      }
      if (typeof data.credit === "number") setCredit(data.credit);
      router.push(`/board/${data.board.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not create a board. Check your database connection.",
      );
      setCreating(false);
    }
  }

  async function act(id: string, action: "archive" | "unarchive" | "restore") {
    setBoards((prev) => prev?.filter((b) => b.id !== id) ?? prev);
    await fetch(`/api/boards/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    void fetchBoards(scopeRef.current);
  }

  async function remove(id: string, permanent: boolean) {
    setBoards((prev) => prev?.filter((b) => b.id !== id) ?? prev);
    await fetch(`/api/boards/${id}${permanent ? "?permanent=1" : ""}`, {
      method: "DELETE",
    });
    void fetchBoards(scopeRef.current);
  }

  const filteredBoards = useMemo(() => {
    if (!boards) return null;
    let list = boards;
    if (showFavorites) list = list.filter((b) => b.favorited);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((b) => b.title.toLowerCase().includes(q));
    }
    return list;
  }, [boards, query, showFavorites]);

  const emptyCopy: Record<Scope, string> = {
    active: "No boards yet. Create your first whiteboard to get started.",
    archived: "Nothing archived.",
    trashed: "Trash is empty.",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40">
            Workspace
          </p>
          <h1 className="mt-2 text-4xl font-medium tracking-[-0.04em] md:text-5xl">
            Your boards
          </h1>
          <p className="mt-2 text-sm text-black/60">
            Every board autosaves and is AI-ready.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TemplatesDialog />
          <Button
            onClick={createBoard}
            disabled={creating}
            className="h-9 rounded-full bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-[#d12a1e]"
          >
            {creating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            New board
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-0 h-px bg-[#dadada]" />
        <Tabs value={scope} onValueChange={(v) => setScope(v as Scope)} className="pt-4">
          <TabsList className="h-8 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="active"
              className="rounded-none px-3 text-sm text-black/50 data-[state=active]:text-black data-[state=active]:shadow-[inset_0_-1px_0_0_black]"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className="rounded-none px-3 text-sm text-black/50 data-[state=active]:text-black data-[state=active]:shadow-[inset_0_-1px_0_0_black]"
            >
              Archived
            </TabsTrigger>
            <TabsTrigger
              value="trashed"
              className="rounded-none px-3 text-sm text-black/50 data-[state=active]:text-black data-[state=active]:shadow-[inset_0_-1px_0_0_black]"
            >
              Trash
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {error ? (
        <div className="relative px-0 py-4 text-sm text-black">
          <div className="absolute left-0 right-0 top-0 h-px bg-[#d12a1e]" />
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-black/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search boards"
            className="h-9 w-full rounded-full border border-black/15 bg-white pl-8 pr-3 text-sm outline-none transition-colors focus:border-black/40"
          />
        </div>
        <Button
          variant={showFavorites ? "default" : "outline"}
          size="sm"
          onClick={() => setShowFavorites((v) => !v)}
          className={cn("rounded-full", showFavorites ? "bg-black text-white hover:bg-[#d12a1e]" : "border-black/20")}
        >
          <Star className={cn("size-3.5", showFavorites ? "fill-white" : "")} />
          Favorites
        </Button>
      </div>

      {boards === null ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : filteredBoards && filteredBoards.length === 0 ? (
        <div className="relative px-0 py-12 text-center text-sm text-black/60">
          <div className="absolute left-0 right-0 top-0 h-px bg-[#dadada]" />
          {showFavorites || query.trim() ? "No boards match your filters." : emptyCopy[scope]}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(filteredBoards ?? []).map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              scope={scope}
              onArchive={() => act(board.id, "archive")}
              onUnarchive={() => act(board.id, "unarchive")}
              onRestore={() => act(board.id, "restore")}
              onTrash={() => remove(board.id, false)}
              onDelete={() => remove(board.id, true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BoardCard({
  board,
  scope,
  onArchive,
  onUnarchive,
  onRestore,
  onTrash,
  onDelete,
}: {
  board: BoardSummary;
  scope: Scope;
  onArchive: () => void;
  onUnarchive: () => void;
  onRestore: () => void;
  onTrash: () => void;
  onDelete: () => void;
}) {
  const isActive = scope === "active";

  return (
    <div className="group relative overflow-hidden rounded-none border border-[#dadada] bg-white transition-colors hover:border-black">
      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {scope === "active" ? (
              <>
                <DropdownMenuItem render={<Link href={`/board/${board.id}`} />}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="size-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onTrash}>
                  <Trash2 className="size-4" />
                  Move to trash
                </DropdownMenuItem>
              </>
            ) : scope === "archived" ? (
              <DropdownMenuItem onClick={onUnarchive}>
                <ArchiveRestore className="size-4" />
                Unarchive
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={onRestore}>
                  <RotateCcw className="size-4" />
                  Restore
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 className="size-4" />
                  Delete forever
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/board/${board.id}`} className="block">
        <div className="flex h-32 items-center justify-center border-b border-[#dadada] bg-[repeating-linear-gradient(45deg,transparent,transparent_12px,rgba(0,0,0,0.015)_12px,rgba(0,0,0,0.015)_24px)]">
          {board.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={board.thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-mono text-xs text-black/40">
              empty canvas
            </span>
          )}
        </div>
        <div className="space-y-1 p-3">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-black">
              {board.title}
            </p>
            {board.favorited ? <Star className="size-3.5 fill-[#d12a1e] text-[#d12a1e]" /> : null}
            {board.archived && !isActive ? (
              <Badge variant="secondary" className="shrink-0 text-[10px] rounded-full">
                archived
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-black/50">
            edited {relativeTime(board.updatedAt)}
          </p>
        </div>
      </Link>
    </div>
  );
}

export function BoardList() {
  return <BoardListInner />;
}
