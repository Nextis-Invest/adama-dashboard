import { withAuth } from "@/lib/api/auth-middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  icon: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  links: z
    .array(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        href: z.string().optional(),
        order: z.number().int().default(0),
      })
    )
    .optional(),
});

// GET all categories with links (admin)
export const GET = withAuth(async () => {
  try {
    const categories = await prisma.destinationCategory.findMany({
      include: {
        links: { orderBy: { order: "asc" } },
        _count: { select: { links: true } },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

// POST create category with optional links
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const data = createCategorySchema.parse(body);

    const { links, ...categoryData } = data;

    const category = await prisma.destinationCategory.create({
      data: {
        ...categoryData,
        links: links
          ? { create: links }
          : undefined,
      },
      include: { links: true },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
