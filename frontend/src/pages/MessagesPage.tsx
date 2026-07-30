import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";
import { useConversations } from "../hooks/useMessages";
import { useAuthStore } from "../store/authStore";
import ChatWindow from "../components/shared/ChatWindow";
import NewMessageModal from "../components/shared/NewMessageModal";

export default function MessagesPage() {
  const { user } = useAuthStore();
  const { data: conversations, isLoading } = useConversations();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  return (
    <div className="max-w-[935px] mx-auto flex border border-ig-border rounded-lg bg-ig-card h-[calc(100vh-6rem)] md:h-[85vh] mt-4 overflow-hidden">
      <div className={`w-full md:w-[350px] border-r border-ig-border flex flex-col ${conversationId ? "hidden md:flex" : ""}`}>
        <div className="px-5 py-4 border-b border-ig-border flex justify-between items-center">
          <h1 className="font-bold text-lg text-ig-black">{user?.username}</h1>
          <button onClick={() => setShowNewMessageModal(true)}>
            <svg aria-label="Yangi xabar" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
              <path d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <path d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="16.848" x2="20.076" y1="3.924" y2="7.153"></line>
            </svg>
          </button>
        </div>

        {isLoading && <p className="text-sm text-ig-gray text-center py-6">Yuklanmoqda...</p>}

        {conversations?.length === 0 && !isLoading && (
          <p className="text-sm text-ig-gray text-center py-6 px-4">
            Hozircha suhbatlar yo'q. Qidirib topib suhbat boshlang.
          </p>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations?.map((c) => {
            const other = c.participants[0];
            return (
              <Link
                key={c.id}
                to={`/messages/${c.id}`}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${
                  conversationId === String(c.id) ? "bg-gray-50" : ""
                }`}
              >
                <img
                  src={other?.avatar_url || "/default-avatar.png"}
                  alt={other?.username}
                  className="w-14 h-14 rounded-full object-cover border border-ig-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ig-black truncate">{other?.username}</p>
                  <p className={`text-sm truncate ${c.unread_count > 0 ? "text-ig-black font-semibold" : "text-ig-gray"}`}>
                    {c.last_message?.content || "Suhbatni boshlang"}
                    {c.last_message && (
                      <span className="ml-1 text-[11px] font-normal text-ig-gray">
                        · {formatDistanceToNowStrict(new Date(c.last_message.created_at))}
                      </span>
                    )}
                  </p>
                </div>
                {c.unread_count > 0 && (
                  <div className="w-2.5 h-2.5 rounded-full bg-ig-blue shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className={`flex-1 ${!conversationId ? "hidden md:flex" : "flex"} flex-col bg-ig-card`}>
        {conversationId ? (
          <ChatWindow conversationId={Number(conversationId)} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-24 h-24 border-2 border-ig-black rounded-full flex items-center justify-center mb-4">
              <svg aria-label="Direct" fill="currentColor" height="48" role="img" viewBox="0 0 96 96" width="48">
                <path d="M48 0C21.532 0 0 21.533 0 48s21.532 48 48 48 48-21.532 48-48S74.468 0 48 0Zm0 94C22.636 94 2 73.364 2 48S22.636 2 48 2s46 20.636 46 46-20.636 46-46 46Zm12.227-53.284-7.257 27.525c-.295 1.135-1.423 1.83-2.585 1.583-.751-.16-1.409-.64-1.78-1.326l-5.305-9.754-9.754-5.305c-.686-.37-1.165-1.028-1.326-1.78-.246-1.161.448-2.29 1.583-2.585l27.525-7.257c1.112-.292 2.227.424 2.519 1.537.112.434.053.896-.164 1.284l-3.456 6.078Z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-ig-black mb-2">Xabarlaringiz</h2>
            <p className="text-sm text-ig-gray mb-6">Do'stlaringizga xususiy rasmlar va xabarlar yuboring.</p>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="bg-ig-blue hover:bg-ig-blue-hover text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
            >
              Xabar yuborish
            </button>
          </div>
        )}
      </div>

      {showNewMessageModal && (
        <NewMessageModal onClose={() => setShowNewMessageModal(false)} />
      )}
    </div>
  );
}
