import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { agents } from "@/db/schema";

export async function POST(request) {
  // Safety check: only allow this if there are zero agents so far
  const existing = await db.select().from(agents);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Setup already completed" },
      { status: 403 },
    );
  }

  const { email, password, fullName } = await request.json();
  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [agent] = await db
    .insert(agents)
    .values({ email, passwordHash, fullName, role: "admin" })
    .returning();

  return NextResponse.json({ email: agent.email }, { status: 201 });
}
