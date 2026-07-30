import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { UserProfile, User } from "../types";

export function useUserProfile(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      const res = await api.get(`/users/${username}`);
      return res.data.user as UserProfile;
    },
    enabled: !!username,
  });
}

export function useToggleFollow(username: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(`/users/${username}/follow`);
      return res.data as { following: boolean; pending: boolean };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      return res.data.users as User[];
    },
    enabled: query.trim().length > 0,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { full_name?: string; bio?: string; is_private?: boolean }) => {
      const res = await api.put("/users/me/profile", data);
      return res.data.user as User;
    },
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: ["profile", user.username] });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.put("/users/me/avatar", formData);
      return res.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRemoveAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.delete("/users/me/avatar");
      return res.data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useFollowers(username: string) {
  return useQuery({
    queryKey: ["followers", username],
    queryFn: async () => {
      const res = await api.get(`/users/${username}/followers`);
      return res.data.users as User[];
    },
    enabled: !!username,
  });
}

export function useFollowing(username: string) {
  return useQuery({
    queryKey: ["following", username],
    queryFn: async () => {
      const res = await api.get(`/users/${username}/following`);
      return res.data.users as User[];
    },
    enabled: !!username,
  });
}

export function useFollowRequests() {
  return useQuery({
    queryKey: ["followRequests"],
    queryFn: async () => {
      const res = await api.get("/users/me/follow-requests");
      return res.data.requests as { id: number; follower_id: number; username: string; full_name: string; avatar_url: string | null; created_at: string }[];
    },
  });
}

export function useAcceptFollowRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followId: number) => {
      await api.post(`/users/me/follow-requests/${followId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followRequests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useRejectFollowRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (followId: number) => {
      await api.delete(`/users/me/follow-requests/${followId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followRequests"] });
    },
  });
}

export function useSuggestedUsers() {
  return useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const res = await api.get("/users/suggested");
      return res.data.users as { id: number; username: string; full_name: string; avatar_url: string | null }[];
    },
  });
}
