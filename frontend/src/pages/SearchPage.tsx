import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, XCircle } from "lucide-react";
import { useSearchUsers } from "../hooks/useUsers";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data: users, isLoading } = useSearchUsers(query);

  return (
    <div className="max-w-[470px] mx-auto px-4 py-6">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ig-gray" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Qidirish"
          className="w-full bg-[#efefef] rounded-lg pl-9 pr-9 py-2.5 text-sm outline-none text-ig-black placeholder:text-ig-gray font-light"
          autoFocus
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <XCircle className="w-4 h-4 text-ig-gray" fill="currentColor" stroke="white" />
          </button>
        )}
      </div>

      {isLoading && <p className="text-sm text-ig-gray text-center py-6">Qidirilmoqda...</p>}

      {query.trim().length > 0 && !isLoading && users?.length === 0 && (
        <p className="text-sm text-ig-gray text-center py-6">Hech kim topilmadi.</p>
      )}

      <div className="flex flex-col">
        {users?.map((u) => (
          <Link
            key={u.id}
            to={`/${u.username}`}
            className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src={u.avatar_url || "/default-avatar.png"}
              alt={u.username}
              className="w-12 h-12 rounded-full object-cover border border-ig-border"
            />
            <div>
              <p className="text-sm font-semibold text-ig-black">{u.username}</p>
              {u.full_name && <p className="text-sm text-ig-gray">{u.full_name}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
