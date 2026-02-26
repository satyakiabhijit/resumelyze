"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Users,
  History,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  subscribed_at: string;
  is_active: boolean;
}

interface NewsletterHistory {
  id: string;
  subject: string;
  recipient_count: number;
  status: string;
  sent_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
}

type Tab = "compose" | "subscribers" | "history";

export default function AdminNewsletterPage() {
  const [tab, setTab] = useState<Tab>("compose");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [history, setHistory] = useState<NewsletterHistory[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Compose form
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoadingSubs(true);
    const r = await fetch("/api/admin/newsletter?type=subscribers");
    const d = await r.json();
    setSubscribers(d.subscribers ?? []);
    setLoadingSubs(false);
  }, []);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    const r = await fetch("/api/admin/newsletter?type=history");
    const d = await r.json();
    setHistory(d.history ?? []);
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    if (tab === "subscribers") fetchSubscribers();
    if (tab === "history") fetchHistory();
  }, [tab, fetchSubscribers, fetchHistory]);

  const removeSubscriber = async (id: string) => {
    const r = await fetch("/api/admin/newsletter", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const d = await r.json();
    if (d.success) {
      toast.success("Subscriber removed");
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } else {
      toast.error(d.error ?? "Failed to remove subscriber");
    }
  };

  const sendNewsletter = async () => {
    if (!subject.trim() || !bodyHtml.trim()) {
      toast.error("Subject and body are required");
      return;
    }
    setSending(true);
    const r = await fetch("/api/admin/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, bodyHtml, bodyText: bodyHtml.replace(/<[^>]+>/g, "") }),
    });
    const d = await r.json();
    setSending(false);

    if (d.success) {
      if (d.emailSent) {
        toast.success(`Newsletter sent to ${d.recipientCount} subscribers!`);
      } else {
        toast.success(`Newsletter logged (${d.recipientCount} subscribers). ${d.warning ?? "Add RESEND_API_KEY to actually send emails."}`);
      }
      setSubject("");
      setBodyHtml("");
      setPreview(false);
    } else {
      toast.error(d.error ?? "Failed to send newsletter");
    }
  };

  const TABS = [
    { id: "compose" as Tab, label: "Compose", icon: Mail },
    { id: "subscribers" as Tab, label: "Subscribers", icon: Users },
    { id: "history" as Tab, label: "History", icon: History },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Newsletter</h1>
        <p className="text-gray-400 text-sm mt-1">Compose and send emails to all subscribers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-800 rounded-xl border border-gray-700 w-fit mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === id ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Compose ── */}
        {tab === "compose" && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 bg-indigo-900/30 border border-indigo-700 rounded-xl text-sm text-indigo-300">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong>Email delivery:</strong> Add <code className="bg-indigo-900/50 px-1 rounded">RESEND_API_KEY</code> to{" "}
                <code className="bg-indigo-900/50 px-1 rounded">.env.local</code> to send real emails via{" "}
                <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  Resend
                </a>
                . Without it, newsletters are logged but not emailed.
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. New features in Resumelyzer 🚀"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-300">Body (HTML supported)</label>
                <button
                  onClick={() => setPreview((p) => !p)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
                >
                  {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
              {preview ? (
                <div
                  className="min-h-48 bg-white rounded-lg p-5 text-gray-900 text-sm overflow-auto border border-gray-300"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              ) : (
                <textarea
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  rows={14}
                  placeholder={`<h1>Hello Resumelyzer Users!</h1>\n<p>We have exciting news...</p>\n\n<p>Best,<br/>The Resumelyzer Team</p>`}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 font-mono resize-y"
                />
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={sendNewsletter}
                disabled={sending || !subject.trim() || !bodyHtml.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "Sending…" : "Send Newsletter"}
              </button>
              <p className="text-xs text-gray-500">Will be sent to all active subscribers</p>
            </div>
          </motion.div>
        )}

        {/* ── Subscribers ── */}
        {tab === "subscribers" && (
          <motion.div key="subscribers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-400">{subscribers.length} active subscribers</p>
              <button onClick={fetchSubscribers} className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingSubs ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No subscribers yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {subscribers.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-3.5 bg-gray-800 border border-gray-700 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {s.name?.[0]?.toUpperCase() ?? s.email[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      {s.name && <p className="text-sm text-white">{s.name}</p>}
                      <p className="text-sm text-gray-400 truncate">{s.email}</p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{new Date(s.subscribed_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => removeSubscriber(s.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/30 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── History ── */}
        {tab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-400">Sent newsletter history</p>
              <button onClick={fetchHistory} className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:text-white transition">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 text-indigo-400 animate-spin" /></div>
            ) : history.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <History className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No newsletters sent yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-4 px-5 py-4 bg-gray-800 border border-gray-700 rounded-xl"
                  >
                    <div className={`mt-0.5 shrink-0 ${n.status === "sent" ? "text-emerald-400" : "text-red-400"}`}>
                      {n.status === "sent" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{n.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Sent to {n.recipient_count} subscribers by {n.profiles?.full_name ?? n.profiles?.email ?? "Admin"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${n.status === "sent" ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>
                        {n.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{new Date(n.sent_at).toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
