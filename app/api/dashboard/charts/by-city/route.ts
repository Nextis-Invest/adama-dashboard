import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";

export const GET = withAuth(async (req) => {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      select: {
        pinyin: true,
        _count: { select: { properties: true, agencies: true } },
      },
    });

    const data = cities.map((c) => ({
      city: c.pinyin,
      properties: c._count.properties,
      agencies: c._count.agencies,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
