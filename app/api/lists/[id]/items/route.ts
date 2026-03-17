import { withAuth } from "@/lib/api/auth-middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const addItemSchema = z.object({
  propertyId: z.string().min(1, "propertyId est requis"),
  order: z.number().int().default(0),
});

const removeItemSchema = z.object({
  propertyId: z.string().min(1, "propertyId est requis"),
});

// POST add a property to the list
export const POST = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = addItemSchema.parse(body);

    const list = await prisma.propertyList.findUnique({ where: { id } });
    if (!list) throw new ApiError("Liste introuvable", 404);

    const item = await prisma.propertyListItem.create({
      data: {
        listId: id,
        propertyId: data.propertyId,
        order: data.order,
      },
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
    });

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

// DELETE remove a property from the list
export const DELETE = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = removeItemSchema.parse(body);

    const list = await prisma.propertyList.findUnique({ where: { id } });
    if (!list) throw new ApiError("Liste introuvable", 404);

    await prisma.propertyListItem.delete({
      where: {
        listId_propertyId: {
          listId: id,
          propertyId: data.propertyId,
        },
      },
    });

    return NextResponse.json({ success: true, message: "Propriété retirée de la liste" });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
