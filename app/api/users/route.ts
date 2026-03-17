import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { hash } from "bcryptjs";
import { handleApiError } from "@/lib/api/errors";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "AGENT", "VIEWER"]).default("VIEWER"),
  agencyId: z.string().optional().nullable(),
});

export const GET = withAuth(async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        agencyId: true,
        agency: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");

export const POST = withAuth(async (req) => {
  try {
    const body = await req.json();
    const data = createUserSchema.parse(body);

    const hashedPassword = await hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        agencyId: true,
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}, "admin");
