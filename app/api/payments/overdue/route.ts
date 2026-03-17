import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";

export const GET = withAuth(async (req, { user }) => {
  try {
    const where: Record<string, unknown> = {
      status: { in: ["PENDING", "PARTIAL"] },
      dueDate: { lt: new Date() },
    };

    if (user.role === "AGENT" && user.agencyId) {
      where.property = { agencyId: user.agencyId };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        property: {
          select: {
            title: true,
            agency: { select: { name: true } },
            city: { select: { pinyin: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
