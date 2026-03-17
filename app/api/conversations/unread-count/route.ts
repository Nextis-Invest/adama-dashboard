import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api/errors";

export const GET = withAuth(async (req, { user }) => {
  try {
    // Get all conversations user participates in
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      select: {
        conversationId: true,
        lastReadAt: true,
      },
    });

    let unreadCount = 0;

    for (const p of participations) {
      const count = await prisma.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: user.id },
          createdAt: p.lastReadAt ? { gt: p.lastReadAt } : undefined,
        },
      });
      unreadCount += count;
    }

    return NextResponse.json({ success: true, data: { unreadCount } });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
