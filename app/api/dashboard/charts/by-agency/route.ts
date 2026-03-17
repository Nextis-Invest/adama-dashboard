import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";

export const GET = withAuth(async (req) => {
  try {
    const agencies = await prisma.agency.findMany({
      where: { status: "ACTIVE" },
      select: {
        name: true,
        properties: {
          select: {
            payments: {
              select: { amountPaid: true, commission: true },
            },
          },
        },
      },
    });

    const data = agencies.map((a) => {
      let revenue = 0;
      let commission = 0;
      for (const p of a.properties) {
        for (const pay of p.payments) {
          revenue += Number(pay.amountPaid);
          commission += Number(pay.commission);
        }
      }
      return { agency: a.name, revenue, commission };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
