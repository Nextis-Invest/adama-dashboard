import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public endpoint — no auth required
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const service = await prisma.service.findFirst({
      where: { slug, isActive: true },
    });

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: service });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
