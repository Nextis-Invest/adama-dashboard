import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const property = await prisma.property.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        listingType: true,
        status: true,
        address: true,
        district: true,
        floor: true,
        building: true,
        surfaceArea: true,
        bedrooms: true,
        beds: true,
        bathrooms: true,
        maxGuests: true,
        totalRooms: true,
        furnishing: true,
        amenities: true,
        monthlyRent: true,
        deposit: true,
        utilities: true,
        discountWeekly: true,
        discountBiweekly: true,
        discountMonthly: true,
        discountQuarterly: true,
        discountYearly: true,
        minLeaseDuration: true,
        photos: true,
        coverPhoto: true,
        description: true,
        descriptionCn: true,
        isFeatured: true,
        city: { select: { name: true, pinyin: true } },
        agency: { select: { name: true } },
      },
    });

    if (!property) {
      return NextResponse.json({ success: false, error: "Propriété introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: property });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
