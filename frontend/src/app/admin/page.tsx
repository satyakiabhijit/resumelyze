"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Mail,
  FileCode2,
  TrendingUp,
  Activity,
  ArrowRight,
  Loader2,
  UserPlus,
  CheckCircle2,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalAnalyses: number;
  totalCoverLetters: number;
  totalTemplates: number;
  activeTemplates: number;
  totalSubscribers: number;
  newUsersThisWeek: number;
}

interface RecentUser {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
}

interface RecentAnalysis {
  id: string;
  resume_filename: string | null;
  overall_grade: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
}

const GRADE_COLOR: Record<string, string> = {
  "A+": "text-emerald-400", A: "text-emerald-400",
  "B+": "text-blue-400", B: "text-blue-400",
  "C+": "text-amber-400", C: "text-amber-400",
  D: "text-red-400",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [maintenanceToggling, setMaintenanceToggling] = useState(false);

  useEffect(() => {
    fetch("/api/admin/maintenance")
      .then((r) => r.json())
      .then((d) => setMaintenance(!!d.maintenance))
      .finally(() => setMaintenanceLoading(false));
  }, []);

  async function toggleMaintenance() {
    setMaintenanceToggling(true);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !maintenance }),
      });
      const d = await res.json();
      if (d.success) setMaintenance(d.maintenance);
    } finally {
      setMaintenanceToggling(false);
    }
  }

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats);
        setRecentUsers(d.recentUsers ?? []);
        setRecentAnalyses(d.recentAnalyses ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        {
          label: "Total Users",
          value: stats.totalUsers,
          icon: Users,
          color: "from-indigo-500 to-blue-600",
          sub: `+${stats.newUsersThisWeek} this week`,
          href: "/admin/users",
        },
        {
          label: "Analyses Run",
          value: stats.totalAnalyses,
          icon: Activity,
          color: "from-purple-500 to-pink-600",
          href: null,
        },
        {
          label: "Cover Letters",
          value: stats.totalCoverLetters,
          icon: FileText,
          color: "from-teal-500 to-emerald-600",
          href: null,
        },
        {
          label: "Templates",
          value: stats.totalTemplates,
          icon: FileCode2,
          color: "from-amber-500 to-orange-600",
          sub: `${stats.activeTemplates} active`,
          href: "/admin/templates",
        },
        {
          label: "Subscribers",
          value: stats.totalSubscribers,
          icon: Mail,
          color: "from-rose-500 to-pink-600",
          href: "/admin/newsletter",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Overview of your Resumelyzer platform</p>
        </div>
      </div>

      {/* Maintenance mode banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-8 flex items-center justify-between gap-4 rounded-xl border p-4 transition-colors ${
          maintenance
            ? "bg-orange-500/10 border-orange-500/40"
            : "bg-gray-800 border-gray-700"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              maintenance
                ? "bg-orange-500/20"
                : "bg-gray-700"
            }`}
          >
            {maintenance ? (
              <ShieldAlert className="w-5 h-5 text-orange-400" />
            ) : (
              <Wrench className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className={`font-semibold text-sm ${
              maintenance ? "text-orange-300" : "text-white"
            }`}>
              Server Maintenance Mode
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {maintenance
                ? "Site is currently offline for visitors. Only admins can access it."
                : "Site is live and accessible to all users."}
            </p>
          </div>
        </div>

        <button
          onClick={toggleMaintenance}
          disabled={maintenanceLoading || maintenanceToggling}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus:outline-none disabled:opacity-50 ${
            maintenance
              ? "bg-orange-500 border-orange-600"
              : "bg-gray-600 border-gray-700"
          }`}
          title={maintenance ? "Turn off maintenance mode" : "Turn on maintenance mode"}
        >
          {maintenanceToggling ? (
            <Loader2 className="w-3.5 h-3.5 text-white animate-spin mx-auto" />
          ) : (
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                maintenance ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          )}
        </button>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon, color, sub, href }, i) => {
          const inner = (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-gray-800 border border-gray-700 rounded-xl p-5 ${href ? "hover:border-indigo-500 transition-colors cursor-pointer" : ""}`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-0.5">{label}</p>
              {sub && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />{sub}</p>}
            </motion.div>
          );
          return href ? <Link key={label} href={href}>{inner}</Link> : <div key={label}>{inner}</div>;
        })}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" />
              Recent Sign-ups
            </h2>
            <Link href="/admin/users" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <p className="text-gray-500 text-sm">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.full_name?.[0]?.toUpperCase() ?? u.email?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{u.full_name ?? "—"}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">
                    {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Analyses */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Recent Analyses
            </h2>
          </div>
          {recentAnalyses.length === 0 ? (
            <p className="text-gray-500 text-sm">No analyses yet.</p>
          ) : (
            <div className="space-y-3">
              {recentAnalyses.map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{a.resume_filename ?? "Resume"}</p>
                    <p className="text-xs text-gray-400 truncate">{a.profiles?.email ?? "unknown"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {a.overall_grade && (
                      <span className={`text-sm font-bold ${GRADE_COLOR[a.overall_grade] ?? "text-gray-400"}`}>
                        {a.overall_grade}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(a.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/admin/users", label: "Manage Users", icon: Users, desc: "View, search, and promote users" },
          { href: "/admin/templates", label: "Manage Templates", icon: FileCode2, desc: "Add or edit resume templates" },
          { href: "/admin/newsletter", label: "Send Newsletter", icon: Mail, desc: "Email all subscribers" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-4 p-4 bg-gray-800 border border-gray-700 hover:border-indigo-500 rounded-xl transition-colors group"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-700 group-hover:bg-indigo-600 flex items-center justify-center transition-colors shrink-0">
              <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
            </div>
            <div>
              <p className="font-medium text-white text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 ml-auto mt-3 shrink-0 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
