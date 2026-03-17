import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get("cityId");
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (cityId) where.cityId = cityId;
    if (category) where.category = category;
    if (featured === "true") where.isFeatured = true;

    const experiences = await prisma.experience.findMany({
      where,
      include: {
        city: {
          select: { name: true, pinyin: true },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: experiences });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
