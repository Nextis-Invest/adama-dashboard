import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { handleApiError } from "@/lib/api/errors";

const createConversationSchema = z.object({
  subject: z.string().optional(),
  propertyId: z.string().optional(),
  participantIds: z.array(z.string()).min(1),
  initialMessage: z.string().min(1),
});

export const GET = withAuth(async (req, { user }) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: user.id } },
      },
      include: {
        property: { select: { title: true } },
        participants: {
          include: { user: { select: { id: true, name: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            sender: { select: { name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Add unread count
    const data = conversations.map((conv) => {
      const myParticipant = conv.participants.find(
        (p) => p.userId === user.id
      );
      return {
        ...conv,
        lastMessage: conv.messages[0] ?? null,
        messages: undefined,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = createConversationSchema.parse(body);

    // Ensure current user is in participants
    const allParticipantIds = [
      ...new Set([user.id, ...data.participantIds]),
    ];

    const conversation = await prisma.conversation.create({
      data: {
        subject: data.subject,
        propertyId: data.propertyId,
        participants: {
          create: allParticipantIds.map((userId) => ({ userId })),
        },
        messages: {
          create: {
            senderId: user.id,
            content: data.initialMessage,
          },
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true } } },
        },
        messages: true,
      },
    });

    return NextResponse.json(
      { success: true, data: conversation },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
