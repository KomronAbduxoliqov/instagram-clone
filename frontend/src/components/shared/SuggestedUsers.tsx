import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useSuggestedUsers, useToggleFollow } from "../../hooks/useUsers";

export default function SuggestedUsers() {
  const { user } = useAuthStore();
  const { data: suggestedUsers, isLoading } = useSuggestedUsers();

  if (!user || isLoading || !suggestedUsers || suggestedUsers.length === 0) return null;

  return (
    <div className="w-full">
      {/* Current User */}
      <div className="flex items-center justify-between mb-6">
        <Link to={`/${user.username}`} className="flex items-center gap-3">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt={user.username}
            className="w-11 h-11 rounded-full object-cover border border-ig-border"
          />
          <div>
            <p className="text-sm font-semibold text-ig-black">{user.username}</p>
            <p className="text-sm text-ig-gray">{user.full_name}</p>
          </div>
        </Link>
        <button className="text-xs font-semibold text-ig-blue">
          Almashtirish
        </button>
      </div>

      {/* Suggested Users */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-ig-gray">Siz uchun tavsiyalar</span>
        <button className="text-xs font-semibold text-ig-black hover:opacity-50">Barchasi</button>
      </div>

      <div className="flex flex-col gap-4">
        {suggestedUsers.slice(0, 5).map((suggested) => (
          <SuggestedUserItem key={suggested.id} user={suggested} />
        ))}
      </div>
    </div>
  );
}

function SuggestedUserItem({ user }: { user: { id: number; username: string; full_name: string; avatar_url: string | null } }) {
  const toggleFollow = useToggleFollow(user.username);

  return (
    <div className="flex items-center justify-between">
      <Link to={`/${user.username}`} className="flex items-center gap-3">
        <img
          src={user.avatar_url || "/default-avatar.png"}
          alt={user.username}
          className="w-11 h-11 rounded-full object-cover border border-ig-border"
        />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-ig-black leading-tight hover:underline">
            {user.username}
          </span>
          <span className="text-xs text-ig-gray mt-0.5">Siz uchun tavsiya etiladi</span>
        </div>
      </Link>
      <button
        onClick={() => toggleFollow.mutate()}
        disabled={toggleFollow.isPending}
        className="text-xs font-semibold text-ig-blue hover:text-ig-black transition-colors"
      >
        Follow qilish
      </button>
    </div>
  );
}
