import { useState } from "react";
import { X } from "lucide-react";
import { useSearchUsers } from "../../hooks/useUsers";
import { useStartConversation } from "../../hooks/useMessages";
import { useNavigate } from "react-router-dom";

interface NewMessageModalProps {
  onClose: () => void;
}

export default function NewMessageModal({ onClose }: NewMessageModalProps) {
  const [query, setQuery] = useState("");
  const { data: users, isLoading } = useSearchUsers(query);
  const startConversation = useStartConversation();
  const navigate = useNavigate();

  const handleStartChat = async (username: string) => {
    try {
      const res = await startConversation.mutateAsync(username);
      navigate(`/messages/${res.conversationId}`);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-ig-card rounded-xl w-full max-w-sm flex flex-col overflow-hidden h-[400px]" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-ig-border">
          <div className="w-8" />
          <span className="font-semibold text-base text-ig-black">Yangi xabar</span>
          <button onClick={onClose} className="w-8 flex justify-end">
            <X className="w-6 h-6 text-ig-black" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 border-b border-ig-border">
          <span className="font-semibold text-ig-black">Kimgadir:</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidirish..."
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-ig-gray"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <p className="text-center text-ig-gray py-8 text-sm">Qidirilmoqda...</p>
          ) : users?.length === 0 && query ? (
            <p className="text-center text-ig-gray py-8 text-sm">Hech narsa topilmadi.</p>
          ) : (
            <div className="flex flex-col">
              {users?.map(u => (
                <button 
                  key={u.id} 
                  onClick={() => handleStartChat(u.username)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg text-left"
                >
                  <img 
                    src={u.avatar_url || "/default-avatar.png"} 
                    alt={u.username} 
                    className="w-11 h-11 rounded-full object-cover border border-ig-border shrink-0" 
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="font-semibold text-sm text-ig-black truncate">{u.username}</p>
                    {u.full_name && <p className="text-sm text-ig-gray truncate">{u.full_name}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
