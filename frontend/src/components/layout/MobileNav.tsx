import { NavLink } from "react-router-dom";
import { Home, PlusSquare, Heart, Compass, Clapperboard } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useState } from "react";
import CreatePostModal from "../post/CreatePostModal";

export default function MobileNav() {
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const iconClass = ({ isActive }: { isActive: boolean }) =>
    `p-2 text-ig-black ${isActive ? "font-bold" : "opacity-60"}`;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-12 border-t border-ig-border bg-ig-card flex items-center justify-around z-40">
        <NavLink to="/" end className={iconClass}>
          {({ isActive }) => <Home className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />}
        </NavLink>
        <NavLink to="/explore" className={iconClass}>
          {({ isActive }) => <Compass className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />}
        </NavLink>
        <NavLink to="/reels" className={iconClass}>
          {({ isActive }) => <Clapperboard className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />}
        </NavLink>
        <button onClick={() => setShowCreateModal(true)} className="p-2 text-ig-black opacity-60">
          <PlusSquare className="w-6 h-6" strokeWidth={1.5} />
        </button>
        <NavLink to="/notifications" className={iconClass}>
          {({ isActive }) => <Heart className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />}
        </NavLink>
        <NavLink to={`/${user?.username}`} className={iconClass}>
          {({ isActive }) => (
            <img
              src={user?.avatar_url || "/default-avatar.png"}
              alt={user?.username}
              className={`w-6 h-6 rounded-full object-cover ${isActive ? "ring-1 ring-ig-black" : ""}`}
            />
          )}
        </NavLink>
      </nav>

      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}
