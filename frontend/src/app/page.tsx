"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Zap,
  Shield,
  BrainCircuit,
  ArrowRight,
  Mail,
  Search,
  ClipboardList,
  BookOpen,
  CheckCircle2,
  Target,
  TrendingUp,
  Hash,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Resume Analyzer",
    description:
      "Get instant ATS scores, keyword analysis, section-wise feedback, and actionable improvement suggestions powered by AI + NLP.",
    href: "/analyzer",
    color: "from-brand-500 to-purple-500",
    badge: "Core",
  },
  {
    icon: Mail,
    title: "Cover Letter Generator",
    description:
      "Generate a personalized, job-tailored cover letter from your resume and the job description. Choose your tone: professional, creative, or conversational.",
    href: "/cover-letter",
    color: "from-pink-500 to-rose-500",
    badge: "AI-Powered",
  },
  {
    icon: Search,
    title: "AI Skills Finder",
    description:
      "Discover the exact technical and soft skills employers want for any role. See which skills you have and which you need to add.",
    href: "/skills",
    color: "from-cyan-500 to-blue-500",
    badge: "AI-Powered",
  },
  {
    icon: ClipboardList,
    title: "Job Tracker",
    description:
      "Track all your job applications in one place. Manage your pipeline from Saved to Applied to Interview to Offer.",
    href: "/tracker",
    color: "from-emerald-500 to-teal-500",
    badge: "New",
  },
  {
    icon: BookOpen,
    title: "Resume Writing Guide",
    description:
      "Expert tips on action verbs, quantification, cliché avoidance, ATS optimization, and section checklists.",
    href: "/guide",
    color: "from-amber-500 to-orange-500",
    badge: "Free",
  },
];

const analysisFeatures = [
  { icon: Shield, text: "ATS Compatibility Check", desc: "Ensure your resume passes automated screening" },
  { icon: Target, text: "JD Match Scoring", desc: "See how well your resume aligns with the job" },
  { icon: AlertTriangle, text: "Cliché Detection", desc: "Flag overused phrases with better alternatives" },
  { icon: Zap, text: "Action Verb Analysis", desc: "Identify weak verbs and suggest powerful replacements" },
  { icon: Hash, text: "Quantification Checker", desc: "Find bullet points that need numbers and metrics" },
  { icon: RefreshCw, text: "AI Content Rewriting", desc: "Get improved versions of your bullet points" },
  { icon: TrendingUp, text: "Section-wise Scoring", desc: "Detailed feedback for every resume section" },
  { icon: CheckCircle2, text: "Smart Suggestions", desc: "Prioritized action items to improve your resume" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center py-16 sm:py-24"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-sm mb-6"
        >
          <Sparkles size={14} />
          AI-Powered Resume Intelligence Platform
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-extrabold mb-6">
          <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Resumelyzer
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Analyze, optimize, and supercharge your resume with AI. Get ATS scores,
          keyword optimization, content improvements, cover letters, skills analysis,
          and job tracking — all in one platform.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/analyzer"
            className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-300 hover:shadow-brand-500/40 hover:scale-105"
          >
            <BrainCircuit size={20} />
            Analyze Your Resume
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/guide"
            className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-xl border border-gray-700 transition-all duration-300 hover:scale-105"
          >
            <BookOpen size={20} />
            Resume Writing Guide
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          {[
            { label: "Analysis Modes", value: "3" },
            { label: "Scoring Dimensions", value: "8+" },
            { label: "AI Models", value: "Gemini" },
            { label: "Free to Use", value: "100%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feature Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
      >
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <motion.div key={feature.title} variants={item}>
              <Link href={feature.href} className="block group">
                <div className="glass-card p-6 h-full transition-all duration-300 hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand-500/5 hover:scale-[1.02]">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                    >
                      <Icon size={20} className="text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-brand-400 transition">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-sm text-brand-400 group-hover:gap-2 transition-all">
                    Get started <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Analysis Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold text-center mb-3">
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Comprehensive Resume Analysis
          </span>
        </h2>
        <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">
          Every dimension of your resume is evaluated — from ATS compatibility to
          content quality, keyword alignment, and writing style.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {analysisFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.text} className="glass-card p-4 text-center">
                <Icon size={24} className="mx-auto text-brand-400 mb-2" />
                <h4 className="text-sm font-semibold text-white mb-1">{f.text}</h4>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold text-center mb-10">
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              step: "1",
              title: "Upload Resume",
              desc: "Upload your resume PDF/DOCX or paste the text directly.",
              icon: FileText,
            },
            {
              step: "2",
              title: "Paste Job Description",
              desc: "Add the job posting you're targeting for tailored analysis.",
              icon: Target,
            },
            {
              step: "3",
              title: "AI Analysis",
              desc: "Our AI + NLP engine scores your resume across 8+ dimensions.",
              icon: BrainCircuit,
            },
            {
              step: "4",
              title: "Improve & Apply",
              desc: "Follow actionable suggestions, generate a cover letter, and apply.",
              icon: TrendingUp,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
                  {s.step}
                </div>
                <h4 className="font-semibold text-white mb-2">{s.title}</h4>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center py-16 glass-card rounded-2xl mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to optimize your resume?
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Start analyzing for free. No signup required. Get instant, actionable
          feedback powered by AI.
        </p>
        <Link
          href="/analyzer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all duration-300 hover:shadow-brand-500/40 hover:scale-105"
        >
          <Sparkles size={20} />
          Analyze Your Resume Now
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}
