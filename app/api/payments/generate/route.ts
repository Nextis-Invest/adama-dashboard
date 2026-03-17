import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { handleApiError } from "@/lib/api/errors";

const generateSchema = z.object({
  period: z.string().transform((s) => new Date(s)),
});

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const { period } = generateSchema.parse(body);

    // Normalize to 1st of month
    const normalizedPeriod = new Date(
      period.getFullYear(),
      period.getMonth(),
      1
    );
    const dueDate = new Date(
      period.getFullYear(),
      period.getMonth(),
      5
    );

    // Get all rented properties
    const properties = await prisma.property.findMany({
      where: { status: "RENTED" },
      select: {
        id: true,
        monthlyRent: true,
        commissionRate: true,
      },
    });

    // Check existing payments for this period
    const existing = await prisma.payment.findMany({
      where: { period: normalizedPeriod },
      select: { propertyId: true },
    });
    const existingIds = new Set(existing.map((p) => p.propertyId));

    // Filter out properties that already have payments for this period
    const toCreate = properties.filter((p) => !existingIds.has(p.id));

    if (toCreate.length === 0) {
      return NextResponse.json({
        success: true,
        data: { created: 0, skipped: existingIds.size },
        message: "All payments already exist for this period",
      });
    }

    // Bulk create
    const created = await prisma.payment.createMany({
      data: toCreate.map((p) => ({
        propertyId: p.id,
        period: normalizedPeriod,
        amountDue: p.monthlyRent,
        amountPaid: 0,
        commission:
          Number(p.monthlyRent) * (Number(p.commissionRate) / 100),
        dueDate,
        status: "PENDING" as const,
      })),
    });

    return NextResponse.json({
      success: true,
      data: { created: created.count, skipped: existingIds.size },
    });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
