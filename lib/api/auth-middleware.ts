import { auth } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { ApiError, handleApiError } from "./errors";

type AuthLevel = "public" | "viewer" | "agent" | "admin";

const hierarchy: Record<UserRole, number> = {
  VIEWER: 0,
  AGENT: 1,
  ADMIN: 2,
};

const levelToRole: Record<Exclude<AuthLevel, "public">, UserRole> = {
  viewer: "VIEWER",
  agent: "AGENT",
  admin: "ADMIN",
};

type RouteHandler = (
  req: NextRequest,
  context: {
    params: Promise<Record<string, string>>;
    user: { id: string; role: UserRole; agencyId: string | null };
  }
) => Promise<NextResponse>;

export function withAuth(handler: RouteHandler, level: AuthLevel = "viewer") {
  return async (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ) => {
    try {
      if (level === "public") {
        return handler(req, {
          ...context,
          user: { id: "", role: "VIEWER", agencyId: null },
        });
      }

      const session = await auth();
      if (!session?.user) {
        throw new ApiError("Unauthorized", 401);
      }

      const requiredRole = levelToRole[level];
      if (hierarchy[session.user.role] < hierarchy[requiredRole]) {
        throw new ApiError("Forbidden", 403);
      }

      return handler(req, {
        ...context,
        user: {
          id: session.user.id,
          role: session.user.role,
          agencyId: session.user.agencyId,
        },
      });
    } catch (error) {
      return handleApiError(error);
    }
  };
}
