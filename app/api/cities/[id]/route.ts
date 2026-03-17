import { withAuth } from "@/lib/api/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const updateCitySchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  pinyin: z.string().min(1, "Le pinyin est requis").optional(),
  province: z.string().min(1, "La province est requise").optional(),
  description: z.string().optional(),
  famousFor: z.string().optional(),
  coverImage: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            agencies: true,
            properties: true,
          },
        },
      },
    });

    if (!city) {
      throw new ApiError("Ville introuvable", 404);
    }

    return NextResponse.json({ success: true, data: city });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateCitySchema.parse(body);

    const existing = await prisma.city.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Ville introuvable", 404);
    }

    // Check uniqueness if name or province changed
    const newName = data.name ?? existing.name;
    const newProvince = data.province ?? existing.province;

    if (newName !== existing.name || newProvince !== existing.province) {
      const duplicate = await prisma.city.findUnique({
        where: { name_province: { name: newName, province: newProvince } },
      });
      if (duplicate && duplicate.id !== id) {
        throw new ApiError(
          "Une ville avec ce nom existe déjà dans cette province",
          409
        );
      }
    }

    const city = await prisma.city.update({ where: { id }, data });

    return NextResponse.json({ success: true, data: city });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            agencies: true,
            properties: true,
          },
        },
      },
    });

    if (!city) {
      throw new ApiError("Ville introuvable", 404);
    }

    if (city._count.agencies > 0 || city._count.properties > 0) {
      throw new ApiError(
        "Impossible de supprimer cette ville : des agences ou propriétés y sont rattachées",
        409
      );
    }

    await prisma.city.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Ville supprimée" });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
