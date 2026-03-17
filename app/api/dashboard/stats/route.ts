import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";

export const GET = withAuth(async (req, { user }) => {
  try {
    const agencyFilter =
      user.role === "AGENT" && user.agencyId
        ? { agencyId: user.agencyId }
        : {};

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalProperties,
      rentedProperties,
      activeAgencies,
      totalCities,
      currentMonthPayments,
      lastMonthPayments,
      overduePayments,
    ] = await Promise.all([
      prisma.property.count({ where: agencyFilter }),
      prisma.property.count({
        where: { ...agencyFilter, status: "RENTED" },
      }),
      prisma.agency.count({ where: { status: "ACTIVE" } }),
      prisma.city.count({ where: { isActive: true } }),
      prisma.payment.aggregate({
        where: {
          period: { gte: currentMonth },
          ...(user.role === "AGENT" && user.agencyId
            ? { property: { agencyId: user.agencyId } }
            : {}),
        },
        _sum: { amountPaid: true, commission: true },
      }),
      prisma.payment.aggregate({
        where: {
          period: {
            gte: lastMonth,
            lt: currentMonth,
          },
          ...(user.role === "AGENT" && user.agencyId
            ? { property: { agencyId: user.agencyId } }
            : {}),
        },
        _sum: { amountPaid: true, commission: true },
      }),
      prisma.payment.count({
        where: {
          status: { in: ["PENDING", "PARTIAL"] },
          dueDate: { lt: now },
          ...(user.role === "AGENT" && user.agencyId
            ? { property: { agencyId: user.agencyId } }
            : {}),
        },
      }),
    ]);

    const currentRevenue = Number(currentMonthPayments._sum.amountPaid ?? 0);
    const lastRevenue = Number(lastMonthPayments._sum.amountPaid ?? 0);
    const revenueChange =
      lastRevenue > 0
        ? ((currentRevenue - lastRevenue) / lastRevenue) * 100
        : 0;

    const currentCommission = Number(
      currentMonthPayments._sum.commission ?? 0
    );
    const lastCommission = Number(lastMonthPayments._sum.commission ?? 0);
    const commissionChange =
      lastCommission > 0
        ? ((currentCommission - lastCommission) / lastCommission) * 100
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalProperties,
        rentedProperties,
        activeAgencies,
        totalCities,
        currentRevenue,
        revenueChange: Math.round(revenueChange * 10) / 10,
        currentCommission,
        commissionChange: Math.round(commissionChange * 10) / 10,
        overduePayments,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
