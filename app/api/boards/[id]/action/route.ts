import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { getBoard } from "@/lib/boards";
import { UnauthorizedError, getDbUserOrUpsert } from "@/lib/user";

type RouteContext = { params: Promise<{ id: string }> };
type ActionBody = { action?: "archive" | "unarchive" | "restore" };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = await getDbUserOrUpsert();
    const board = await getBoard(user.id, id);
    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as ActionBody;
    const action = body.action;
    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    const update: Partial<typeof schema.whiteboards.$inferInsert> = {
      updatedAt: new Date(),
    };
    if (action === "archive") update.archivedAt = new Date();
    if (action === "unarchive") update.archivedAt = null;
    if (action === "restore") {
      update.deletedAt = null;
      update.archivedAt = null;
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
    console.error("POST /api/boards/[id]/action failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
