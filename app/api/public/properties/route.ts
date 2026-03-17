import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");
    const type = searchParams.get("type");
    const listingType = searchParams.get("listingType");
    const search = searchParams.get("search");
    const limit = Math.min(Number(searchParams.get("limit") || 24), 50);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);

    const where: Record<string, unknown> = {
      status: "AVAILABLE",
    };

    if (cityId) where.cityId = cityId;
    if (type) where.type = type;
    if (listingType) where.listingType = listingType;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
      ];
    }

    const [properties, total, cities] = await Promise.all([
      prisma.property.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          listingType: true,
          status: true,
          coverPhoto: true,
          photos: true,
          address: true,
          district: true,
          bedrooms: true,
          beds: true,
          bathrooms: true,
          maxGuests: true,
          surfaceArea: true,
          monthlyRent: true,
          furnishing: true,
          amenities: true,
          isFeatured: true,
          discountWeekly: true,
          discountMonthly: true,
          city: { select: { id: true, name: true, pinyin: true } },
          agency: { select: { name: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.property.count({ where }),
      prisma.city.findMany({
        where: { isActive: true },
        select: { id: true, name: true, pinyin: true },
        orderBy: { pinyin: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: properties,
      cities,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
