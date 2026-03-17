import { withAuth } from "@/lib/api/auth-middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api/errors";
import { z } from "zod";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const createListSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1).optional(),
  tag: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// GET all lists with item count (admin)
export const GET = withAuth(async () => {
  try {
    const lists = await prisma.propertyList.findMany({
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: lists });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

// POST create a new list
export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const data = createListSchema.parse(body);

    const slug = data.slug || generateSlug(data.title);

    const list = await prisma.propertyList.create({
      data: {
        title: data.title,
        slug,
        tag: data.tag,
        order: data.order,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, data: list }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
