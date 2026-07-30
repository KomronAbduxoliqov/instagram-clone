import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { useMessages, useMarkAsRead } from "../../hooks/useMessages";
import { useAuthStore } from "../../store/authStore";
import { connectSocket, getSocket } from "../../lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import type { Message } from "../../types";
import { api } from "../../lib/api";

interface ChatWindowProps {
  conversationId: number;
}

export default function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useAuthStore();
  const { data: initialMessages, isLoading } = useMessages(conversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const markAsRead = useMarkAsRead();

  useEffect(() => {
    setMessages(initialMessages ?? []);
  }, [initialMessages]);

  useEffect(() => {
    markAsRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("conversation:join", conversationId);

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new", handleNewMessage);
    };
  }, [conversationId, queryClient]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    setText("");

    try {
      const socket = connectSocket();
      if (socket.connected) {
        socket.emit("message:send", { conversationId, content });
      } else {
        // REST fallback
        const res = await api.post(`/messages/conversations/${conversationId}/messages`, { content });
        const msg = res.data.message;
        const { user: u } = useAuthStore.getState();
        setMessages((prev) => [...prev, { ...msg, sender_username: u?.username, sender_avatar: u?.avatar_url }]);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    } catch (err) {
      console.error("Xabar yuborishda xatolik:", err);
      setText(content);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("media", file);

    try {
      const res = await api.post("/messages/upload-media", formData);
      const mediaUrl = res.data.media_url;
      const socket = getSocket();
      socket.emit("message:send", { conversationId, mediaUrl });
    } catch (err) {
      console.error("Fayl yuklashda xatolik:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {isLoading && <p className="text-sm text-ig-gray text-center">Yuklanmoqda...</p>}

        {messages.map((m, index) => {
          const isMine = m.sender_id === user?.id;
          const isLastMessage = index === messages.length - 1;
          return (
            <div key={m.id} className="flex flex-col gap-1">
              <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-3xl text-sm overflow-hidden ${
                    isMine ? "bg-[#3797f0] text-white" : "bg-[#efefef] text-ig-black"
                  } ${m.content ? "px-4 py-2" : ""}`}
                >
                  {m.media_url && (
                    m.media_url.endsWith(".mp4") || m.media_url.endsWith(".mov") || m.media_url.endsWith(".webm") ? (
                      <video src={m.media_url} controls className="max-w-full rounded-2xl mb-1" />
                    ) : (
                      <img src={m.media_url} alt="Xabar media" className="max-w-full rounded-2xl mb-1 object-cover" />
                    )
                  )}
                  {m.content && <span>{m.content}</span>}
                </div>
              </div>
              {isMine && isLastMessage && (
                <div className="flex justify-end pr-2">
                  <span className="text-[11px] text-ig-gray">Ko'rildi</span>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t border-ig-border">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-ig-black hover:bg-gray-100 rounded-full transition-colors"
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-ig-gray" /> : <ImagePlus className="w-6 h-6" />}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Xabar yozing..."
          className="flex-1 bg-ig-bg border border-ig-border rounded-full px-4 py-2 text-sm outline-none focus:border-ig-gray text-ig-black placeholder:text-ig-gray"
        />
        {text.trim() && (
          <button
            type="submit"
            className="text-ig-blue font-semibold text-sm mr-2"
          >
            Yuborish
          </button>
        )}
      </form>
    </div>
  );
}
