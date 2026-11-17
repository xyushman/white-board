import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { and, eq, gt, sql } from "drizzle-orm";
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
const MAX_PROMPT_LENGTH = 4000;

// ponytail: simple in-memory sliding-window rate limiter per userId.
// Ceiling: resets on deploy / restart. Upgrade to Redis if running multi-instance.
const aiRateMap = new Map<string, number[]>();
const AI_RATE_LIMIT = 10; // requests
const AI_RATE_WINDOW_MS = 60_000; // per minute

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const timestamps = (aiRateMap.get(userId) ?? []).filter(
    (t) => now - t < AI_RATE_WINDOW_MS,
  );
  if (timestamps.length >= AI_RATE_LIMIT) {
    aiRateMap.set(userId, timestamps);
    return true;
  }
  timestamps.push(now);
  aiRateMap.set(userId, timestamps);
  return false;
}

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
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
  if (userInput.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Prompt is too long (max ${MAX_PROMPT_LENGTH} characters).` },
      { status: 400 },
    );
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not configured.");
    return NextResponse.json(
      { error: "AI generation is temporarily unavailable." },
      { status: 503 },
    );
  }

  // Atomic credit decrement — deduct BEFORE calling Gemini so concurrent
  // requests can't both pass the balance check.
  const db = getDb();
  const [deducted] = await db
    .update(users)
    .set({ credit: sql`${users.credit} - 1` })
    .where(and(eq(users.id, userId), gt(users.credit, 0)))
    .returning({ credit: users.credit });

  if (!deducted) {
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
      // Refund the credit on model failure.
      await db
        .update(users)
        .set({ credit: sql`${users.credit} + 1` })
        .where(eq(users.id, userId));
      return NextResponse.json(
        { error: "The model returned an empty response." },
        { status: 502 },
      );
    }

    const diagram = JSON.parse(text) as DiagramResult;
    if (!diagram.nodes?.length) {
      await db
        .update(users)
        .set({ credit: sql`${users.credit} + 1` })
        .where(eq(users.id, userId));
      return NextResponse.json(
        { error: "The model did not produce any nodes. Try a more specific prompt." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      diagram,
      credit: deducted.credit,
    });
  } catch (err) {
    // Refund on failure so users aren't charged for errors.
    await db
      .update(users)
      .set({ credit: sql`${users.credit} + 1` })
      .where(eq(users.id, userId))
      .catch(() => {}); // best-effort refund

    console.error("AI generation failed:", err);
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 500 },
    );
  }
}
