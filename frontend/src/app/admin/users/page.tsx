"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Users,
  Shield,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Activity,
  FileText,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  headline: string | null;
  is_admin: boolean;
  created_at: string;
  analysis_count: number;
  cover_letter_count: number;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), ...(search && { search }) });
    const r = await fetch(`/api/admin/users?${params}`);
    const d = await r.json();
    setUsers(d.users ?? []);
    setTotal(d.total ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const toggleAdmin = async (id: string, makeAdmin: boolean) => {
    setTogglingId(id);
    const r = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_admin: makeAdmin }),
    });
    const d = await r.json();
    if (d.success) {
      toast.success(makeAdmin ? "User promoted to admin" : "Admin access revoked");
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, is_admin: makeAdmin } : u)));
    } else {
      toast.error(d.error ?? "Failed to update user");
    }
    setTogglingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total users</p>
        </div>
        <button onClick={fetchUsers} className="p-2 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 text-gray-400 hover:text-white transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{search ? "No users match your search." : "No users yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
            >
              {/* Main row */}
              <button
                onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}
                className="w-full text-left px-5 py-4 flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {u.full_name?.[0]?.toUpperCase() ?? u.email?.[0]?.toUpperCase() ?? "?"}
                </div>
                {/* Name/email */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{u.full_name ?? "No name"}</span>
                    {u.is_admin && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-indigo-900 text-indigo-300 font-medium">Admin</span>
                    )}
                    {u.id === currentUser?.id && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-gray-700 text-gray-400">You</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                {/* Stats */}
                <div className="hidden sm:flex items-center gap-5 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">{u.analysis_count}</p>
                    <p className="text-xs text-gray-500">Analyses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">{u.cover_letter_count}</p>
                    <p className="text-xs text-gray-500">Cover Letters</p>
                  </div>
                </div>
                {/* Date */}
                <span className="hidden md:block text-xs text-gray-500 shrink-0 ml-4">
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </button>

              {/* Expanded details */}
              {expandedId === u.id && (
                <div className="px-5 pb-4 border-t border-gray-700 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {u.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Mail className="w-4 h-4 text-gray-500" /> {u.email}
                      </div>
                    )}
                    {u.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="w-4 h-4 text-gray-500" /> {u.phone}
                      </div>
                    )}
                    {u.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 text-gray-500" /> {u.location}
                      </div>
                    )}
                    {u.headline && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Activity className="w-4 h-4 text-gray-500" /> {u.headline}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Activity className="w-4 h-4 text-gray-500" /> {u.analysis_count} analyses run
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <FileText className="w-4 h-4 text-gray-500" /> {u.cover_letter_count} cover letters
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4 text-gray-500" /> Joined {new Date(u.created_at).toLocaleDateString("en-US", { dateStyle: "long" })}
                    </div>
                  </div>

                  {/* Admin toggle — can't remove own admin access */}
                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => toggleAdmin(u.id, !u.is_admin)}
                      disabled={togglingId === u.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        u.is_admin
                          ? "bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-800"
                          : "bg-indigo-900/30 text-indigo-400 hover:bg-indigo-900/50 border border-indigo-800"
                      }`}
                    >
                      {togglingId === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : u.is_admin ? (
                        <ShieldOff className="w-4 h-4" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      {u.is_admin ? "Revoke Admin Access" : "Promote to Admin"}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 disabled:opacity-40 hover:border-gray-600 text-gray-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-gray-800 border border-gray-700 disabled:opacity-40 hover:border-gray-600 text-gray-400 hover:text-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
