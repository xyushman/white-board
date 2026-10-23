import { NextResponse } from "next/server";
import { UnauthorizedError, getDbUserOrUpsert, upsertDbUser } from "@/lib/user";

export async function POST() {
  try {
    const user = await upsertDbUser();
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /api/user failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getDbUserOrUpsert();
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/user failed:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
