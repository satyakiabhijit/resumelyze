"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2, Send } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;
    setLoading(true);
    const r = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const d = await r.json();
    setLoading(false);
    if (d.success) {
      setDone(true);
      setEmail("");
    } else {
      setError(d.error ?? "Something went wrong. Please try again.");
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-2.5 mt-3 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="text-sm font-medium text-emerald-700">
          You&apos;re subscribed! ðŸŽ‰
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={subscribe} className="mt-3 space-y-2">
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition shadow-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {loading ? "Subscribingâ€¦" : "Subscribe for free"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}

