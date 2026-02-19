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
import { analyzeResume, checkHealth, getAvailableModes } from "@/lib/api";
import type { AnalysisResult, AnalysisMode } from "@/types";

export default function AnalyzerPage() {
  const [jd, setJd] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"file" | "text">("file");
  const [analysisMode, setAnalysisMode] = useState("ai");
  const [modes, setModes] = useState<AnalysisMode[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    async function init() {
      try {
        await checkHealth();
        setBackendStatus("online");
        const modesData = await getAvailableModes();
        setModes(modesData.modes);
        setAnalysisMode(modesData.default);
      } catch {
        setBackendStatus("offline");
        toast.error("Could not connect to API. Please try again.");
      }
    }
    init();
  }, []);

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
        analysisMode
      );
      setResult(data);
      toast.success(`Analysis complete! (${data.analysis_mode} mode)`);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      let msg = "Analysis failed. Please try again.";
      if (detail && typeof detail === "object") {
        msg = detail.message || msg;
      } else if (typeof detail === "string" && detail.length > 0) {
        // Trim excessively long Gemini error dumps to a single clean sentence
        if (detail.includes("API key expired") || detail.includes("Please renew the API key")) {
          msg = "Your Google API key has expired. Please renew it and update GOOGLE_API_KEY in frontend/.env.local.";
        } else {
          msg = detail.length > 120 ? detail.slice(0, 120) + "…" : detail;
        }
      } else if (error.message) {
        msg = error.message.length > 120 ? error.message.slice(0, 120) + "…" : error.message;
      }
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Resume Analyzer
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-sm text-brand-300"
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
            <div className="flex bg-gray-800 rounded-lg p-1 text-sm">
              <button
                onClick={() => setInputMode("file")}
                className={`px-3 py-1 rounded-md transition ${
                  inputMode === "file"
                    ? "bg-brand-600 text-white"
                    : "text-gray-400 hover:text-white"
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
                    : "text-gray-400 hover:text-white"
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
              className="w-full h-64 bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
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
          selected={analysisMode}
          onSelect={setAnalysisMode}
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
