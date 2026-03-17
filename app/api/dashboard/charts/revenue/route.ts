import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";

export const GET = withAuth(async (req, { user }) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const payments = await prisma.payment.findMany({
      where: {
        period: { gte: twelveMonthsAgo },
        ...(user.role === "AGENT" && user.agencyId
          ? { property: { agencyId: user.agencyId } }
          : {}),
      },
      select: {
        period: true,
        amountPaid: true,
        commission: true,
      },
    });

    // Group by month
    const monthlyData: Record<
      string,
      { revenue: number; commission: number }
    > = {};

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[key] = { revenue: 0, commission: 0 };
    }

    for (const p of payments) {
      const key = `${p.period.getFullYear()}-${String(p.period.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key]) {
        monthlyData[key].revenue += Number(p.amountPaid);
        monthlyData[key].commission += Number(p.commission);
      }
    }

    const data = Object.entries(monthlyData).map(([month, values]) => ({
      month,
      revenue: values.revenue,
      commission: values.commission,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
