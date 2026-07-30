import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import type { Post } from "../../types";
import { useToggleLike, useToggleSave, useDeletePost } from "../../hooks/usePosts";
import { useAuthStore } from "../../store/authStore";
import CommentsModal from "./CommentsModal";
import EditPostModal from "./EditPostModal";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const deletePost = useDeletePost();
  const [showComments, setShowComments] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const isOwner = user?.id === post.user_id;
  const media = post.media[mediaIndex];

  const handleDoubleClick = () => {
    if (!post.liked_by_me) toggleLike.mutate(post.id);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 700);
  };

  const handleShare = () => {
    const postLink = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postLink);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <article className="bg-ig-card border-b border-ig-border mb-3 pb-1">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <Link to={`/${post.username}`} className="flex items-center gap-3">
          <img
            src={post.avatar_url || "/default-avatar.png"}
            alt={post.username}
            className="w-8 h-8 rounded-full object-cover border border-ig-border"
          />
          <div>
            <p className="text-sm font-semibold text-ig-black">{post.username}</p>
            {post.location && <p className="text-[11px] text-ig-gray">{post.location}</p>}
          </div>
        </Link>

        <div className="relative">
          <button onClick={() => setShowMenu((v) => !v)} className="p-1 hover:opacity-60 transition-opacity">
            <MoreHorizontal className="w-5 h-5 text-ig-black" strokeWidth={1.5} />
          </button>
          {showMenu && isOwner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-8 bg-ig-card border border-ig-border rounded-xl shadow-lg z-20 w-36 overflow-hidden"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowEdit(true);
                }}
                className="w-full text-left px-4 py-3 text-sm text-ig-black hover:bg-gray-50 transition-colors font-semibold border-b border-ig-border"
              >
                Tahrirlash
              </button>
              <button
                onClick={() => {
                  deletePost.mutate(post.id);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-ig-red hover:bg-gray-50 transition-colors font-semibold"
              >
                O'chirish
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="relative bg-black w-full" onDoubleClick={handleDoubleClick}>
        {media?.media_type === "video" ? (
          <video src={media.media_url} className="w-full max-h-[650px] object-contain" controls />
        ) : (
          <img
            src={media?.media_url}
            alt={post.caption || "Post"}
            className="w-full max-h-[650px] object-contain select-none"
            draggable={false}
          />
        )}

        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <Heart className="w-24 h-24 text-white fill-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {post.media.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10">
            {mediaIndex + 1} / {post.media.length}
          </div>
        )}

        {post.media.length > 1 && (
          <>
            {mediaIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setMediaIndex((i) => i - 1); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ig-black rounded-full w-7 h-7 flex items-center justify-center text-sm shadow transition-all z-10"
              >
                ‹
              </button>
            )}
            {mediaIndex < post.media.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setMediaIndex((i) => i + 1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ig-black rounded-full w-7 h-7 flex items-center justify-center text-sm shadow transition-all z-10"
              >
                ›
              </button>
            )}
          </>
        )}

        {post.media.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {post.media.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === mediaIndex ? "bg-ig-blue" : "bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => toggleLike.mutate(post.id)}
              className="hover:opacity-50 transition-opacity"
            >
              <Heart
                className={`w-6 h-6 ${
                  post.liked_by_me ? "fill-ig-red text-ig-red" : "text-ig-black"
                }`}
                strokeWidth={1.5}
              />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.8 }}
              onClick={() => setShowComments(true)}
              className="hover:opacity-50 transition-opacity"
            >
              <MessageCircle className="w-6 h-6 text-ig-black" strokeWidth={1.5} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={handleShare} className="hover:opacity-50 transition-opacity">
              <Send className="w-6 h-6 text-ig-black" strokeWidth={1.5} />
            </motion.button>
          </div>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleSave.mutate(post.id)}
            className="hover:opacity-50 transition-opacity"
          >
            <Bookmark
              className={`w-6 h-6 ${post.saved_by_me ? "fill-ig-black text-ig-black" : "text-ig-black"}`}
              strokeWidth={1.5}
            />
          </motion.button>
        </div>

        {post.like_count > 0 && (
          <p className="text-sm font-semibold text-ig-black mb-1">{post.like_count.toLocaleString()} layk</p>
        )}

        {post.caption && (
          <p className="text-sm text-ig-black mb-1">
            <span className="font-semibold mr-1">{post.username}</span>
            {post.caption}
          </p>
        )}

        {post.comment_count > 0 && (
          <button onClick={() => setShowComments(true)} className="text-sm text-ig-gray mb-1 block">
            Barcha {post.comment_count} izohni ko'rish
          </button>
        )}

        <p className="text-[10px] text-ig-gray uppercase mt-1 tracking-wide">
          {formatDistanceToNowStrict(new Date(post.created_at))} oldin
        </p>
      </div>

      {showComments && <CommentsModal post={post} onClose={() => setShowComments(false)} />}
      {showEdit && <EditPostModal post={post} onClose={() => setShowEdit(false)} />}
      
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-ig-black text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg"
          >
            Link nusxalandi!
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
