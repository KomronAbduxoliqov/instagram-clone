import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Settings, Grid, Bookmark, Play, X } from "lucide-react";
import { useUserProfile } from "../hooks/useUsers";
import { useUserPosts } from "../hooks/usePosts";
import { useToggleFollow } from "../hooks/useUsers";
import { useAuthStore } from "../store/authStore";
import { useStartConversation } from "../hooks/useMessages";
import { useSavedPosts } from "../hooks/usePosts";
import { useFollowers, useFollowing } from "../hooks/useUsers";
import { useHighlights } from "../hooks/useStories";
import type { User } from "../types";

function UserListModal({ title, users, onClose }: { title: string, users: User[] | undefined, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-ig-card rounded-xl w-full max-w-sm max-h-[70vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border relative">
          <div className="w-8" />
          <span className="font-semibold text-base text-ig-black">{title}</span>
          <button onClick={onClose} className="w-8 flex justify-end">
            <X className="w-6 h-6 text-ig-black" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users?.length === 0 ? (
            <p className="text-center text-ig-gray py-8 text-sm">Hech kim yo'q.</p>
          ) : (
            <div className="flex flex-col p-2">
              {users?.map(u => (
                <Link key={u.id} to={`/${u.username}`} onClick={onClose} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <img src={u.avatar_url || "/default-avatar.png"} alt={u.username} className="w-11 h-11 rounded-full object-cover border border-ig-border" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-ig-black">{u.username}</p>
                    {u.full_name && <p className="text-sm text-ig-gray">{u.full_name}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const { data: profile, isLoading } = useUserProfile(username!);
  const { data: posts } = useUserPosts(username!);
  const toggleFollow = useToggleFollow(username!);
  const startConversation = useStartConversation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"posts" | "saved">("posts");
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);

  const { data: savedPosts } = useSavedPosts();
  const { data: followers } = useFollowers(username!);
  const { data: following } = useFollowing(username!);
  const { data: highlights } = useHighlights(username!);

  const isOwnProfile = currentUser?.username === username;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-ig-border border-t-ig-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <p className="text-center py-16 text-ig-gray">Foydalanuvchi topilmadi.</p>;
  }

  const handleMessage = async () => {
    const res = await startConversation.mutateAsync(username!);
    navigate(`/messages/${res.conversationId}`);
  };

  return (
    <div className="max-w-[935px] mx-auto px-4">
      {/* Profile header */}
      <div className="flex items-start gap-8 sm:gap-20 py-8">
        <div className="shrink-0">
          <img
            src={profile.avatar_url || "/default-avatar.png"}
            alt={profile.username}
            className="w-20 h-20 sm:w-[150px] sm:h-[150px] rounded-full object-cover border border-ig-border"
          />
        </div>
        <div className="flex-1 pt-1">
          <div className="flex items-center gap-5 flex-wrap mb-5">
            <h1 className="text-xl font-light text-ig-black">{profile.username}</h1>
            {isOwnProfile ? (
              <>
                <Link
                  to="/edit-profile"
                  className="bg-ig-bg hover:bg-gray-200 px-6 py-1.5 rounded-lg text-sm font-semibold text-ig-black transition-colors"
                >
                  Profilni tahrirlash
                </Link>
                <button aria-label="Sozlamalar">
                  <Settings className="w-6 h-6 text-ig-black" strokeWidth={1.5} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => toggleFollow.mutate()}
                  className={`px-6 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    profile.is_following
                      ? "bg-ig-bg hover:bg-gray-200 text-ig-black"
                      : "bg-ig-blue hover:bg-ig-blue-hover text-white"
                  }`}
                >
                  {profile.is_following ? "Kuzatilmoqda" : profile.is_pending ? "So'rov yuborildi" : "Kuzatish"}
                </button>
                <button
                  onClick={handleMessage}
                  className="bg-ig-bg hover:bg-gray-200 px-6 py-1.5 rounded-lg text-sm font-semibold text-ig-black transition-colors"
                >
                  Xabar
                </button>
              </>
            )}
          </div>

          <div className="flex gap-10 mb-5 text-base text-ig-black">
            <span>
              <strong>{profile.post_count}</strong> post
            </span>
            <button onClick={() => setModalType("followers")} className="cursor-pointer hover:opacity-70">
              <strong>{profile.follower_count}</strong> obunachi
            </button>
            <button onClick={() => setModalType("following")} className="cursor-pointer hover:opacity-70">
              <strong>{profile.following_count}</strong> kuzatilmoqda
            </button>
          </div>

          {profile.full_name && <p className="font-semibold text-sm text-ig-black">{profile.full_name}</p>}
          {profile.bio && <p className="text-sm text-ig-black whitespace-pre-line">{profile.bio}</p>}
        </div>
      </div>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 px-2 no-scrollbar">
          {highlights.map((highlight) => (
            <div key={highlight.id} className="flex flex-col items-center gap-2 shrink-0 cursor-pointer">
              <div className="w-16 h-16 rounded-full border border-ig-border p-0.5">
                <img 
                  src={highlight.cover_url || "/default-avatar.png"} 
                  alt={highlight.title} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs text-ig-black font-semibold truncate max-w-[64px] text-center">
                {highlight.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="border-t border-ig-border flex justify-center gap-16">
        <button
          onClick={() => setTab("posts")}
          className={`flex items-center gap-1.5 py-4 text-xs font-semibold uppercase tracking-widest ${
            tab === "posts" ? "border-t border-ig-black -mt-px text-ig-black" : "text-ig-gray"
          }`}
        >
          <Grid className="w-3 h-3" /> Postlar
        </button>
        {isOwnProfile && (
          <button
            onClick={() => setTab("saved")}
            className={`flex items-center gap-1.5 py-4 text-xs font-semibold uppercase tracking-widest ${
              tab === "saved" ? "border-t border-ig-black -mt-px text-ig-black" : "text-ig-gray"
            }`}
          >
            <Bookmark className="w-3 h-3" /> Saqlangan
          </button>
        )}
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-3 gap-1 mt-0.5">
        {(tab === "posts" ? posts : savedPosts)?.map((post) => (
          <button
            key={post.id}
            onClick={() => navigate(`/p/${post.id}`)}
            className="relative aspect-square bg-ig-bg group overflow-hidden"
          >
            {post.cover_type === "video" ? (
              <video src={post.cover_media ?? undefined} className="w-full h-full object-cover" />
            ) : (
              <img src={post.cover_media ?? undefined} alt="Post" className="w-full h-full object-cover" />
            )}
            {post.media_count > 1 && (
              <span className="absolute top-2 right-2 text-white text-xs">
                <Play className="w-4 h-4 fill-white" />
              </span>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white font-semibold text-sm">❤ {post.like_count}</span>
            </div>
          </button>
        ))}
      </div>

      {(tab === "posts" ? posts : savedPosts)?.length === 0 && (
        <p className="text-center text-ig-gray py-16">
          {tab === "posts" ? "Hozircha postlar yo'q." : "Saqlangan postlar yo'q."}
        </p>
      )}

      {modalType === "followers" && (
        <UserListModal title="Obunachilar" users={followers} onClose={() => setModalType(null)} />
      )}
      {modalType === "following" && (
        <UserListModal title="Kuzatilmoqda" users={following} onClose={() => setModalType(null)} />
      )}
    </div>
  );
}
