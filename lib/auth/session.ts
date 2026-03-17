import { auth } from "./config";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  const hierarchy: Record<UserRole, number> = {
    VIEWER: 0,
    AGENT: 1,
    ADMIN: 2,
  };
  if (hierarchy[user.role] < hierarchy[role]) {
    redirect("/");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export async function requireAgent() {
  return requireRole("AGENT");
}
