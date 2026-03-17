import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
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
