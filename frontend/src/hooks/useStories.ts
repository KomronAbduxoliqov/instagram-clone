import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { StoryGroup } from "../types";

export function useStoriesFeed() {
  return useQuery({
    queryKey: ["storiesFeed"],
    queryFn: async () => {
      const res = await api.get("/stories/feed");
      return res.data.storyGroups as StoryGroup[];
    },
    refetchInterval: 60_000, // har daqiqada yangilanadi
  });
}

export function useCreateStory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("media", file);
      const res = await api.post("/stories", formData);
      return res.data.story;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storiesFeed"] });
    },
  });
}

export function useViewStory() {
  return useMutation({
    mutationFn: async (storyId: number) => {
      await api.post(`/stories/${storyId}/view`);
    },
  });
}

export function useHighlights(username: string) {
  return useQuery({
    queryKey: ["highlights", username],
    queryFn: async () => {
      const res = await api.get(`/stories/highlights/${username}`);
      return res.data.highlights as { id: number; title: string; cover_url: string | null; items: { id: number; media_url: string; media_type: string }[] }[];
    },
    enabled: !!username,
  });
}
