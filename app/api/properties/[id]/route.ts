import { withAuth } from "@/lib/api/auth-middleware";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";
import { generateSlug } from "@/lib/utils/slug";

const updatePropertySchema = z.object({
  title: z.string().min(1, "Le titre est requis").optional(),
  type: z.enum(["APARTMENT", "HOUSE", "ROOM", "STUDIO", "VILLA", "LOFT"]).optional(),
  listingType: z.enum(["ENTIRE_PLACE", "PRIVATE_ROOM", "SHARED_ROOM"]).optional(),
  status: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE", "OFFLINE"]).optional(),
  agencyId: z.string().min(1).optional(),
  cityId: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  district: z.string().nullish(),
  floor: z.number().int().nullish(),
  building: z.string().nullish(),
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
  surfaceArea: z.number().positive().nullish(),
  bedrooms: z.number().int().min(0).optional(),
  beds: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  maxGuests: z.number().int().min(1).optional(),
  totalRooms: z.number().int().min(0).nullish(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED"]).optional(),
  amenities: z.array(z.string()).optional(),
  monthlyRent: z.number().positive().optional(),
  deposit: z.number().positive().nullish(),
  commissionRate: z.number().min(0).max(100).optional(),
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
  photos: z.array(z.string()).optional(),
  coverPhoto: z.string().nullish(),
  description: z.string().nullish(),
  descriptionCn: z.string().nullish(),
  notes: z.string().nullish(),
  isFeatured: z.boolean().optional(),
});

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agency: { select: { id: true, name: true } },
        city: { select: { id: true, name: true, pinyin: true } },
        _count: { select: { payments: true, conversations: true } },
      },
    });

    if (!property) {
      throw new ApiError("Propriété introuvable", 404);
    }

    // Agent can only see properties of own agency
    if (user.role === "AGENT" && user.agencyId && property.agencyId !== user.agencyId) {
      throw new ApiError("Forbidden", 403);
    }

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const PUT = withAuth(async (req, { params, user }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updatePropertySchema.parse(body);

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError("Propriété introuvable", 404);
    }

    // Agent can only update properties of own agency
    if (user.role === "AGENT" && user.agencyId && existing.agencyId !== user.agencyId) {
      throw new ApiError("Forbidden", 403);
    }

    // If title changed, regenerate slug
    let slug: string | undefined;
    if (data.title && data.title !== existing.title) {
      slug = generateSlug(data.title);
      const existingSlug = await prisma.property.findUnique({ where: { slug } });
      if (existingSlug && existingSlug.id !== id) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...data,
        ...(slug ? { slug } : {}),
        leaseStartDate: data.leaseStartDate !== undefined
          ? data.leaseStartDate
            ? new Date(data.leaseStartDate)
            : null
          : undefined,
        leaseEndDate: data.leaseEndDate !== undefined
          ? data.leaseEndDate
            ? new Date(data.leaseEndDate)
            : null
          : undefined,
      },
      include: {
        agency: { select: { id: true, name: true } },
        city: { select: { id: true, name: true, pinyin: true } },
      },
    });

    return NextResponse.json({ success: true, data: property });
  } catch (error) {
    return handleApiError(error);
  }
}, "agent");

export const DELETE = withAuth(async (req, { params, user }) => {
  try {
    const { id } = await params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: { _count: { select: { payments: true } } },
    });

    if (!property) {
      throw new ApiError("Propriété introuvable", 404);
    }

    // Agent can only delete properties of own agency
    if (user.role === "AGENT" && user.agencyId && property.agencyId !== user.agencyId) {
      throw new ApiError("Forbidden", 403);
    }

    // Cascade delete (payments are cascaded via Prisma schema)
    await prisma.property.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Propriété supprimée" });
  } catch (error) {
    return handleApiError(error);
  }
}, "agent");
