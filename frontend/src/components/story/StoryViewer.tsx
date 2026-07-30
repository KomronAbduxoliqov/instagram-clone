import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import type { StoryGroup } from "../../types";
import { useViewStory } from "../../hooks/useStories";

interface StoryViewerProps {
  storyGroups: StoryGroup[];
  startIndex: number;
  onClose: () => void;
}

const STORY_DURATION = 5000;

export default function StoryViewer({ storyGroups, startIndex, onClose }: StoryViewerProps) {
  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const viewStory = useViewStory();

  const group = storyGroups[groupIndex];
  const story = group?.stories[storyIndex];

  const goNext = useCallback(() => {
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < storyGroups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [group, storyIndex, groupIndex, storyGroups.length, onClose]);

  const goPrev = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((i) => i - 1);
      setStoryIndex(0);
    }
  }, [storyIndex, groupIndex]);

  useEffect(() => {
    if (story && !story.viewed_by_me) {
      viewStory.mutate(story.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id]);

  useEffect(() => {
    const timer = setTimeout(goNext, STORY_DURATION);
    return () => clearTimeout(timer);
  }, [groupIndex, storyIndex, goNext]);

  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:rounded-lg overflow-hidden bg-black">
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          {group.stories.map((s, i) => (
            <div key={s.id} className="h-0.5 flex-1 bg-white/30 rounded overflow-hidden">
              <div
                className="h-full bg-ig-card"
                style={{
                  width: i < storyIndex ? "100%" : i === storyIndex ? "100%" : "0%",
                  transition: i === storyIndex ? `width ${STORY_DURATION}ms linear` : "none",
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-6 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <img
              src={group.avatar_url || "/default-avatar.png"}
              alt={group.username}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-white text-sm font-semibold">{group.username}</span>
          </div>
          <button onClick={onClose} aria-label="Yopish">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {story.media_type === "video" ? (
          <video src={story.media_url} className="w-full h-full object-contain" autoPlay />
        ) : (
          <img src={story.media_url} alt="Story" className="w-full h-full object-contain" />
        )}

        <button className="absolute left-0 top-0 w-1/3 h-full" onClick={goPrev} aria-label="Oldingi" />
        <button className="absolute right-0 top-0 w-1/3 h-full" onClick={goNext} aria-label="Keyingi" />
      </div>
    </div>
  );
}
