import { withAuth } from "@/lib/api/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const updateExperienceSchema = z.object({
  title: z.string().min(1, "Le titre est requis").optional(),
  slug: z.string().min(1, "Le slug est requis").optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  price: z.number().nonnegative().optional().nullable(),
  duration: z.string().optional(),
  location: z.string().optional(),
  cityId: z.string().optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  category: z.string().optional(),
  hostName: z.string().optional(),
  hostPhoto: z.string().optional(),
  photos: z.array(z.string()).optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        city: true,
      },
    });

    if (!experience) {
      throw new ApiError("Exp\u00e9rience introuvable", 404);
    }

    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateExperienceSchema.parse(body);

    const existing = await prisma.experience.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Exp\u00e9rience introuvable", 404);
    }

    // Check slug uniqueness if changed
    if (data.slug && data.slug !== existing.slug) {
      const duplicate = await prisma.experience.findUnique({
        where: { slug: data.slug },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ApiError(
          "Une exp\u00e9rience avec ce slug existe d\u00e9j\u00e0",
          409
        );
      }
    }

    const experience = await prisma.experience.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const experience = await prisma.experience.findUnique({
      where: { id },
    });

    if (!experience) {
      throw new ApiError("Exp\u00e9rience introuvable", 404);
    }

    await prisma.experience.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Exp\u00e9rience supprim\u00e9e",
    });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
