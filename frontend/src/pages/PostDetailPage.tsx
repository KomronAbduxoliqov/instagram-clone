import { useParams, useNavigate } from "react-router-dom";
import { usePost } from "../hooks/usePosts";
import PostCard from "../components/post/PostCard";
import { ArrowLeft } from "lucide-react";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading } = usePost(Number(id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-ig-border border-t-ig-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <p className="text-center py-16 text-ig-gray">Post topilmadi.</p>;
  }

  return (
    <div className="max-w-[470px] mx-auto px-2 sm:px-0 pt-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-ig-black font-semibold py-3 mb-2 hover:opacity-70 transition-opacity">
        <ArrowLeft className="w-5 h-5" /> Orqaga
      </button>
      <PostCard post={post} />
    </div>
  );
}
