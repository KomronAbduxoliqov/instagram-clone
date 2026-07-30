import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Conversation, Message } from "../types";

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get("/messages/conversations");
      return res.data.conversations as Conversation[];
    },
  });
}

export function useMessages(conversationId: number) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const res = await api.get(`/messages/conversations/${conversationId}/messages`);
      return res.data.messages as Message[];
    },
    enabled: !!conversationId,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      const res = await api.post("/messages/conversations", { username });
      return res.data as { conversationId: number; created: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (conversationId: number) => {
      await api.post(`/messages/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
