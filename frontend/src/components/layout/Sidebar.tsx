import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Compass,
  Clapperboard,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
  Moon,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUnreadCount } from "../../hooks/useNotifications";
import { useState } from "react";
import CreatePostModal from "../post/CreatePostModal";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadCount();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-black hover:text-white transition-colors my-0.5 group ${
      isActive ? "font-bold" : "font-normal"
    }`;

  return (
    <>
      <aside className="hidden md:flex flex-col w-[245px] xl:w-[335px] h-screen border-r border-ig-border fixed left-0 top-0 px-3 py-8 bg-ig-card z-30">
        <div className="px-3 mb-8 pt-1">
          <span className="text-2xl font-serif italic text-ig-black cursor-pointer">Instagram</span>
        </div>

        <nav className="flex flex-col flex-1">
          <NavLink to="/" end className={navItemClass}>
            {({ isActive }) => (
              <>
                <Home className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                <span>Bosh sahifa</span>
              </>
            )}
          </NavLink>

          <NavLink to="/search" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Search className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                <span>Qidiruv</span>
              </>
            )}
          </NavLink>

          <NavLink to="/explore" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Compass className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                <span>Sharh</span>
              </>
            )}
          </NavLink>

          <NavLink to="/reels" className={navItemClass}>
            {({ isActive }) => (
              <>
                <Clapperboard className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                <span>Reels</span>
              </>
            )}
          </NavLink>

          <NavLink to="/messages" className={navItemClass}>
            {({ isActive }) => (
              <>
                <MessageCircle className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                <span>Xabarlar</span>
              </>
            )}
          </NavLink>

          <NavLink to="/notifications" className={navItemClass}>
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Heart className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                  {!!unreadCount && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-ig-red text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <span>Bildirishnomalar</span>
              </>
            )}
          </NavLink>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-black hover:text-white transition-colors text-left my-0.5"
          >
            <PlusSquare className="w-6 h-6" strokeWidth={1.5} />
            <span>Yaratish</span>
          </button>

          <button
            onClick={() => {
              document.documentElement.classList.toggle('dark');
              const isDark = document.documentElement.classList.contains('dark');
              localStorage.setItem('theme', isDark ? 'dark' : 'light');
            }}
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-black hover:text-white transition-colors text-left my-0.5"
          >
            <Moon className="w-6 h-6" strokeWidth={1.5} />
            <span>Ko'rinish</span>
          </button>

          <NavLink to={`/${user?.username}`} className={navItemClass}>
            {({ isActive }) => (
              <>
                <img
                  src={user?.avatar_url || "/default-avatar.png"}
                  alt={user?.username}
                  className={`w-6 h-6 rounded-full object-cover ${isActive ? "ring-2 ring-ig-black" : "border border-ig-border"}`}
                />
                <span>Profil</span>
              </>
            )}
          </NavLink>
        </nav>

        <div className="relative">
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-black hover:text-white transition-colors text-left w-full"
          >
            <Menu className="w-6 h-6" strokeWidth={1.5} />
            <span>Yana</span>
          </button>
          {showMore && (
            <div className="absolute bottom-14 left-0 bg-ig-card border border-ig-border rounded-xl shadow-lg w-full overflow-hidden z-50">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors"
              >
                Chiqish
              </button>
            </div>
          )}
        </div>
      </aside>

      {showCreateModal && <CreatePostModal onClose={() => setShowCreateModal(false)} />}
    </>
  );
}
