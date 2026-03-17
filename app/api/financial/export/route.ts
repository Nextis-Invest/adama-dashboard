import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";
import { format } from "date-fns";

export const GET = withAuth(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const agencyId = searchParams.get("agencyId");
    const cityId = searchParams.get("cityId");

    const where: Record<string, unknown> = {};
    if (from || to) {
      where.period = {};
      if (from) (where.period as Record<string, unknown>).gte = new Date(from);
      if (to) (where.period as Record<string, unknown>).lte = new Date(to);
    }
    if (agencyId) where.property = { agencyId };
    if (cityId) {
      where.property = { ...((where.property as object) ?? {}), cityId };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        property: {
          select: {
            title: true,
            address: true,
            type: true,
            monthlyRent: true,
            agency: { select: { name: true } },
            city: { select: { pinyin: true } },
          },
        },
      },
      orderBy: [{ period: "asc" }, { property: { title: "asc" } }],
    });

    const headers = [
      "Period",
      "Property",
      "Address",
      "Agency",
      "City",
      "Type",
      "Monthly Rent",
      "Amount Due",
      "Amount Paid",
      "Commission",
      "Status",
      "Due Date",
      "Payment Date",
    ];

    const rows = payments.map((p) => [
      format(p.period, "yyyy-MM"),
      p.property.title,
      p.property.address,
      p.property.agency.name,
      p.property.city.pinyin,
      p.property.type,
      Number(p.property.monthlyRent).toFixed(2),
      Number(p.amountDue).toFixed(2),
      Number(p.amountPaid).toFixed(2),
      Number(p.commission).toFixed(2),
      p.status,
      format(p.dueDate, "yyyy-MM-dd"),
      p.paymentDate ? format(p.paymentDate, "yyyy-MM-dd") : "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=adama-export-${format(new Date(), "yyyy-MM-dd")}.csv`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
