"use client";

import { motion } from "framer-motion";
import {
  Target,
  Shield,
  Tag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookOpen,
  Briefcase,
  TrendingUp,
  FileSearch,
  ExternalLink,
  Zap,
  Hash,
  RefreshCw,
  Award,
  ArrowRight,
} from "lucide-react";
import ScoreCircle from "./ScoreCircle";
import { getScoreColor, getScoreBg, getScoreLabel } from "@/lib/utils";
import type { AnalysisResult } from "@/types";

interface ResultsDashboardProps {
  result: AnalysisResult;
  jd: string;
}

export default function ResultsDashboard({ result, jd }: ResultsDashboardProps) {
  // Derive domain for job search links
  const domainKeywords = [
    "data science", "software", "frontend", "backend", "AI", "machine learning",
    "cybersecurity", "marketing", "finance", "design", "sales", "product", "cloud", "devops",
    "react", "python", "java", "fullstack", "full stack",
  ];
  let domain = "software-developer";
  for (const kw of domainKeywords) {
    if (jd.toLowerCase().includes(kw.toLowerCase())) {
      domain = kw.replace(/\s+/g, "-").toLowerCase();
      break;
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
          Analysis Report
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Mode: <span className="text-brand-400 capitalize">{result.analysis_mode}</span>
        </p>
      </div>

      {/* ── Score Cards ── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* JD Match */}
        <div className="glass-card p-6 flex flex-col items-center">
          <Target size={20} className="text-brand-400 mb-2" />
          <h3 className="text-sm text-gray-400 font-medium mb-3">JD Match</h3>
          <ScoreCircle score={result.jd_match} size={120} />
          <p className={`mt-2 text-sm font-semibold ${getScoreColor(result.jd_match)}`}>
            {getScoreLabel(result.jd_match)}
          </p>
        </div>

        {/* ATS Score */}
        <div className="glass-card p-6 flex flex-col items-center">
          <Shield size={20} className="text-purple-400 mb-2" />
          <h3 className="text-sm text-gray-400 font-medium mb-3">ATS Score</h3>
          <ScoreCircle score={result.ats_score} size={120} />
          <p className={`mt-2 text-sm font-semibold ${getScoreColor(result.ats_score)}`}>
            {getScoreLabel(result.ats_score)}
          </p>
        </div>

        {/* Readability */}
        <div className="glass-card p-6 flex flex-col items-center">
          <BookOpen size={20} className="text-pink-400 mb-2" />
          <h3 className="text-sm text-gray-400 font-medium mb-3">Readability</h3>
          <ScoreCircle score={result.readability_score} size={120} />
          <p className={`mt-2 text-sm font-semibold ${getScoreColor(result.readability_score)}`}>
            {getScoreLabel(result.readability_score)}
          </p>
        </div>
      </motion.div>

      {/* ── Keywords ── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Found Keywords */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-green-400" />
            Found Keywords ({result.found_keywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.found_keywords.length > 0 ? (
              result.found_keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-300 rounded-full text-sm"
                >
                  {kw}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No matching keywords detected</p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-400" />
            Missing Keywords ({result.missing_keywords.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missing_keywords.length > 0 ? (
              result.missing_keywords.map((kw) => (
                <span
                  key={kw}
                  className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-full text-sm"
                >
                  {kw}
                </span>
              ))
            ) : (
              <p className="text-green-400">✅ All key terms are present!</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Section Scores ── */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
          <TrendingUp size={18} className="text-brand-400" />
          Section-wise Analysis
        </h3>
        <div className="space-y-4">
          {Object.entries(result.section_scores).map(([section, data]) => (
            <div key={section} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <span className="capitalize font-medium text-gray-300">
                  {section}
                </span>
                <span className={`text-sm font-semibold ${getScoreColor(data.score)}`}>
                  {data.score}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.score}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full rounded-full ${getScoreBg(data.score)}`}
                />
              </div>
              {data.suggestion && (
                <p className="text-gray-500 text-sm mt-1.5 group-hover:text-gray-400 transition">
                  💡 {data.suggestion}
                </p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Strengths & Weaknesses ── */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-green-400" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <XCircle size={18} className="text-red-400" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                <span className="text-red-400 mt-0.5">✗</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ── Action Items ── */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-yellow-400" />
          Action Items
        </h3>
        <div className="space-y-3">
          {result.action_items.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <p className="text-gray-300 text-sm">{action}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Profile Summary ── */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <FileSearch size={18} className="text-brand-400" />
          Profile Summary
          {result.overall_grade && (
            <span className="ml-auto px-3 py-1 rounded-full text-sm font-bold bg-brand-500/10 border border-brand-500/20 text-brand-300">
              Grade: {result.overall_grade}
            </span>
          )}
        </h3>
        <p className="text-gray-300 leading-relaxed">{result.profile_summary}</p>

        {result.formatting_feedback && (
          <div className="mt-4 p-3 bg-brand-500/5 border border-brand-500/10 rounded-lg">
            <p className="text-gray-400 text-sm">
              📝 <strong>Formatting:</strong> {result.formatting_feedback}
            </p>
          </div>
        )}

        {typeof result.section_completeness === "number" && result.section_completeness > 0 && (
          <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Section Completeness</span>
              <span className={`text-sm font-semibold ${getScoreColor(result.section_completeness)}`}>
                {result.section_completeness}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.section_completeness}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${getScoreBg(result.section_completeness)}`}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Cliché Detection ── */}
      {result.cliches && result.cliches.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-400" />
            Clichés Detected ({result.cliches.length})
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            These overused phrases weaken your resume. Replace them with specific, quantified achievements.
          </p>
          <div className="space-y-3">
            {result.cliches.map((c, i) => (
              <div
                key={i}
                className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-lg grid sm:grid-cols-2 gap-3"
              >
                <div className="flex items-start gap-2">
                  <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-red-400 font-medium mb-0.5">CLICHÉ</div>
                    <p className="text-gray-400 text-sm line-through">&ldquo;{c.phrase}&rdquo;</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-green-400 font-medium mb-0.5">SUGGESTION</div>
                    <p className="text-gray-300 text-sm">{c.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Action Verb Analysis ── */}
      {result.action_verb_analysis && (
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Zap size={18} className="text-yellow-400" />
            Action Verb Analysis
            <span className={`ml-auto text-sm font-semibold ${getScoreColor(result.action_verb_analysis.score)}`}>
              {result.action_verb_analysis.score}%
            </span>
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {result.action_verb_analysis.strong_verbs.length > 0 && (
              <div>
                <h4 className="text-sm text-green-400 font-medium mb-2 flex items-center gap-1">
                  <CheckCircle2 size={13} /> Strong Verbs Found
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.action_verb_analysis.strong_verbs.map((v) => (
                    <span
                      key={v}
                      className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-300 rounded-full text-xs"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {result.action_verb_analysis.weak_verbs.length > 0 && (
              <div>
                <h4 className="text-sm text-red-400 font-medium mb-2 flex items-center gap-1">
                  <XCircle size={13} /> Weak Verbs to Replace
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.action_verb_analysis.weak_verbs.map((v) => (
                    <span
                      key={v}
                      className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-300 rounded-full text-xs"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {result.action_verb_analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              {result.action_verb_analysis.suggestions.map((s, i) => (
                <p key={i} className="text-gray-400 text-sm flex items-start gap-2">
                  <ArrowRight size={13} className="text-brand-400 mt-0.5 flex-shrink-0" />
                  {s}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Quantification Analysis ── */}
      {result.quantification_analysis && (
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Hash size={18} className="text-cyan-400" />
            Quantification Check
            <span className={`ml-auto text-sm font-semibold ${getScoreColor(result.quantification_analysis.score)}`}>
              {result.quantification_analysis.score}%
            </span>
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="glass-card p-3 text-center flex-1">
              <div className="text-2xl font-bold text-cyan-400">
                {result.quantification_analysis.quantified_bullets}
              </div>
              <div className="text-xs text-gray-500">Quantified Bullets</div>
            </div>
            <div className="glass-card p-3 text-center flex-1">
              <div className="text-2xl font-bold text-gray-400">
                {result.quantification_analysis.total_bullets}
              </div>
              <div className="text-xs text-gray-500">Total Bullets</div>
            </div>
            <div className="glass-card p-3 text-center flex-1">
              <div className={`text-2xl font-bold ${getScoreColor(result.quantification_analysis.score)}`}>
                {result.quantification_analysis.total_bullets > 0
                  ? Math.round(
                      (result.quantification_analysis.quantified_bullets /
                        result.quantification_analysis.total_bullets) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-xs text-gray-500">With Numbers</div>
            </div>
          </div>
          {result.quantification_analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              {result.quantification_analysis.suggestions.map((s, i) => (
                <p key={i} className="text-gray-400 text-sm flex items-start gap-2">
                  <Lightbulb size={13} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  {s}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── AI Content Improvements ── */}
      {result.content_improvements && result.content_improvements.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <RefreshCw size={18} className="text-purple-400" />
            AI Content Improvements ({result.content_improvements.length})
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Here&apos;s how to rewrite key bullet points for maximum impact.
          </p>
          <div className="space-y-4">
            {result.content_improvements.map((ci, i) => (
              <div key={i} className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-lg">
                <div className="grid sm:grid-cols-2 gap-4 mb-2">
                  <div>
                    <div className="text-[10px] text-red-400 font-medium mb-1">ORIGINAL</div>
                    <p className="text-gray-400 text-sm">{ci.original}</p>
                  </div>
                  <div>
                    <div className="text-[10px] text-green-400 font-medium mb-1">IMPROVED</div>
                    <p className="text-gray-300 text-sm font-medium">{ci.improved}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <strong className="text-purple-400">Why:</strong> {ci.reason}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Recommended Roles ── */}
      {result.recommended_roles.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-purple-400" />
            Recommended Roles
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.recommended_roles.map((role) => (
              <span
                key={role}
                className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-sm font-medium"
              >
                {role}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Job Search Links ── */}
      <motion.div variants={item} className="glass-card p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Tag size={18} className="text-brand-400" />
          Explore Opportunities
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href={`https://www.linkedin.com/jobs/search/?keywords=${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition"
          >
            <ExternalLink size={16} />
            LinkedIn Jobs
          </a>
          <a
            href={`https://internshala.com/internships/${domain}-internship`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition"
          >
            <ExternalLink size={16} />
            Internshala
          </a>
          <a
            href={`https://www.indeed.com/jobs?q=${domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition"
          >
            <ExternalLink size={16} />
            Indeed Jobs
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
