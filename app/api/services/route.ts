import { withAuth } from "@/lib/api/auth-middleware";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiError, handleApiError } from "@/lib/api/errors";
import { z } from "zod";

const createServiceSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const active = searchParams.get("active");

    const where = active === "true" ? { isActive: true } : {};

    const services = await prisma.service.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ success: true, data: services });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const data = createServiceSchema.parse(body);

    const existing = await prisma.service.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ApiError(
        "Un service avec ce slug existe déjà",
        409
      );
    }

    const service = await prisma.service.create({ data });

    return NextResponse.json({ success: true, data: service }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
