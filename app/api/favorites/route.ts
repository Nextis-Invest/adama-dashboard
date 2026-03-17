import { withAuth } from "@/lib/api/auth-middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { handleApiError } from "@/lib/api/errors";

// GET - list user's favorites
export const GET = withAuth(async (req, { user }) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      select: { propertyId: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: favorites });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

const toggleSchema = z.object({
  propertyId: z.string().min(1),
});

// POST - toggle favorite
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { propertyId } = toggleSchema.parse(body);

    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, action: "removed", propertyId });
    } else {
      await prisma.favorite.create({ data: { userId: user.id, propertyId } });
      return NextResponse.json({ success: true, action: "added", propertyId });
    }
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
