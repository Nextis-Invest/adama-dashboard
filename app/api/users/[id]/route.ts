import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { hash } from "bcryptjs";
import { ApiError, handleApiError } from "@/lib/api/errors";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "AGENT", "VIEWER"]).optional(),
  agencyId: z.string().optional().nullable(),
});

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        agencyId: true,
        agency: { select: { name: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.password = await hash(data.password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        agencyId: true,
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
