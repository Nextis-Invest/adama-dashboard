import { withAuth } from "@/lib/api/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const createExperienceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  price: z.number().nonnegative().optional().nullable(),
  duration: z.string().optional().default(""),
  location: z.string().optional().default(""),
  cityId: z.string().optional().nullable(),
  maxParticipants: z.number().int().positive().optional().nullable(),
  category: z.string().optional().default(""),
  hostName: z.string().optional().default(""),
  hostPhoto: z.string().optional().default(""),
  photos: z.array(z.string()).optional().default([]),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const GET = withAuth(async (req) => {
  try {
    const experiences = await prisma.experience.findMany({
      include: {
        city: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const data = createExperienceSchema.parse(body);

    const existing = await prisma.experience.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ApiError(
        "Une exp\u00e9rience avec ce slug existe d\u00e9j\u00e0",
        409
      );
    }

    const experience = await prisma.experience.create({ data });

    return NextResponse.json(
      { success: true, data: experience },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
