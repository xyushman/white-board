import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { getBoard } from "@/lib/boards";
import { UnauthorizedError, getDbUserOrUpsert } from "@/lib/user";
import { randomUUID } from "crypto";

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  title?: string;
  elements?: unknown[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
  thumbnail?: string | null;
  favorited?: boolean;
  share?: "enable" | "disable";
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = await getDbUserOrUpsert();
    const board = await getBoard(user.id, id);
    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as PatchBody;
    const update: Partial<typeof schema.whiteboards.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (typeof body.title === "string" && body.title.trim()) {
      update.title = body.title.trim().slice(0, 120);
    }
    if (Array.isArray(body.elements)) update.elements = body.elements;
    if (body.appState && typeof body.appState === "object") {
      update.appState = body.appState;
    }
    if (body.files && typeof body.files === "object") update.files = body.files;
    if (body.thumbnail !== undefined) update.thumbnail = body.thumbnail;
    if (typeof body.favorited === "boolean") update.favorited = body.favorited;
    if (body.share === "enable" && !board.shareToken) {
      update.shareToken = randomUUID().replace(/-/g, "");
    }
    if (body.share === "disable") {
      update.shareToken = null;
    }

    const db = getDb();
    const [updated] = await db
      .update(schema.whiteboards)
      .set(update)
      .where(
        and(
          eq(schema.whiteboards.id, id),
          eq(schema.whiteboards.userId, user.id),
        ),
      )
      .returning();

    return NextResponse.json({
      board: {
        id: updated.id,
        title: updated.title,
        thumbnail: updated.thumbnail ?? null,
        favorited: updated.favorited ?? false,
        shareToken: updated.shareToken ?? null,
        archived: updated.archivedAt !== null,
        deleted: updated.deletedAt !== null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /api/boards/[id] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = await getDbUserOrUpsert();
    const board = await getBoard(user.id, id);
    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const permanent = new URL(request.url).searchParams.get("permanent") === "1";
    const db = getDb();

    if (permanent) {
      await db
        .delete(schema.whiteboards)
        .where(
          and(
            eq(schema.whiteboards.id, id),
            eq(schema.whiteboards.userId, user.id),
          ),
        );
      return NextResponse.json({ ok: true });
    }

    const [updated] = await db
      .update(schema.whiteboards)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(schema.whiteboards.id, id),
          eq(schema.whiteboards.userId, user.id),
        ),
      )
      .returning();

    return NextResponse.json({
      board: {
        id: updated.id,
        title: updated.title,
        thumbnail: updated.thumbnail ?? null,
        favorited: updated.favorited ?? false,
        archived: updated.archivedAt !== null,
        deleted: updated.deletedAt !== null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /api/boards/[id] failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

