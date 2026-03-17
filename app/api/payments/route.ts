import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { handleApiError } from "@/lib/api/errors";

const createPaymentSchema = z.object({
  propertyId: z.string(),
  period: z.string().transform((s) => new Date(s)),
  amountDue: z.number().positive(),
  amountPaid: z.number().min(0).default(0),
  dueDate: z.string().transform((s) => new Date(s)),
  status: z.enum(["PAID", "PENDING", "OVERDUE", "PARTIAL"]).default("PENDING"),
  notes: z.string().optional(),
});

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const status = searchParams.get("status");
    const agencyId = searchParams.get("agencyId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {};

    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (from || to) {
      where.period = {};
      if (from) (where.period as Record<string, unknown>).gte = new Date(from);
      if (to) (where.period as Record<string, unknown>).lte = new Date(to);
    }

    // Agent scoping
    if (user.role === "AGENT" && user.agencyId) {
      where.property = { agencyId: user.agencyId };
    } else if (agencyId) {
      where.property = { agencyId };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        property: {
          select: {
            title: true,
            slug: true,
            monthlyRent: true,
            commissionRate: true,
            agency: { select: { name: true } },
            city: { select: { pinyin: true } },
          },
        },
      },
      orderBy: { period: "desc" },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = createPaymentSchema.parse(body);

    // Calculate commission from property
    const property = await prisma.property.findUniqueOrThrow({
      where: { id: data.propertyId },
      select: { commissionRate: true, monthlyRent: true },
    });

    const commission =
      Number(data.amountDue) * (Number(property.commissionRate) / 100);

    const payment = await prisma.payment.create({
      data: {
        ...data,
        commission,
      },
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
