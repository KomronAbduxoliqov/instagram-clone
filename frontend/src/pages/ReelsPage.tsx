import { useEffect, useRef, useState } from "react";
import { useReels, useToggleLike, useToggleSave } from "../hooks/usePosts";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Music } from "lucide-react";
import CommentsModal from "../components/post/CommentsModal";
import type { Post } from "../types";
import { useAuthStore } from "../store/authStore";

function Reel({ post }: { post: Post }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const { user } = useAuthStore();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-3rem)] md:h-[calc(100vh-2rem)] max-w-[400px] mx-auto bg-black rounded-xl overflow-hidden snap-start shrink-0 mb-4 flex items-center justify-center">
      <video
        ref={videoRef}
        src={post.media[0]?.media_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        playsInline
        onClick={togglePlay}
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black/60" />

      {/* Right Sidebar Actions */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 pointer-events-auto">
        <button className="flex flex-col items-center group" onClick={() => toggleLike.mutate(post.id)}>
          <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <Heart className={`w-6 h-6 ${post.liked_by_me ? "fill-ig-red text-ig-red" : "text-white"}`} />
          </div>
          <span className="text-white text-xs mt-1 font-semibold drop-shadow-md">{post.like_count}</span>
        </button>

        <button className="flex flex-col items-center group" onClick={() => setShowComments(true)}>
          <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-semibold drop-shadow-md">{post.comment_count}</span>
        </button>

        <button className="flex flex-col items-center group">
          <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <Send className="w-6 h-6 text-white" />
          </div>
        </button>

        <button className="flex flex-col items-center group" onClick={() => toggleSave.mutate(post.id)}>
          <div className="w-10 h-10 bg-black/40 rounded-full flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <Bookmark className={`w-6 h-6 ${post.saved_by_me ? "fill-white text-white" : "text-white"}`} />
          </div>
        </button>

        <button className="flex flex-col items-center group">
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>

        <div className="w-8 h-8 rounded-md border-2 border-white overflow-hidden mt-2 animate-spin-slow">
          <img src={post.avatar_url || "/default-avatar.png"} alt="Audio" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-16 flex flex-col items-start pointer-events-auto">
        <div className="flex items-center gap-2 mb-2">
          <img src={post.avatar_url || "/default-avatar.png"} alt={post.username} className="w-8 h-8 rounded-full border border-white/50" />
          <span className="text-white font-semibold text-sm drop-shadow-md">{post.username}</span>
          {post.user_id !== user?.id && (
            <>
              <span className="text-white text-xs drop-shadow-md">•</span>
              <button className="text-white font-semibold text-xs border border-white rounded-md px-2 py-0.5 hover:bg-white hover:text-black transition-colors">Kuzatish</button>
            </>
          )}
        </div>
        {post.caption && (
          <p className="text-white text-sm line-clamp-2 drop-shadow-md mb-2">{post.caption}</p>
        )}
        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-full">
          <Music className="w-3 h-3 text-white" />
          <span className="text-white text-xs drop-shadow-md">Asl audio - {post.username}</span>
        </div>
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {showComments && <CommentsModal post={post} onClose={() => setShowComments(false)} />}
    </div>
  );
}

export default function ReelsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useReels();
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((p) => p.posts) ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 h-screen items-center">
        <div className="w-8 h-8 border-2 border-ig-border border-t-ig-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3rem)] md:h-[100vh] w-full overflow-y-scroll snap-y snap-mandatory bg-black md:bg-white pt-0 md:pt-4 scrollbar-hide">
      {posts.length === 0 ? (
        <div className="flex h-full items-center justify-center text-white md:text-ig-gray">
          Hozircha Reels yo'q
        </div>
      ) : (
        posts.map((post) => <Reel key={post.id} post={post} />)
      )}
      
      <div ref={loadMoreRef} className="h-4 snap-start" />
    </div>
  );
}
