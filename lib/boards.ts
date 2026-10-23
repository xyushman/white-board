import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { BoardSummary, BoardData } from "@/lib/types";

function toSummary(row: typeof schema.whiteboards.$inferSelect): BoardSummary {
  return {
    id: row.id,
    title: row.title,
    thumbnail: row.thumbnail ?? null,
    favorited: row.favorited ?? false,
    archived: row.archivedAt !== null,
    deleted: row.deletedAt !== null,
    trashed: row.deletedAt !== null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listBoards(
  userId: string,
  scope: "active" | "archived" | "trashed" = "active",
): Promise<BoardSummary[]> {
  const db = getDb();
  const base = eq(schema.whiteboards.userId, userId);

  const where =
    scope === "active"
      ? and(base, isNull(schema.whiteboards.deletedAt), isNull(schema.whiteboards.archivedAt))
      : scope === "archived"
        ? and(base, isNull(schema.whiteboards.deletedAt))
        : base;

  const rows = await db
    .select()
    .from(schema.whiteboards)
    .where(where)
    .orderBy(desc(schema.whiteboards.updatedAt));

  const summaries = rows.map(toSummary);

  if (scope === "active") {
    return summaries.filter((b) => !b.archived && !b.deleted);
  }
  if (scope === "archived") {
    return summaries.filter((b) => b.archived && !b.deleted);
  }
  return summaries.filter((b) => b.deleted);
}

export async function getBoard(
  userId: string,
  boardId: string,
): Promise<typeof schema.whiteboards.$inferSelect | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.whiteboards)
    .where(
      and(
        eq(schema.whiteboards.id, boardId),
        eq(schema.whiteboards.userId, userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function getBoardByShareToken(
  token: string,
): Promise<typeof schema.whiteboards.$inferSelect | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.whiteboards)
    .where(eq(schema.whiteboards.shareToken, token))
    .limit(1);
  return row ?? null;
}

export function boardToData(
  row: typeof schema.whiteboards.$inferSelect,
): BoardData {
  return {
    id: row.id,
    title: row.title,
    elements: (row.elements ?? []) as unknown[],
    appState: (row.appState ?? {}) as Record<string, unknown>,
    files: (row.files ?? {}) as Record<string, unknown>,
    thumbnail: row.thumbnail ?? null,
    shareToken: row.shareToken ?? null,
    favorited: row.favorited ?? false,
    updatedAt: row.updatedAt.toISOString(),
  };
}

