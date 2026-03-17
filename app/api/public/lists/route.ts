import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required
export async function GET() {
  try {
    const lists = await prisma.propertyList.findMany({
      where: { isActive: true },
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
                type: true,
                listingType: true,
                bedrooms: true,
                beds: true,
                bathrooms: true,
                maxGuests: true,
                photos: true,
                city: { select: { name: true, pinyin: true } },
              },
            },
          },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: lists });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
