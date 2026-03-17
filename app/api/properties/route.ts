import { withAuth } from "@/lib/api/auth-middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";
import { generateSlug } from "@/lib/utils/slug";

const createPropertySchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  type: z.enum(["APARTMENT", "HOUSE", "ROOM", "STUDIO", "VILLA", "LOFT"]),
  listingType: z.enum(["ENTIRE_PLACE", "PRIVATE_ROOM", "SHARED_ROOM"]),
  status: z
    .enum(["AVAILABLE", "RENTED", "MAINTENANCE", "OFFLINE"])
    .default("AVAILABLE"),
  agencyId: z.string().min(1, "L'agence est requise"),
  cityId: z.string().min(1, "La ville est requise"),
  address: z.string().min(1, "L'adresse est requise"),
  district: z.string().nullish(),
  floor: z.number().int().nullish(),
  building: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  surfaceArea: z.number().positive().nullish(),
  bedrooms: z.number().int().min(0).default(1),
  beds: z.number().int().min(0).default(1),
  bathrooms: z.number().int().min(0).default(1),
  maxGuests: z.number().int().min(1).default(2),
  totalRooms: z.number().int().min(0).nullish(),
  furnishing: z
    .enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"])
    .default("FURNISHED"),
  amenities: z.array(z.string()).default([]),
  monthlyRent: z.number().positive("Le loyer mensuel est requis"),
  deposit: z.number().positive().nullish(),
  commissionRate: z.number().min(0).max(100, "Le taux de commission max est 100%"),
  utilities: z.number().positive().nullish(),
  discountWeekly: z.number().min(0).max(100).nullish(),
  discountBiweekly: z.number().min(0).max(100).nullish(),
  discountMonthly: z.number().min(0).max(100).nullish(),
  discountQuarterly: z.number().min(0).max(100).nullish(),
  discountYearly: z.number().min(0).max(100).nullish(),
  leaseStartDate: z.string().nullish(),
  leaseEndDate: z.string().nullish(),
  minLeaseDuration: z.number().int().min(1).nullish(),
  contractRef: z.string().nullish(),
  photos: z.array(z.string()).default([]),
  coverPhoto: z.string().nullish(),
  description: z.string().nullish(),
  descriptionCn: z.string().nullish(),
  notes: z.string().nullish(),
  isFeatured: z.boolean().default(false),
});

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");
    const agencyId = searchParams.get("agencyId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const listingType = searchParams.get("listingType");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    // Agent: always filter by own agencyId
    if (user.role === "AGENT" && user.agencyId) {
      where.agencyId = user.agencyId;
    } else if (agencyId) {
      where.agencyId = agencyId;
    }

    if (cityId) where.cityId = cityId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (listingType) where.listingType = listingType;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        agency: { select: { id: true, name: true } },
        city: { select: { id: true, name: true, pinyin: true } },
        _count: { select: { payments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = createPropertySchema.parse(body);

    // Agent can only create for own agency
    if (user.role === "AGENT") {
      if (!user.agencyId) {
        throw new ApiError("Agent sans agence assignée", 403);
      }
      data.agencyId = user.agencyId;
    }

    // Verify agency exists
    const agency = await prisma.agency.findUnique({
      where: { id: data.agencyId },
    });
    if (!agency) {
      throw new ApiError("Agence introuvable", 404);
    }

    // Verify city exists
    const city = await prisma.city.findUnique({
      where: { id: data.cityId },
    });
    if (!city) {
      throw new ApiError("Ville introuvable", 404);
    }

    // Generate unique slug
    let slug = generateSlug(data.title);
    const existingSlug = await prisma.property.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const property = await prisma.property.create({
      data: {
        ...data,
        slug,
        leaseStartDate: data.leaseStartDate
          ? new Date(data.leaseStartDate)
          : null,
        leaseEndDate: data.leaseEndDate ? new Date(data.leaseEndDate) : null,
      },
      include: {
        agency: { select: { id: true, name: true } },
        city: { select: { id: true, name: true, pinyin: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: property },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}, "agent");
