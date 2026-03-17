import { withAuth } from "@/lib/api/auth-middleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { ApiError, handleApiError } from "@/lib/api/errors";

const sendMessageSchema = z.object({
  content: z.string().min(1),
});

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const { id } = await params;

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId: id, userId: user.id },
      },
    });

    if (!participant) throw new ApiError("Not a participant", 403);

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");

export const POST = withAuth(async (req, { params, user }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const data = sendMessageSchema.parse(body);

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId: id, userId: user.id },
      },
    });

    if (!participant) throw new ApiError("Not a participant", 403);

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: user.id,
        content: data.content,
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(
      { success: true, data: message },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}, "viewer");
