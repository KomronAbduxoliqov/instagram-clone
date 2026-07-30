import { useEffect, useRef } from "react";
import { useFeed } from "../hooks/usePosts";
import PostCard from "../components/post/PostCard";
import StoriesBar from "../components/story/StoriesBar";
import SuggestedUsers from "../components/shared/SuggestedUsers";

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useFeed();
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
    <div className="max-w-[820px] mx-auto flex justify-center gap-16 px-2 sm:px-0">
      <div className="w-full max-w-[470px]">
        <StoriesBar />

        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-ig-border border-t-ig-blue rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-semibold text-ig-black mb-1">Feed hozircha bo'sh</p>
            <p className="text-sm text-ig-gray">
              Boshqa foydalanuvchilarni kuzatishni boshlang, ularning postlari shu yerda paydo bo'ladi.
            </p>
          </div>
        )}

        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        <div ref={loadMoreRef} className="h-10" />
        {isFetchingNextPage && (
          <div className="flex justify-center pb-6">
            <div className="w-6 h-6 border-2 border-ig-border border-t-ig-blue rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="hidden lg:block w-[320px] pt-10">
        <SuggestedUsers />
      </div>
    </div>
  );
}
