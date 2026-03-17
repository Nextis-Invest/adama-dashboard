import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";

export const PUT = withAuth(async (req, { params, user }) => {
  try {
    const { id } = await params;

    await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: { conversationId: id, userId: user.id },
      },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
