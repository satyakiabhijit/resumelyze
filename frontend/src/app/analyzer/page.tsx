"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  Upload,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";

import FileUpload from "@/components/FileUpload";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import ModeSelector from "@/components/ModeSelector";
import ResultsDashboard from "@/components/ResultsDashboard";
import LoadingAnimation from "@/components/LoadingAnimation";
import SignInModal from "@/components/SignInModal";
import SaveToProfileModal from "@/components/SaveToProfileModal";
import { analyzeResume, checkHealth, getAvailableModes } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { popSavedResult } from "@/components/ResultsDashboard";
import type { AnalysisResult, AnalysisMode } from "@/types";

export default function AnalyzerPage() {
  const { user } = useAuth();
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [modes, setModes] = useState<AnalysisMode[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSaveToProfile, setShowSaveToProfile] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await checkHealth();
        setBackendStatus("online");
        const modesData = await getAvailableModes();
        setModes(modesData.modes);
      } catch {
        setBackendStatus("offline");
        toast.error("ML server is offline. Start it with: cd ml-server && python -m app.main");
      }
    }
    init();
  }, []);

  // Restore analysis result after login redirect (saved in sessionStorage by SignInGate)
  useEffect(() => {
    const saved = popSavedResult();
    if (saved) {
      setResult(saved);
      toast.success("Welcome back! Your analysis results have been restored.");
    }
  }, []);

  // Also restore if user just signed in (auth state change) and result is still null
  useEffect(() => {
    if (user && !result) {
      const saved = popSavedResult();
      if (saved) {
        setResult(saved);
        toast.success("Welcome! Your analysis results have been restored.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function handleAnalyze() {
    if (!jd.trim()) {
      toast.error("Please paste a job description");
      return;
    }
    if (inputMode === "file" && !file) {
      toast.error("Please upload your resume");
      return;
    }
    if (inputMode === "text" && (!resumeText || resumeText.trim().length < 50)) {
      toast.error("Please enter your resume text (at least 50 characters)");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeResume(
        jd,
        inputMode === "file" ? file : null,
        inputMode === "text" ? resumeText : null,
      );
      setResult(data);
      toast.success("Analysis complete!");

      if (user) {
        // Logged-in: save history + ask to save profile data
        saveHistory(data);
        setTimeout(() => setShowSaveToProfile(true), 800);
      } else {
        // Not logged in: nudge to sign up after a short pause
        setTimeout(() => setShowSignInModal(true), 1200);
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      let msg = "Analysis failed. Please try again.";
      if (typeof detail === "string" && detail.length > 0) {
        msg = detail.length > 150 ? detail.slice(0, 150) + "…" : detail;
      } else if (error.message) {
        msg = error.message.length > 150 ? error.message.slice(0, 150) + "…" : error.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function saveHistory(data: AnalysisResult) {
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_filename: file?.name || "pasted-text",
          job_description: jd,
          result: data,
        }),
      });
    } catch {
      // silent
    }
  }



  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Sign-in modal (shown after analysis when not logged in) */}
      <SignInModal open={showSignInModal} onClose={() => setShowSignInModal(false)} />

      {/* Save-to-profile popup (shown after analysis for logged-in users) */}
      <SaveToProfileModal
        open={showSaveToProfile}
        onClose={() => setShowSaveToProfile(false)}
        resumeFile={inputMode === "file" ? file : null}
        resumeText={inputMode === "text" ? resumeText : null}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Resume Analyzer
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered resume analysis with ATS scoring, keyword optimization, and
          actionable improvement suggestions.
        </p>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {[
            { icon: BrainCircuit, text: "AI + NLP Analysis" },
            { icon: Shield, text: "ATS Compatible" },
            { icon: Zap, text: "Instant Results" },
            { icon: Sparkles, text: "Smart Suggestions" },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-sm text-brand-700"
            >
              <Icon size={14} />
              {text}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Input Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="grid lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Job Description */}
        <div className="glass-card p-6">
          <JobDescriptionInput value={jd} onChange={setJd} />
        </div>

        {/* Resume Input */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileText size={20} className="text-brand-400" />
              Your Resume
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
              <button
                onClick={() => setInputMode("file")}
                className={`px-3 py-1 rounded-md transition ${
                  inputMode === "file"
                    ? "bg-brand-600 text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Upload size={14} className="inline mr-1" />
                Upload
              </button>
              <button
                onClick={() => setInputMode("text")}
                className={`px-3 py-1 rounded-md transition ${
                  inputMode === "text"
                    ? "bg-brand-600 text-white"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <FileText size={14} className="inline mr-1" />
                Paste Text
              </button>
            </div>
          </div>

          {inputMode === "file" ? (
            <FileUpload file={file} onFileChange={setFile} />
          ) : (
            <textarea
              value={resumeText || ""}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          )}
        </div>
      </motion.div>

      {/* Mode Selector + Analyze Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
      >
        <ModeSelector
          modes={modes}
          selected="ml"
          onSelect={() => {}}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || backendStatus === "offline"}
          className="group flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-300 hover:shadow-brand-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Analyze Resume
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </>
          )}
        </button>
      </motion.div>

      {/* Loading */}
      <AnimatePresence>{loading && <LoadingAnimation />}</AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <ResultsDashboard result={result} jd={jd} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
