import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { requireUserId } from "@/lib/user";
import {
  CANVAS_RULES,
  RESPONSE_SCHEMA,
  type AiTool,
  type DiagramResult,
} from "@/lib/ai-tools";

export const runtime = "nodejs";

type Body = {
  userInput?: string;
  tool?: Pick<AiTool, "id" | "name" | "prompt">;
  systemPrompt?: string;
};

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const userInput = (body.userInput ?? "").trim();
  if (!userInput) {
    return NextResponse.json(
      { error: "Describe what you want to generate." },
      { status: 400 },
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not configured. Add it to .env.local to enable AI generation.",
      },
      { status: 503 },
    );
  }

  const db = getDb();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (user.credit <= 0) {
    return NextResponse.json(
      { error: "Insufficient credits. You have used all of your generations." },
      { status: 402 },
    );
  }

  const systemPrompt = body.systemPrompt?.trim() || body.tool?.prompt || "";
  const finalPrompt = [
    systemPrompt,
    CANVAS_RULES,
    `User request: ${userInput}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: finalPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA as unknown as Record<string, unknown> & {
          type: Type;
        },
      },
    });

    const text = response.text;
    if (!text) {
      return NextResponse.json(
        { error: "The model returned an empty response." },
        { status: 502 },
      );
    }

    const diagram = JSON.parse(text) as DiagramResult;
    if (!diagram.nodes?.length) {
      return NextResponse.json(
        { error: "The model did not produce any nodes. Try a more specific prompt." },
        { status: 502 },
      );
    }

    const [updated] = await db
      .update(users)
      .set({ credit: sql`${users.credit} - 1` })
      .where(eq(users.id, userId))
      .returning({ credit: users.credit });

    return NextResponse.json({
      success: true,
      diagram,
      credit: updated?.credit ?? user.credit - 1,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
