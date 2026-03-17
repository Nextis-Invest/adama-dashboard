import { withAuth } from "@/lib/api/auth-middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const updateListSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  tag: z.string().optional().nullable(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
  items: z
    .array(
      z.object({
        propertyId: z.string().min(1),
        order: z.number().int().default(0),
      })
    )
    .optional(),
});

// GET single list with items and property details
export const GET = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const list = await prisma.propertyList.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            property: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverPhoto: true,
                monthlyRent: true,
                city: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!list) throw new ApiError("Liste introuvable", 404);

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

// PUT update list fields + replace items array
export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updateListSchema.parse(body);

    const existing = await prisma.propertyList.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Liste introuvable", 404);

    const { items, ...listData } = data;

    // Auto-generate slug if title changed but no slug provided
    if (listData.title && !listData.slug) {
      listData.slug = generateSlug(listData.title);
    }

    const list = await prisma.$transaction(async (tx) => {
      if (items) {
        // Delete old items and create new ones
        await tx.propertyListItem.deleteMany({ where: { listId: id } });
        await tx.propertyListItem.createMany({
          data: items.map((item) => ({
            listId: id,
            propertyId: item.propertyId,
            order: item.order,
          })),
        });
      }

      return tx.propertyList.update({
        where: { id },
        data: listData,
        include: {
          items: {
            orderBy: { order: "asc" },
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  coverPhoto: true,
                  monthlyRent: true,
                  city: { select: { name: true } },
                },
              },
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

// DELETE list
export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;

    const existing = await prisma.propertyList.findUnique({ where: { id } });
    if (!existing) throw new ApiError("Liste introuvable", 404);

    await prisma.propertyList.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Liste supprimée" });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
