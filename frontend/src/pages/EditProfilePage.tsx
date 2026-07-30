import { useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { useUpdateProfile, useUpdateAvatar } from "../hooks/useUsers";

export default function EditProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isPrivate, setIsPrivate] = useState(user?.is_private || false);
  const [message, setMessage] = useState("");

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await updateAvatar.mutateAsync(file);
    await fetchMe();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ full_name: fullName, bio, is_private: isPrivate });
    await fetchMe();
    setMessage("Profil muvaffaqiyatli yangilandi.");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="max-w-[700px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-ig-black mb-8">Profilni tahrirlash</h1>

      <div className="bg-[#efefef] rounded-2xl p-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || "/default-avatar.png"}
            alt={user?.username}
            className="w-14 h-14 rounded-full object-cover border border-ig-border"
          />
          <div>
            <p className="font-semibold text-base text-ig-black">{user?.username}</p>
            <p className="text-sm text-ig-gray">{user?.full_name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-ig-blue hover:bg-ig-blue-hover text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          Rasmni almashtirish
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
          <label className="text-base font-semibold text-ig-black sm:w-32 sm:text-right">To'liq ism</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="flex-1 border border-ig-border rounded-lg px-4 py-2 text-sm outline-none focus:border-ig-gray text-ig-black"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-8">
          <label className="text-base font-semibold text-ig-black sm:w-32 sm:text-right sm:mt-2">Bio</label>
          <div className="flex-1">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={150}
              className="w-full border border-ig-border rounded-lg px-4 py-2 text-sm outline-none focus:border-ig-gray text-ig-black resize-none"
            />
            <p className="text-xs text-ig-gray mt-1 text-right">{bio.length} / 150</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 mt-2">
          <div className="sm:w-32" />
          <label className="flex-1 flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ig-black"></div>
            </div>
            <div>
              <p className="text-base font-semibold text-ig-black">Shaxsiy hisob</p>
              <p className="text-xs text-ig-gray">Postlaringizni faqat obunachilaringiz ko'radi</p>
            </div>
          </label>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 mt-4">
          <div className="sm:w-32" />
          <div className="flex-1 flex flex-col items-start gap-4">
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="bg-ig-blue hover:bg-ig-blue-hover text-white rounded-lg px-8 py-2 font-semibold text-sm disabled:opacity-50 transition-colors"
            >
              {updateProfile.isPending ? "Saqlanmoqda..." : "Saqlash"}
            </button>
            {message && <p className="text-sm text-green-600 font-medium">{message}</p>}
          </div>
        </div>
      </form>
    </div>
  );
}
