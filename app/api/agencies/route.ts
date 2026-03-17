import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/auth-middleware";

const createAgencySchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  cityId: z.string().min(1, "La ville est requise"),
  address: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "TERMINATED"]).default("ACTIVE"),
  notes: z.string().optional(),
});

export const GET = withAuth(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get("cityId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};

  // Agent users can only see their own agency
  if (user.role === "AGENT") {
    if (!user.agencyId) {
      return NextResponse.json({ success: true, data: [] });
    }
    where.id = user.agencyId;
  }

  if (cityId) where.cityId = cityId;
  if (status) where.status = status;

  const agencies = await prisma.agency.findMany({
    where,
    include: {
      city: { select: { id: true, name: true, pinyin: true } },
      _count: { select: { properties: true, users: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: agencies });
}, "viewer");

export const POST = withAuth(async (req) => {
  const body = await req.json();
  const data = createAgencySchema.parse(body);

  // Clean empty strings to null
  const cleaned = {
    ...data,
    email: data.email || undefined,
  };

  const agency = await prisma.agency.create({
    data: cleaned,
    include: {
      city: { select: { id: true, name: true, pinyin: true } },
      _count: { select: { properties: true, users: true } },
    },
  });

  return NextResponse.json({ success: true, data: agency }, { status: 201 });
}, "admin");
