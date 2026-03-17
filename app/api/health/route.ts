import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
      AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "missing",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "missing",
      AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "missing",
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "connected";
  } catch (e) {
    checks.database = `error: ${e instanceof Error ? e.message : String(e)}`;
  }

  try {
    const userCount = await prisma.user.count();
    checks.users = userCount;
  } catch (e) {
    checks.usersError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(checks);
}
