import { withAuth } from "@/lib/api/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const createCitySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  pinyin: z.string().min(1, "Le pinyin est requis"),
  province: z.string().min(1, "La province est requise"),
  isActive: z.boolean().default(true),
});

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const where = active === "true" ? { isActive: true } : {};

    const cities = await prisma.city.findMany({
      where,
      include: {
        _count: {
          select: {
            agencies: true,
            properties: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: cities });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const data = createCitySchema.parse(body);

    const existing = await prisma.city.findUnique({
      where: { name_province: { name: data.name, province: data.province } },
    });

    if (existing) {
      throw new ApiError(
        "Une ville avec ce nom existe déjà dans cette province",
        409
      );
    }

    const city = await prisma.city.create({ data });

    return NextResponse.json({ success: true, data: city }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
