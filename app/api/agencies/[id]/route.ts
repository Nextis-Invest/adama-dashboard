import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/api/auth-middleware";
import { ApiError } from "@/lib/api/errors";

const updateAgencySchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  cityId: z.string().min(1).optional(),
  address: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  status: z.enum(["ACTIVE", "PAUSED", "TERMINATED"]).optional(),
  notes: z.string().optional(),
});

export const GET = withAuth(async (req, { params, user }) => {
  const { id } = await params;

  // Agent users can only see their own agency
  if (user.role === "AGENT" && user.agencyId !== id) {
    throw new ApiError("Forbidden", 403);
  }

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: {
      city: { select: { id: true, name: true, pinyin: true } },
      _count: { select: { properties: true, users: true } },
    },
  });

  if (!agency) {
    throw new ApiError("Agence introuvable", 404);
  }

  return NextResponse.json({ success: true, data: agency });
}, "viewer");

export const PUT = withAuth(async (req, { params, user }) => {
  const { id } = await params;

  // Agent users can only update their own agency
  if (user.role === "AGENT" && user.agencyId !== id) {
    throw new ApiError("Forbidden", 403);
  }

  const existing = await prisma.agency.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError("Agence introuvable", 404);
  }

  const body = await req.json();
  const data = updateAgencySchema.parse(body);

  const cleaned = {
    ...data,
    email: data.email || undefined,
  };

  const agency = await prisma.agency.update({
    where: { id },
    data: cleaned,
    include: {
      city: { select: { id: true, name: true, pinyin: true } },
      _count: { select: { properties: true, users: true } },
    },
  });

  return NextResponse.json({ success: true, data: agency });
}, "agent");

export const DELETE = withAuth(async (req, { params }) => {
  const { id } = await params;

  const agency = await prisma.agency.findUnique({
    where: { id },
    include: { _count: { select: { properties: true } } },
  });

  if (!agency) {
    throw new ApiError("Agence introuvable", 404);
  }

  if (agency._count.properties > 0) {
    throw new ApiError(
      `Impossible de supprimer : ${agency._count.properties} bien(s) lié(s) à cette agence`,
      400
    );
  }

  await prisma.agency.delete({ where: { id } });

  return NextResponse.json({ success: true, message: "Agence supprimée" });
}, "admin");
