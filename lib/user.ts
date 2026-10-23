import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { User } from "@/db/schema";

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function upsertDbUser(): Promise<User> {
  const userId = await requireUserId();
  const clerkUser = await currentUser();

  const name =
    clerkUser?.fullName || clerkUser?.username || clerkUser?.firstName || "User";
  const email =
    clerkUser?.emailAddresses[0]?.emailAddress ??
    `${userId}@users.clerk.internal`;

  const db = getDb();
  const [user] = await db
    .insert(schema.users)
    .values({ id: userId, name, email })
    .onConflictDoUpdate({
      target: schema.users.id,
      set: { name, email },
    })
    .returning();

  return user;
}

export async function getDbUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const db = getDb();
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);
  return user ?? null;
}

export async function getDbUserOrUpsert(): Promise<User> {
  const existing = await getDbUser();
  if (existing) return existing;
  return upsertDbUser();
}
