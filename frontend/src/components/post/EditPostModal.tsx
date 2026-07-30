import { useState } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import type { Post } from "../../types";
import { useEditPost } from "../../hooks/usePosts";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

export default function EditPostModal({ post, onClose }: EditPostModalProps) {
  const [caption, setCaption] = useState(post.caption || "");
  const [location, setLocation] = useState(post.location || "");
  const editPost = useEditPost();

  const handleSave = () => {
    editPost.mutate(
      { postId: post.id, caption, location },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-ig-card rounded-xl w-full max-w-sm flex flex-col shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <button onClick={onClose} aria-label="Bekor qilish" className="text-ig-black">
            <X className="w-6 h-6" />
          </button>
          <span className="font-semibold text-base text-ig-black">Tahrirlash</span>
          <button
            onClick={handleSave}
            disabled={editPost.isPending}
            className="text-ig-blue font-semibold text-sm disabled:opacity-50"
          >
            Saqlash
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ig-gray">Joylashuv</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Joylashuv qo'shing"
              className="w-full border border-ig-border rounded bg-transparent p-2 text-sm outline-none focus:border-ig-gray"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-ig-gray">Izoh</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Fikr yozing..."
              className="w-full h-24 border border-ig-border rounded bg-transparent p-2 text-sm outline-none resize-none focus:border-ig-gray"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
