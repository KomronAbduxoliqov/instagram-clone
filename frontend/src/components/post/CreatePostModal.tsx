import { useState, useRef } from "react";
import { X, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";
import { useCreatePost } from "../../hooks/usePosts";

interface CreatePostModalProps {
  onClose: () => void;
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const createPost = useCreatePost();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [isReel, setIsReel] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
    
    // Auto-enable isReel if a video is selected
    if (selected.some((f) => f.type.startsWith("video"))) {
      setIsReel(true);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Kamida bitta rasm yoki video tanlang.");
      return;
    }
    const formData = new FormData();
    files.forEach((f) => formData.append("media", f));
    formData.append("caption", caption);
    formData.append("location", location);
    formData.append("is_reel", String(isReel));

    try {
      await createPost.mutateAsync(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || "Post yaratishda xatolik yuz berdi.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-ig-card rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <button onClick={onClose} aria-label="Yopish">
            <X className="w-5 h-5 text-ig-black" />
          </button>
          <span className="font-semibold text-sm text-ig-black">Yangi post yaratish</span>
          <button
            onClick={handleSubmit}
            disabled={createPost.isPending || files.length === 0}
            className="text-ig-blue font-semibold text-sm disabled:opacity-30"
          >
            {createPost.isPending ? "..." : "Ulashish"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {previews.length === 0 ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square border-2 border-dashed border-ig-border rounded-lg flex flex-col items-center justify-center gap-3 text-ig-gray hover:border-ig-gray transition-colors"
            >
              <ImagePlus className="w-16 h-16" strokeWidth={1} />
              <span className="text-lg">Rasm va videolarni shu yerga torting</span>
              <span className="bg-ig-blue text-white text-sm font-semibold px-4 py-1.5 rounded-lg mt-2">
                Kompyuterdan tanlang
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="aspect-square rounded overflow-hidden bg-black">
                    {files[i].type.startsWith("video") ? (
                      <video src={src} className="w-full h-full object-cover" />
                    ) : (
                      <img src={src} alt={`Ko'rinish ${i + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-ig-blue font-semibold"
              >
                Fayllarni almashtirish
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Izoh yozing..."
            rows={3}
            className="w-full mt-4 text-sm border border-ig-border bg-ig-card rounded-lg p-3 outline-none resize-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
          />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Joylashuv qo'shish"
            className="w-full mt-2 text-sm border border-ig-border bg-ig-card rounded-lg p-3 outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
          />

          <label className="flex items-center justify-between border border-ig-border rounded-lg px-3 py-3 mt-4 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-ig-black">Reels sifatida ulashish</p>
              <p className="text-xs text-ig-gray">Agar video bo'lsa, Reels bo'limiga ham tushadi</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={isReel}
                onChange={(e) => setIsReel(e.target.checked)}
                className="sr-only peer"
                disabled={!files.some(f => f.type.startsWith("video"))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ig-blue"></div>
            </div>
          </label>

          {error && <p className="text-ig-red text-sm mt-2">{error}</p>}
        </div>
      </motion.div>
    </div>
  );
}
