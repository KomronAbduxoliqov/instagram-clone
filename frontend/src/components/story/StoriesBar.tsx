import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useStoriesFeed, useCreateStory } from "../../hooks/useStories";
import { useAuthStore } from "../../store/authStore";
import StoryViewer from "./StoryViewer";

export default function StoriesBar() {
  const { user } = useAuthStore();
  const { data: storyGroups } = useStoriesFeed();
  const createStory = useCreateStory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);

  const myGroupIndex = storyGroups?.findIndex((g) => g.user_id === user?.id) ?? -1;
  const hasMyStory = myGroupIndex !== -1;

  const handleAddStory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) createStory.mutate(file);
  };

  return (
    <>
      <div className="bg-ig-card border border-ig-border rounded-lg mb-6 px-4 py-4 flex gap-4 overflow-x-auto scrollbar-hide">
        {/* My story */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={() => (hasMyStory ? setViewingIndex(myGroupIndex) : fileInputRef.current?.click())}
            className="relative"
          >
            <div className={`rounded-full p-[3px] ${hasMyStory ? "story-ring-gradient" : ""}`}>
              <img
                src={user?.avatar_url || "/default-avatar.png"}
                alt="Sizning profilingiz"
                className="w-14 h-14 rounded-full object-cover border-2 border-white"
              />
            </div>
            {!hasMyStory && (
              <span className="absolute bottom-0 right-0 bg-ig-blue text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                <Plus className="w-3 h-3" />
              </span>
            )}
          </button>
          <span className="text-[11px] text-ig-black max-w-[64px] truncate">Siz</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleAddStory}
            className="hidden"
          />
        </div>

        {/* Other users' stories */}
        {storyGroups
          ?.filter((g) => g.user_id !== user?.id)
          .map((group) => {
            const allViewed = group.stories.every((s) => s.viewed_by_me);
            const idx = storyGroups.findIndex((g) => g.user_id === group.user_id);
            return (
              <button
                key={group.user_id}
                onClick={() => setViewingIndex(idx)}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div className={`rounded-full p-[3px] ${allViewed ? "story-ring-viewed" : "story-ring-gradient"}`}>
                  <img
                    src={group.avatar_url || "/default-avatar.png"}
                    alt={group.username}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white"
                  />
                </div>
                <span className="text-[11px] text-ig-black max-w-[64px] truncate">{group.username}</span>
              </button>
            );
          })}
      </div>

      {viewingIndex !== null && storyGroups && (
        <StoryViewer
          storyGroups={storyGroups}
          startIndex={viewingIndex}
          onClose={() => setViewingIndex(null)}
        />
      )}
    </>
  );
}
