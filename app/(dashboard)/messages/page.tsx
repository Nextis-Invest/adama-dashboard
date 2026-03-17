"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      const json = await res.json();
      return json.data;
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Conversations avec les agences et utilisateurs"
      />

      {isLoading ? (
        <div className="text-center py-12 text-[#6A6A6A]">Chargement...</div>
      ) : conversations?.length === 0 ? (
        <Card className="border-[#EBEBEB]">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-[#DDDDDD] mb-4" />
            <p className="text-[#6A6A6A]">Aucune conversation</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations?.map((conv: Record<string, unknown>) => {
            const participants = conv.participants as Array<{
              user: { id: string; name: string };
            }>;
            const otherParticipants = participants
              .filter((p) => p.user.id !== session?.user?.id)
              .map((p) => p.user.name);
            const lastMsg = conv.lastMessage as {
              content: string;
              createdAt: string;
              sender: { name: string };
            } | null;

            return (
              <Card
                key={conv.id as string}
                className="border-[#EBEBEB] cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => router.push(`/messages/${conv.id}`)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#FF385C] text-white text-sm">
                      {otherParticipants[0]?.[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-[#222222] truncate">
                        {(conv.subject as string) ||
                          otherParticipants.join(", ") ||
                          "Conversation"}
                      </p>
                      {lastMsg && (
                        <span className="text-xs text-[#6A6A6A]">
                          {format(new Date(lastMsg.createdAt), "dd MMM", {
                            locale: fr,
                          })}
                        </span>
                      )}
                    </div>
                    {lastMsg && (
                      <p className="text-sm text-[#6A6A6A] truncate">
                        {lastMsg.sender.name}: {lastMsg.content}
                      </p>
                    )}
                    {(conv.property as { title: string } | null) && (
                      <p className="text-xs text-[#FF385C]">
                        {(conv.property as { title: string }).title}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
