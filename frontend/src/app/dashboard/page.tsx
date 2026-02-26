"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Mail,
  Trash2,
  Clock,
  BarChart3,
  Target,
  Shield,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { AnalysisHistoryRow, CoverLetterRow } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<"analyses" | "letters">("analyses");
  const [analyses, setAnalyses] = useState<AnalysisHistoryRow[]>([]);
  const [letters, setLetters] = useState<CoverLetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);      // cover letters
  const [viewingReportId, setViewingReportId] = useState<string | null>(null); // analysis reports

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const [aRes, lRes] = await Promise.all([
          fetch("/api/history"),
          fetch("/api/saved-letters"),
        ]);
        if (aRes.ok) setAnalyses(await aRes.json());
        if (lRes.ok) setLetters(await lRes.json());
      } catch {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function deleteAnalysis(id: string) {
    const res = await fetch(`/api/history?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Analysis deleted");
    }
  }

  async function deleteLetter(id: string) {
    const res = await fetch(`/api/saved-letters?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setLetters((prev) => prev.filter((l) => l.id !== id));
      toast.success("Cover letter deleted");
    }
  }

  function copyLetterText(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function downloadLetter(letter: CoverLetterRow) {
    const blob = new Blob([letter.cover_letter_text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${letter.title || "cover-letter"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-2">
          My Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}! Here&apos;s your saved work.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-brand-400">{analyses.length}<span className="text-sm font-normal text-gray-400">/5</span></div>
          <div className="text-xs text-gray-500 mt-1">Analyses</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{letters.length}</div>
          <div className="text-xs text-gray-500 mt-1">Cover Letters</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {analyses.length > 0
              ? Math.round(analyses.reduce((a, r) => a + (r.jd_match || 0), 0) / analyses.length)
              : 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg Match</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {analyses.length > 0
              ? Math.round(analyses.reduce((a, r) => a + (r.ats_score || 0), 0) / analyses.length)
              : 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">Avg ATS</div>
        </div>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setTab("analyses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            tab === "analyses"
              ? "bg-brand-50 text-brand-700 border border-brand-200"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <BarChart3 size={16} />
          Analyses ({analyses.length}/5)
        </button>
        <button
          onClick={() => setTab("letters")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            tab === "letters"
              ? "bg-brand-50 text-brand-700 border border-brand-200"
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          <Mail size={16} />
          Cover Letters ({letters.length})
        </button>
      </div>

      {/* Analyses Tab */}
      <AnimatePresence mode="wait">
        {tab === "analyses" && (
          <motion.div
            key="analyses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {analyses.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No analyses saved yet. Go analyze a resume!</p>
              </div>
            ) : (
              analyses.slice(0, 5).map((a, idx) => {
                const isViewing = viewingReportId === a.id;
                return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="glass-card p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={14} className="text-gray-400" />
                        <span className="font-medium text-gray-900 truncate">
                          {a.resume_filename || "Resume"}
                        </span>
                        {a.overall_grade && (
                            <span className="px-1.5 py-0.5 text-xs font-bold bg-brand-50 text-brand-700 rounded">
                            {a.overall_grade}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {a.job_description_preview || "No JD preview"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm w-full sm:w-auto sm:flex-shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-brand-400">
                          <Target size={12} />
                          <span className="font-semibold">{a.jd_match ?? 0}%</span>
                        </div>
                        <div className="text-[10px] text-gray-600">Match</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-green-400">
                          <Shield size={12} />
                          <span className="font-semibold">{a.ats_score ?? 0}%</span>
                        </div>
                        <div className="text-[10px] text-gray-600">ATS</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock size={12} />
                          <span className="text-xs">
                            {new Date(a.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {/* View Full Report */}
                      <button
                        onClick={() => setViewingReportId(isViewing ? null : a.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          isViewing
                            ? "bg-brand-50 text-brand-700 border border-brand-200"
                            : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700 border border-gray-200"
                        }`}
                        title={isViewing ? "Collapse report" : "View full report"}
                      >
                        {isViewing ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                        {isViewing ? "Collapse" : "Full Report"}
                      </button>
                      <button
                        onClick={() => deleteAnalysis(a.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Inline full report */}
                  <AnimatePresence>
                    {isViewing && a.full_result && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 overflow-hidden"
                      >
                        <div className="border-t border-gray-200 pt-6">
                          <ResultsDashboard
                            result={a.full_result}
                            jd={a.job_description_preview || ""}
                          />
                        </div>
                      </motion.div>
                    )}
                    {isViewing && !a.full_result && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-4 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500"
                      >
                        Detailed report not available for this entry (saved before full-result storage was enabled).
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Cover Letters Tab */}
        {tab === "letters" && (
          <motion.div
            key="letters"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {letters.length === 0 ? (
              <div className="text-center py-16">
                <Mail size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No cover letters saved yet. Go generate one!</p>
              </div>
            ) : (
              letters.map((l, idx) => {
                const isExpanded = expandedId === l.id;
                return (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="glass-card p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail size={14} className="text-purple-400" />
                          <span className="font-medium text-gray-900 truncate">
                            {l.title || "Cover Letter"}
                          </span>
                            <span className="px-1.5 py-0.5 text-xs bg-purple-50 text-purple-700 rounded capitalize">
                            {l.tone}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {l.company_name && `${l.company_name} • `}
                          {l.word_count} words •{" "}
                          {new Date(l.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 w-full sm:w-auto sm:flex-shrink-0">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : l.id)}
                        className="p-1.5 text-gray-500 hover:text-gray-700 transition"
                          title="Preview"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => copyLetterText(l.cover_letter_text)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 transition"
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => downloadLetter(l)}
                          className="p-1.5 text-gray-500 hover:text-gray-700 transition"
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => deleteLetter(l.id)}
                          className="p-1.5 text-gray-500 hover:text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded preview */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap max-h-80 overflow-y-auto">
                            {l.cover_letter_text}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
