import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Post, PostGridItem } from "../types";

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/posts/feed?page=${pageParam}`);
      return res.data as { posts: Post[]; page: number; hasMore: boolean };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });
}

export function useExplore() {
  return useInfiniteQuery({
    queryKey: ["explore"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/posts/explore?page=${pageParam}`);
      return res.data as { posts: Post[]; page: number; hasMore: boolean };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });
}

export function useReels() {
  return useInfiniteQuery({
    queryKey: ["reels"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`/posts/reels?page=${pageParam}`);
      return res.data as { posts: Post[]; page: number; hasMore: boolean };
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });
}

export function usePost(postId: number) {
  return useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await api.get(`/posts/${postId}`);
      return res.data.post as Post;
    },
    enabled: !!postId,
  });
}

export function useUserPosts(username: string) {
  return useQuery({
    queryKey: ["userPosts", username],
    queryFn: async () => {
      const res = await api.get(`/posts/user/${username}`);
      return res.data.posts as PostGridItem[];
    },
    enabled: !!username,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("/posts", formData);
      return res.data.post as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: number) => {
      await api.delete(`/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: number) => {
      const res = await api.post(`/posts/${postId}/like`);
      return res.data as { liked: boolean };
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["explore"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: number) => {
      const res = await api.post(`/posts/${postId}/save`);
      return res.data as { saved: boolean };
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["savedPosts"] });
    },
  });
}

export function useSavedPosts() {
  return useQuery({
    queryKey: ["savedPosts"],
    queryFn: async () => {
      const res = await api.get("/saved");
      return res.data.posts as PostGridItem[];
    },
  });
}

export function useEditPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, caption, location }: { postId: number; caption: string; location: string }) => {
      const res = await api.put(`/posts/${postId}`, { caption, location });
      return res.data.post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.invalidateQueries({ queryKey: ["post"] });
    },
  });
}
