"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  Users,
  FileCode2,
  Mail,
  Shield,
  LogOut,
  ChevronRight,
  Loader2,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/templates", label: "Templates", icon: FileCode2 },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) { router.replace("/login"); return; }
      if (profile && !profile.is_admin) { router.replace("/dashboard"); return; }
    }
  }, [user, profile, loading, router]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (!profile.is_admin) return null;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex bg-gray-950 text-gray-100">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-gray-800 bg-gray-900">
        {/* Brand */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white leading-none">Admin Panel</p>
              <p className="text-xs text-gray-400 mt-0.5">Resumelyzer</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(href, exact)
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/50"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {isActive(href, exact) && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {profile.full_name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile.full_name ?? "Admin"}</p>
              <p className="text-xs text-gray-400 truncate">{profile.email}</p>
            </div>
          </div>
          <button
            onClick={() => { signOut(); router.push("/"); }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
}
