"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  FileText,
  Mail,
  Sparkles,
  Copy,
  Download,
  Upload,
  Briefcase,
  Palette,
} from "lucide-react";
import { generateCoverLetter } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import FileUpload from "@/components/FileUpload";
import type { CoverLetterResult } from "@/types";

export default function CoverLetterPage() {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState("");
  const [jd, setJd] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [tone, setTone] = useState<"professional" | "creative" | "conversational">("professional");
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputMode, setInputMode] = useState<"file" | "text">("text");
  const [file, setFile] = useState<File | null>(null);

  async function handleGenerate() {
    if (!jd.trim()) {
      toast.error("Please paste a job description");
      return;
    }
    if (inputMode === "text" && resumeText.trim().length < 50) {
      toast.error("Please enter your resume text (at least 50 characters)");
      return;
    }
    if (inputMode === "file" && !file) {
      toast.error("Please upload your resume");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      let textToSend = resumeText;
      if (inputMode === "file" && file) {
        textToSend = await file.text();
      }

      const data = await generateCoverLetter(textToSend, jd, tone, companyName, roleTitle);
      setResult(data);
      toast.success("Cover letter generated!");

      // Auto-save to DB if logged in
      if (user) {
        try {
          await fetch("/api/saved-letters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              company_name: companyName,
              role_title: roleTitle,
              tone,
              cover_letter_text: data.cover_letter,
              word_count: data.word_count,
              job_description: jd,
            }),
          });
        } catch {
          // Silent fail
        }
      }
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error.message || "Generation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (result) {
      navigator.clipboard.writeText(result.cover_letter);
      toast.success("Copied to clipboard!");
    }
  }

  function handleDownload() {
    if (result) {
      const blob = new Blob([result.cover_letter], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter-${companyName || "generated"}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  const toneOptions = [
    { value: "professional" as const, label: "Professional", desc: "Formal and business-appropriate" },
    { value: "creative" as const, label: "Creative", desc: "Bold and personality-forward" },
    { value: "conversational" as const, label: "Conversational", desc: "Friendly and approachable" },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Cover Letter Generator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          AI-powered cover letter generation tailored to your resume and the job description.
          One click, fully personalized.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Left Column — Inputs */}
        <div className="space-y-6">
          {/* Job Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Briefcase size={18} className="text-brand-400" />
              Job Description
            </h2>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the complete job description here..."
              className="w-full h-48 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
          </motion.div>

          {/* Resume Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText size={18} className="text-brand-400" />
                Your Resume
              </h2>
              <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
                <button
                  onClick={() => setInputMode("text")}
                  className={`px-3 py-1 rounded-md transition ${inputMode === "text" ? "bg-brand-600 text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                  Paste Text
                </button>
                <button
                  onClick={() => setInputMode("file")}
                  className={`px-3 py-1 rounded-md transition ${inputMode === "file" ? "bg-brand-600 text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                  <Upload size={14} className="inline mr-1" />
                  Upload
                </button>
              </div>
            </div>
            {inputMode === "text" ? (
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="w-full h-48 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            ) : (
              <FileUpload file={file} onFileChange={setFile} />
            )}
          </motion.div>

          {/* Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Palette size={18} className="text-brand-400" />
              Options
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Google"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Role Title</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <label className="text-sm text-gray-600 mb-2 block">Tone</label>
            <div className="grid sm:grid-cols-3 gap-3">
              {toneOptions.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  className={`p-3 rounded-lg border text-left transition ${
                    tone === t.value
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-300 hover:shadow-brand-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate Cover Letter
                </>
              )}
            </button>
          </motion.div>
        </div>

        {/* Right Column — Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mail size={18} className="text-brand-400" />
              Generated Cover Letter
            </h2>
            {result && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg transition"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg transition"
                  title="Download as .txt"
                >
                  <Download size={16} />
                </button>
              </div>
            )}
          </div>

          {result ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-gray-50 rounded-xl p-6 mb-4 overflow-y-auto max-h-[600px]">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {result.cover_letter}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Tone: <span className="text-brand-600 capitalize">{result.tone}</span></span>
                <span>{result.word_count} words</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <Mail size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Your AI-generated cover letter will appear here.
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Fill in the details and click Generate.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
