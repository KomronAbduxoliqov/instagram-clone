import { useState } from "react";
import { X, Heart } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { motion } from "framer-motion";
import type { Post } from "../../types";
import { useComments, useAddComment, useToggleCommentLike } from "../../hooks/useComments";
import { useToggleLike } from "../../hooks/usePosts";

interface CommentsModalProps {
  post: Post;
  onClose: () => void;
}

export default function CommentsModal({ post, onClose }: CommentsModalProps) {
  const { data: comments, isLoading } = useComments(post.id);
  const addComment = useAddComment(post.id);
  const toggleLike = useToggleLike();
  const toggleCommentLike = useToggleCommentLike(post.id);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // If replying, we prefix text with @username if not already typed
    let finalContent = text.trim();
    if (replyTo && !finalContent.startsWith(`@${replyTo.username}`)) {
      finalContent = `@${replyTo.username} ${finalContent}`;
    }

    addComment.mutate({ content: finalContent, parentId: replyTo?.id });
    setText("");
    setReplyTo(null);
  };

  const parentComments = comments?.filter(c => !c.parent_id) || [];
  const getReplies = (parentId: number) => comments?.filter(c => c.parent_id === parentId) || [];

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-ig-card rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl"
      >
        <div className="flex items-center justify-center px-4 py-3 border-b border-ig-border relative">
          <span className="font-semibold text-sm text-ig-black">Izohlar</span>
          <button onClick={onClose} aria-label="Yopish" className="absolute right-4">
            <X className="w-5 h-5 text-ig-black" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {post.caption && (
            <div className="flex gap-3 mb-4">
              <img
                src={post.avatar_url || "/default-avatar.png"}
                alt={post.username}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <p className="text-sm text-ig-black">
                <span className="font-semibold mr-1">{post.username}</span>
                {post.caption}
              </p>
            </div>
          )}

          {isLoading && <p className="text-sm text-ig-gray text-center py-6">Yuklanmoqda...</p>}

          {comments?.length === 0 && !isLoading && (
            <p className="text-sm text-ig-gray text-center py-6">
              Hozircha izohlar yo'q. Birinchi bo'lib yozing!
            </p>
          )}

          {parentComments.map((comment) => (
            <div key={comment.id} className="mb-4">
              <div className="flex gap-3">
                <img
                  src={comment.avatar_url || "/default-avatar.png"}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm text-ig-black">
                    <span className="font-semibold mr-1">{comment.username}</span>
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[11px] text-ig-gray">
                      {formatDistanceToNowStrict(new Date(comment.created_at))} oldin
                    </span>
                    {comment.like_count > 0 && (
                      <span className="text-[11px] text-ig-gray font-semibold">
                        {comment.like_count} layk
                      </span>
                    )}
                    <button 
                      onClick={() => {
                        setReplyTo({ id: comment.id, username: comment.username });
                        setText(`@${comment.username} `);
                      }}
                      className="text-[11px] text-ig-gray font-semibold hover:text-ig-black"
                    >
                      Javob qaytarish
                    </button>
                  </div>
                </div>
                <Heart 
                  className={`w-3 h-3 mt-2 shrink-0 cursor-pointer ${comment.liked_by_me ? 'fill-ig-red text-ig-red' : 'text-ig-gray hover:text-ig-red'}`} 
                  strokeWidth={1.5} 
                  onClick={() => toggleCommentLike.mutate(comment.id)}
                />
              </div>
              
              {/* Replies */}
              {getReplies(comment.id).length > 0 && (
                <div className="ml-11 mt-3 space-y-3">
                  {getReplies(comment.id).map(reply => (
                    <div key={reply.id} className="flex gap-3">
                      <img
                        src={reply.avatar_url || "/default-avatar.png"}
                        alt={reply.username}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-ig-black">
                          <span className="font-semibold mr-1">{reply.username}</span>
                          {reply.content}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-[11px] text-ig-gray">
                            {formatDistanceToNowStrict(new Date(reply.created_at))} oldin
                          </span>
                          <button 
                            onClick={() => {
                              setReplyTo({ id: comment.id, username: reply.username }); // attach to same parent thread
                              setText(`@${reply.username} `);
                            }}
                            className="text-[11px] text-ig-gray font-semibold hover:text-ig-black"
                          >
                            Javob qaytarish
                          </button>
                        </div>
                      </div>
                      <Heart 
                        className={`w-3 h-3 mt-2 shrink-0 cursor-pointer ${reply.liked_by_me ? 'fill-ig-red text-ig-red' : 'text-ig-gray hover:text-ig-red'}`} 
                        strokeWidth={1.5} 
                        onClick={() => toggleCommentLike.mutate(reply.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 px-4 py-2 border-t border-ig-border">
          <button onClick={() => toggleLike.mutate(post.id)} aria-label="Like">
            <Heart
              className={`w-6 h-6 ${post.liked_by_me ? "fill-ig-red text-ig-red" : "text-ig-black"}`}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col border-t border-ig-border">
          {replyTo && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-ig-border text-xs text-ig-gray">
              <span>Javob qaytarilmoqda: <span className="font-semibold text-ig-black">@{replyTo.username}</span></span>
              <button type="button" onClick={() => { setReplyTo(null); setText(""); }}>
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Izoh qo'shish..."
              className="flex-1 text-sm outline-none bg-transparent text-ig-black placeholder:text-ig-gray"
              autoFocus={!!replyTo}
            />
            <button
              type="submit"
              disabled={!text.trim() || addComment.isPending}
              className="text-ig-blue font-semibold text-sm disabled:opacity-30 transition-opacity"
            >
              Joylash
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
