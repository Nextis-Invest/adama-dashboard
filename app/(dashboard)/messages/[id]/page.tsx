"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useQuery({
    queryKey: ["messages", id],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${id}/messages`);
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 5000,
  });

  // Mark as read
  useEffect(() => {
    fetch(`/api/conversations/${id}/read`, { method: "PUT" });
  }, [id, messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
    },
  });

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message);
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#EBEBEB] bg-white px-4 py-3">
        <Link href="/messages">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="font-semibold text-[#222222]">Conversation</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages?.map(
          (msg: {
            id: string;
            content: string;
            createdAt: string;
            sender: { id: string; name: string };
          }) => {
            const isMe = msg.sender.id === session?.user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[70%]">
                  {!isMe && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[#6A6A6A] text-white text-xs">
                        {msg.sender.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    {!isMe && (
                      <p className="text-xs text-[#6A6A6A] mb-1">
                        {msg.sender.name}
                      </p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm ${
                        isMe
                          ? "bg-[#FF385C] text-white"
                          : "bg-[#F7F7F7] text-[#222222]"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-[#6A6A6A] mt-1">
                      {format(new Date(msg.createdAt), "HH:mm", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-[#EBEBEB] bg-white p-4"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Écrire un message..."
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || sendMutation.isPending}
          className="bg-[#FF385C] hover:bg-[#E31C5F]"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
