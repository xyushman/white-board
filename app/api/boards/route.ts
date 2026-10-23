import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { listBoards } from "@/lib/boards";
import { UnauthorizedError, getDbUserOrUpsert } from "@/lib/user";

export async function GET(request: Request) {
  try {
    const user = await getDbUserOrUpsert();
    const scopeParam = new URL(request.url).searchParams.get("scope");
    const scope =
      scopeParam === "archived" || scopeParam === "trashed"
        ? scopeParam
        : "active";
    const boards = await listBoards(user.id, scope);
    return NextResponse.json({ boards, credit: user.credit });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/boards failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getDbUserOrUpsert();
    if (user.credit <= 0) {
      return NextResponse.json(
        {
          error:
            "You've used all your board credits. Upgrade to create more whiteboards.",
        },
        { status: 402 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      title?: string;
    };
    const title = (body.title ?? "").trim() || "Untitled board";
    const id = crypto.randomUUID();

    const db = getDb();
    const [board] = await db
      .insert(schema.whiteboards)
      .values({ id, userId: user.id, title })
      .returning();

    const [updated] = await db
      .update(schema.users)
      .set({ credit: sql`${schema.users.credit} - 1` })
      .where(eq(schema.users.id, user.id))
      .returning({ credit: schema.users.credit });

    return NextResponse.json(
      {
        board: {
          id: board.id,
          title: board.title,
          thumbnail: board.thumbnail ?? null,
          archived: false,
          deleted: false,
          createdAt: board.createdAt.toISOString(),
          updatedAt: board.updatedAt.toISOString(),
        },
        credit: updated?.credit ?? user.credit - 1,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/boards failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
