import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Play } from "lucide-react";
import { useExplore } from "../hooks/usePosts";

export default function ExplorePage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useExplore();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="max-w-[935px] mx-auto px-1 sm:px-0">
      {isLoading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-ig-border border-t-ig-blue rounded-full animate-spin" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => {
          const cover = post.media[0];
          return (
            <button
              key={post.id}
              onClick={() => navigate(`/p/${post.id}`)}
              className="relative aspect-square bg-ig-bg group overflow-hidden"
            >
              {cover?.media_type === "video" ? (
                <video src={cover.media_url} className="w-full h-full object-cover" />
              ) : (
                <img src={cover?.media_url} alt={post.caption || "Post"} className="w-full h-full object-cover" />
              )}
              {cover?.media_type === "video" && (
                <Play className="absolute top-2 right-2 w-4 h-4 text-white fill-white" />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
                <span className="text-white font-semibold text-sm flex items-center gap-1">
                  <Heart className="w-5 h-5 fill-white" /> {post.like_count}
                </span>
                <span className="text-white font-semibold text-sm flex items-center gap-1">
                  <MessageCircle className="w-5 h-5 fill-white" /> {post.comment_count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div ref={loadMoreRef} className="h-10" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-ig-border border-t-ig-blue rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
