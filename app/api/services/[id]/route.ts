import { withAuth } from "@/lib/api/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const updateServiceSchema = z.object({
  title: z.string().min(1, "Le titre est requis").optional(),
  slug: z.string().min(1, "Le slug est requis").optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new ApiError("Service introuvable", 404);
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateServiceSchema.parse(body);

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Service introuvable", 404);
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await prisma.service.findUnique({
        where: { slug: data.slug },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ApiError(
          "Un service avec ce slug existe déjà",
          409
        );
      }
    }

    const service = await prisma.service.update({ where: { id }, data });

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      throw new ApiError("Service introuvable", 404);
    }

    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Service supprimé" });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
