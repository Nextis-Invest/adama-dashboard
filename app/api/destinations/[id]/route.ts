import { withAuth } from "@/lib/api/auth-middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  links: z
    .array(
      z.object({
        id: z.string().optional(), // existing link to update
        title: z.string().min(1),
        subtitle: z.string().optional(),
        href: z.string().optional(),
        order: z.number().int().default(0),
      })
    )
    .optional(),
});

export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const category = await prisma.destinationCategory.findUnique({
      where: { id },
      include: { links: { orderBy: { order: "asc" } } },
    });

    if (!category) throw new ApiError("Catégorie introuvable", 404);

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateCategorySchema.parse(body);

    const existing = await prisma.destinationCategory.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Catégorie introuvable", 404);

    const { links, ...categoryData } = data;

    // Update category + replace links if provided
    const category = await prisma.$transaction(async (tx) => {
      if (links) {
        // Delete old links and create new ones
        await tx.destinationLink.deleteMany({ where: { categoryId: id } });
        await tx.destinationLink.createMany({
          data: links.map((link) => ({
            categoryId: id,
            title: link.title,
            subtitle: link.subtitle,
            href: link.href,
            order: link.order,
          })),
        });
      }

      return tx.destinationCategory.update({
        where: { id },
        data: categoryData,
        include: { links: { orderBy: { order: "asc" } } },
      });
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const existing = await prisma.destinationCategory.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Catégorie introuvable", 404);

    await prisma.destinationCategory.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Catégorie supprimée" });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
