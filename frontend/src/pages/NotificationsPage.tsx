import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { useNotifications, useMarkAllRead } from "../hooks/useNotifications";
import { useFollowRequests, useAcceptFollowRequest, useRejectFollowRequest } from "../hooks/useUsers";

const iconFor = {
  like: <Heart className="w-4 h-4 text-white fill-white" strokeWidth={1.5} />,
  comment: <MessageCircle className="w-4 h-4 text-white fill-white" strokeWidth={1.5} />,
  follow: <UserPlus className="w-4 h-4 text-white" strokeWidth={1.5} />,
  follow_request: <UserPlus className="w-4 h-4 text-white" strokeWidth={1.5} />,
  mention: <MessageCircle className="w-4 h-4 text-white fill-white" strokeWidth={1.5} />,
};

const bgFor = {
  like: "bg-ig-red",
  comment: "bg-green-500",
  follow: "bg-ig-blue",
  follow_request: "bg-ig-blue",
  mention: "bg-purple-500",
};

const textFor = {
  like: "postingizni yoqtirdi.",
  comment: "postingizga izoh qoldirdi.",
  follow: "sizni kuzata boshladi.",
  follow_request: "sizni kuzatish uchun so'rov yubordi.",
  mention: "sizni eslatib o'tdi.",
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const { data: followRequests } = useFollowRequests();
  const acceptFollow = useAcceptFollowRequest();
  const rejectFollow = useRejectFollowRequest();
  const markAllRead = useMarkAllRead();

  useEffect(() => {
    markAllRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-[600px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-ig-black mb-6">Bildirishnomalar</h1>

      {followRequests && followRequests.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-3">
            <h2 className="text-sm font-semibold text-ig-black">Kuzatish bo'yicha so'rovlar</h2>
            <span className="bg-ig-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {followRequests.length}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {followRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-3 py-2 bg-ig-card border border-ig-border rounded-xl">
                <Link to={`/${req.username}`} className="flex items-center gap-3">
                  <img
                    src={req.avatar_url || "/default-avatar.png"}
                    alt={req.username}
                    className="w-11 h-11 rounded-full object-cover border border-ig-border"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ig-black">{req.username}</p>
                    <p className="text-xs text-ig-gray">sizni follow qilmoqchi</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <button 
                    onClick={() => acceptFollow.mutate(req.id)}
                    disabled={acceptFollow.isPending}
                    className="bg-ig-blue hover:bg-ig-blue-hover text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Qabul qilish
                  </button>
                  <button 
                    onClick={() => rejectFollow.mutate(req.id)}
                    disabled={rejectFollow.isPending}
                    className="bg-gray-200 hover:bg-gray-300 text-ig-black text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))}
          </div>
          <hr className="mt-6 border-ig-border" />
        </div>
      )}

      {isLoading && <p className="text-sm text-ig-gray text-center py-6">Yuklanmoqda...</p>}

      {notifications?.length === 0 && !isLoading && (
        <p className="text-sm text-ig-gray text-center py-6">Hozircha bildirishnomalar yo'q.</p>
      )}

      <div className="flex flex-col gap-2">
        {notifications?.map((n) => (
          <Link
            key={n.id}
            to={n.post_id ? `/p/${n.post_id}` : `/${n.actor_username}`}
            className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors hover:bg-gray-50 ${
              !n.is_read ? "bg-blue-50/50" : ""
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={n.actor_avatar || "/default-avatar.png"}
                alt={n.actor_username}
                className="w-12 h-12 rounded-full object-cover border border-ig-border"
              />
              <span className={`absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-white ${bgFor[n.type]}`}>
                {iconFor[n.type]}
              </span>
            </div>
            
            <div className="flex-1 text-sm text-ig-black">
              <span className="font-semibold mr-1">{n.actor_username}</span>
              <span>{textFor[n.type]}</span>
              <span className="text-ig-gray ml-2 text-xs">
                {formatDistanceToNowStrict(new Date(n.created_at))}
              </span>
            </div>
            
            {n.type === "follow" && (
              <button className="bg-ig-blue hover:bg-ig-blue-hover text-white text-sm font-semibold px-4 py-1.5 rounded-lg shrink-0 transition-colors">
                Kuzatish
              </button>
            )}

            {n.post_thumbnail && n.type !== "follow" && (
              <img src={n.post_thumbnail} alt="Post" className="w-11 h-11 object-cover rounded shrink-0 border border-ig-border" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
