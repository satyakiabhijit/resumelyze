"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Briefcase,
  Code2,
  Users,
  Layers,
  Copy,
} from "lucide-react";
import { findSkills } from "@/lib/api";
import type { SkillsFinderResult } from "@/types";

export default function SkillsFinderPage() {
  const [jd, setJd] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [result, setResult] = useState<SkillsFinderResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFind() {
    if (!jd.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await findSkills(jd, resumeText || undefined, roleTitle || undefined);
      setResult(data);
      toast.success("Skills analysis complete!");
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error.message || "Skills analysis failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function copySkills(skills: string[]) {
    navigator.clipboard.writeText(skills.join(", "));
    toast.success("Skills copied to clipboard!");
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-4">
          AI Skills Finder
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover the exact skills employers are looking for. Get comprehensive
          hard skills and soft skills recommendations for any role.
        </p>
      </motion.div>

      {/* Input Section */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-brand-400" />
            Job Description
          </h2>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the job description here to discover required skills..."
            className="w-full h-48 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 space-y-4"
        >
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Target Role (optional)</label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Your Resume (optional — for gap analysis)
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume to see which skills you're missing..."
              className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none text-sm"
            />
          </div>

          <button
            onClick={handleFind}
            disabled={loading}
            className="w-full group flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-300 hover:shadow-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search size={18} />
                Find Skills
              </>
            )}
          </button>
        </motion.div>
      </div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Role Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Skills for <span className="text-brand-600">{result.role}</span>
            </h2>
          </div>

          {/* Gap Analysis — if resume was provided */}
          {(result.matching_in_resume.length > 0 || result.missing_from_resume.length > 0) && (
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-400" />
                    You Have ({result.matching_in_resume.length})
                  </h3>
                  <button
                    onClick={() => copySkills(result.matching_in_resume)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 transition"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.matching_in_resume.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <XCircle size={18} className="text-red-400" />
                    You're Missing ({result.missing_from_resume.length})
                  </h3>
                  <button
                    onClick={() => copySkills(result.missing_from_resume)}
                    className="p-1.5 text-gray-500 hover:text-gray-700 transition"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missing_from_resume.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Hard Skills by Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
              <Code2 size={18} className="text-brand-400" />
              Technical / Hard Skills
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {result.hard_skills.map((category, idx) => (
                <div key={idx}>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers size={14} className="text-purple-400" />
                    <h4 className="text-sm font-medium text-purple-700">{category.category}</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => {
                      const isMatching = result.matching_in_resume.some(
                        (s) => s.toLowerCase() === skill.toLowerCase()
                      );
                      return (
                        <span
                          key={skill}
                          className={`px-3 py-1 rounded-full text-sm border ${
                            isMatching
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-gray-100 border-gray-200 text-gray-700"
                          }`}
                        >
                          {isMatching && "✓ "}{skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Soft Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Users size={18} className="text-pink-400" />
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.soft_skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-pink-50 border border-pink-200 text-pink-700 rounded-lg text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-16"
        >
          <Sparkles size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            Paste a job description to discover the skills employers want
          </p>
        </motion.div>
      )}
    </div>
  );
}
