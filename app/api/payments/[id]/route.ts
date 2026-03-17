import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { ApiError, handleApiError } from "@/lib/api/errors";

const updatePaymentSchema = z.object({
  amountPaid: z.number().min(0).optional(),
  status: z.enum(["PAID", "PENDING", "OVERDUE", "PARTIAL"]).optional(),
  paymentDate: z
    .string()
    .transform((s) => new Date(s))
    .optional()
    .nullable(),
  notes: z.string().optional().nullable(),
});

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            title: true,
            agency: { select: { name: true, id: true } },
            city: { select: { pinyin: true } },
          },
        },
      },
    });

    if (!payment) throw new ApiError("Payment not found", 404);

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const PUT = withAuth(async (req, { params }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = updatePaymentSchema.parse(body);

    // Auto-set paymentDate when status changes to PAID
    const updateData: Record<string, unknown> = { ...data };
    if (data.status === "PAID" && !data.paymentDate) {
      updateData.paymentDate = new Date();
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    return handleApiError(error);
  }
}, "agent");
