"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Shield,
  Zap,
  BrainCircuit,
  Mail,
  Search,
  ClipboardList,
  FileDown,
  Target,
  Sparkles,
  BookOpen,
} from "lucide-react";

/* â”€â”€ FAQ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const faqs = [
  {
    q: "Is Resumelyzer free to use?",
    a: "Yes — analyzing your resume, generating cover letters, using the skills finder, and tracking jobs are all completely free. No credit card required.",
  },
  {
    q: "Does Resumelyzer work with ATS systems?",
    a: "Absolutely. The analyzer checks your resume against top ATS criteria: keyword density, formatting, section headings, contact-info completeness, and more — giving you an ATS compatibility score.",
  },
  {
    q: "How does the AI resume analysis work?",
    a: "You upload or paste your resume (and optionally a job description). Our Gemini AI pipeline scores it across 8+ dimensions: ATS compatibility, keyword match, action verbs, quantification, cliché detection, and per-section quality.",
  },
  {
    q: "Can I generate a cover letter automatically?",
    a: "Yes. Paste your resume and the job description, choose a tone (professional, creative, or conversational), and Resumelyzer generates a fully personalized cover letter in seconds.",
  },
  {
    q: "What file formats does Resumelyzer support?",
    a: "PDF and DOCX (Word) for upload. You can also paste resume text directly. For the CV builder, you download as PDF via the browser print dialog.",
  },
  {
    q: "Do I need an account?",
    a: "No account is needed to analyze your resume or generate a cover letter. Create a free account to save your history, build a profile, generate CVs from templates, and track job applications.",
  },
];

/* â”€â”€ Tools Tab Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const tools = [
  {
    id: "analyzer",
    label: "Resume Analyzer",
    href: "/analyzer",
    headline: "A feature-packed resume analyzer",
    desc: "Get instant ATS scores, keyword analysis, section-wise feedback, cliché detection, action-verb analysis, and AI-powered improvement suggestions. Upload PDF/DOCX or paste text — no login required.",
    bullets: ["ATS compatibility score", "Keyword & JD match analysis", "Section-by-section feedback", "AI rewrite suggestions"],
    bg: "from-brand-500 to-purple-600",
    visual: (
      <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-white">Resume Score</span>
          <span className="text-2xl font-black text-brand-400">84/100</span>
        </div>
        {[
          { label: "ATS Compatible", score: 90, color: "bg-green-500" },
          { label: "Keyword Match", score: 78, color: "bg-brand-500" },
          { label: "Action Verbs", score: 85, color: "bg-purple-500" },
          { label: "Quantification", score: 62, color: "bg-amber-500" },
        ].map((r) => (
          <div key={r.label} className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">{r.label}</span>
              <span className="text-white font-semibold">{r.score}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "cover-letter",
    label: "Cover Letter Generator",
    href: "/cover-letter",
    headline: "Generate a tailored cover letter in seconds",
    desc: "Paste your resume and the job description, pick a tone — professional, creative, or conversational — and get a fully personalized cover letter ready to send.",
    bullets: ["Job-tailored content", "3 tone options", "Editable output", "Copy or download"],
    bg: "from-pink-500 to-rose-500",
    visual: (
      <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cover Letter Preview</p>
        <div className="space-y-2">
          {["Dear Hiring Manager,", "I am excited to apply for the Software Engineer role at TechCorp. With 3+ years of MERN stack experience…", "My work at Acme Inc. directly contributed to a 40% reduction in load time…", "I look forward to discussing how my skills align with your team's goals.", "Sincerely, Alex"].map((line, i) => (
            <p key={i} className={`text-xs leading-relaxed ${i === 0 || i === 4 ? "text-white font-medium" : "text-gray-400"}`}>{line}</p>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "skills",
    label: "Skills Finder",
    href: "/skills",
    headline: "Discover exactly what skills employers want",
    desc: "Enter any job title and let AI reveal the top technical and soft skills employers are looking for. See which skills you already have and which to add to your resume.",
    bullets: ["Role-specific skill lists", "Technical & soft skills", "Gap analysis", "Instant results"],
    bg: "from-cyan-500 to-blue-500",
    visual: (
      <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Skills — Full Stack Dev</p>
        <div className="flex flex-wrap gap-2">
          {["React", "Node.js", "TypeScript", "MongoDB", "REST APIs", "JWT", "Docker", "Git", "AWS", "SQL"].map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">{s}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "tracker",
    label: "Job Tracker",
    href: "/tracker",
    headline: "Track every application in one place",
    desc: "Kanban-style job tracker to manage your pipeline from Saved → Applied → Interview → Offer. Never lose track of an application again.",
    bullets: ["Kanban pipeline board", "Status tracking", "Notes & links", "Resume score vs JD"],
    bg: "from-emerald-500 to-teal-500",
    visual: (
      <div className="bg-gray-900 rounded-2xl p-6 shadow-2xl">
        <div className="grid grid-cols-3 gap-2">
          {[
            { status: "Applied", items: ["Google L5", "Stripe SWE"], color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
            { status: "Interview", items: ["Airbnb FE", "Figma"], color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
            { status: "Offer", items: ["Vercel"], color: "text-green-400 bg-green-500/10 border-green-500/20" },
          ].map((col) => (
            <div key={col.status}>
              <p className="text-xs text-gray-500 mb-2 font-medium">{col.status}</p>
              {col.items.map((item) => (
                <div key={item} className={`mb-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium ${col.color}`}>{item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

/* â”€â”€ AI Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const aiFeatures = [
  {
    id: "analysis",
    title: "AI Resume Analysis",
    points: ["Score across 8+ dimensions", "ATS + keyword + content check", "Section-by-section feedback"],
  },
  {
    id: "rewrite",
    title: "AI Content Rewriting",
    points: ["Improve bullet points instantly", "Match recruiter language", "Quantify your achievements"],
  },
  {
    id: "cover",
    title: "AI Cover Letter",
    points: ["Job-tailored in seconds", "Choose professional / creative tone", "Editable and downloadable"],
  },
  {
    id: "skills",
    title: "AI Skills Finder",
    points: ["Discover role-specific skills", "Technical & soft skill lists", "Gap analysis vs your resume"],
  },
];

/* â”€â”€ FAQ Item â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left gap-4">
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>}
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function Home() {
  const [activeTool, setActiveTool] = useState("analyzer");
  const [activeAI, setActiveAI] = useState("analysis");
  const currentTool = tools.find((t) => t.id === activeTool)!;
  const currentAI = aiFeatures.find((f) => f.id === activeAI)!;

  return (
    <div className="bg-white text-gray-900">

      {/* â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 lg:pt-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-6">
              <Sparkles size={12} /> 1K+ users landed interviews last month
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              Land more interviews with{" "}
              <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                Resumelyzer
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              ATS checks, AI writing, and one-click job analysis make your resume stand out to recruiters.</p>
            <div className="flex flex-wrap gap-3 mb-8">
              <Link href="/analyzer" className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30">
                <BrainCircuit size={18} /> Analyze Your Resume <ArrowRight size={15} />
              </Link>
              <Link href="/resume-templates" className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border border-gray-200 transition shadow-sm">
                <FileDown size={18} /> Build Your CV
              </Link>
            </div>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
                <span className="text-sm font-semibold text-gray-700 ml-1">Excellent</span>
              </div>
              {[
                { value: "8+", label: "Scoring Dimensions" },
                { value: "4", label: "AI Tools" },
                { value: "Free", label: "No Credit Card" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — 3D Video Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* 3D perspective wrapper */}
            <motion.div
              animate={{ rotateY: [0, 3, 0, -3, 0], rotateX: [0, -2, 0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              style={{ perspective: 1000, transformStyle: "preserve-3d" }}
              className="relative"
            >
              {/* Glow backdrop */}
              <div className="absolute -inset-6 bg-gradient-to-br from-brand-400/20 via-purple-400/10 to-transparent rounded-3xl blur-2xl" />

              {/* Video */}
              <div
                className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(99,102,241,0.35)] border border-white/60"
                style={{ transform: "rotateY(-6deg) rotateX(4deg)" }}
              >
                <video
                  src="/mockup.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full max-w-[340px] block rounded-2xl"
                />
                {/* Glossy top-edge reflection */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-2xl" />
              </div>
            </motion.div>

            {/* Floating badge — ATS Friendly */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute top-4 -left-6 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 z-10"
            >
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 size={14} className="text-green-600" />
              </div>
              <span className="text-xs font-semibold text-gray-700">ATS Friendly</span>
            </motion.div>

            {/* Floating badge — AI-Powered */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-4 -left-10 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 flex items-center gap-2 z-10"
            >
              <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center">
                <Sparkles size={12} className="text-brand-600" />
              </div>
              <span className="text-xs font-semibold text-gray-700">AI-Powered</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ STATS BAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-gray-50 border-y border-gray-200 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "8+", label: "Scoring Dimensions" },
            { value: "4", label: "AI-Powered Tools" },
            { value: "3", label: "Analysis Modes" },
            { value: "100%", label: "Free to Analyze" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-gray-900 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ ATS BADGE SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-5">
              <Shield size={12} /> ATS Optimized
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
              Resumes optimized for Applicant Tracking Systems
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Resumelyzer checks your resume against real ATS criteria — keyword density, section headings, contact info, formatting, and more. Get a detailed breakdown and fix issues before submitting.
            </p>
            <ul className="space-y-3">
              {["Readable contact information", "Full experience section parsing", "Optimized skills section", "Keyword match vs job description"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/analyzer" className="inline-flex items-center gap-2 mt-8 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition">
              Check Your Resume <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-8 border border-brand-100">
            <div className="space-y-4">
              {[
                { label: "ATS Compatibility", score: 92, color: "bg-green-500", badge: "Great" },
                { label: "Keyword Density", score: 78, color: "bg-brand-500", badge: "Good" },
                { label: "Section Structure", score: 95, color: "bg-purple-500", badge: "Excellent" },
                { label: "Contact Completeness", score: 100, color: "bg-emerald-500", badge: "Perfect" },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-medium text-gray-700">{r.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{r.score}%</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">{r.badge}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden shadow-sm">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${r.score}%` }} transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full ${r.color} rounded-full`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ AI FEATURES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-gray-50 border-y border-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Fully equipped for the age of AI</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Our AI tools help you create smarter, faster, and more competitive job applications.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {aiFeatures.map((f) => (
              <button key={f.id} onClick={() => setActiveAI(f.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeAI === f.id ? "bg-gray-900 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}>
                {f.title}
              </button>
            ))}
          </div>
          <motion.div key={activeAI} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 shadow-lg p-8 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="text-white" size={22} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{currentAI.title}</h3>
            <ul className="space-y-2.5 text-left">
              {currentAI.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle2 size={16} className="text-brand-500 shrink-0 mt-0.5" /> {pt}
                </li>
              ))}
            </ul>
            <Link href="/analyzer" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition">
              Try it Now <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ HOW IT HELPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">How Resumelyzer helps the modern job seeker</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Everything you need to go from first draft to landing the interview.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: "Beat the ATS", color: "text-green-600 bg-green-50", desc: "Our analyzer checks every ATS criterion — formatting, keywords, section headings — and tells you exactly what to fix." },
            { icon: Target, title: "Match the Job", color: "text-brand-600 bg-brand-50", desc: "Paste the job description to see keyword gaps, match percentage, and tailored improvement suggestions for that specific role." },
            { icon: Zap, title: "Strengthen Every Line", color: "text-amber-600 bg-amber-50", desc: "Detect weak action verbs, missing quantification, and overused clichés. Get AI-generated rewrites for every bullet point." },
            { icon: Mail, title: "Cover Letters Instantly", color: "text-pink-600 bg-pink-50", desc: "Generate a job-tailored cover letter from your resume in seconds. Professional, creative, or conversational tone — your choice." },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* â”€â”€ ALL TOOLS TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-gray-50 border-y border-gray-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">All the career tools you need</h2>
            <p className="text-gray-600 max-w-xl mx-auto">One platform for every step of your job search.</p>
          </div>
          {/* Pill tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {tools.map((t) => (
              <button key={t.id} onClick={() => setActiveTool(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${activeTool === t.id ? "bg-gray-900 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"}`}>
                {t.label}
              </button>
            ))}
          </div>
          {/* Content */}
          <motion.div key={activeTool} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-xs font-semibold mb-5 bg-gradient-to-r ${currentTool.bg}`}>
                {currentTool.label}
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4">{currentTool.headline}</h3>
              <p className="text-gray-600 leading-relaxed mb-6">{currentTool.desc}</p>
              <ul className="space-y-2.5 mb-8">
                {currentTool.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 size={15} className="text-brand-500 shrink-0" /> {b}
                  </li>
                ))}
              </ul>
              <Link href={currentTool.href} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl transition">
                {currentTool.label} <ArrowRight size={14} />
              </Link>
            </div>
            <div>{currentTool.visual}</div>
          </motion.div>
        </div>
      </section>

      {/* â”€â”€ FOR EVERY JOB SEEKER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">For applicants across all career paths</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Whether you&apos;re a fresh grad or a senior engineer, Resumelyzer adapts to your needs.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Fresh Graduates", icon: BookOpen, color: "from-brand-500 to-purple-500", tags: ["Entry-level", "Internships", "First jobs"], desc: "Get resume scoring, skills gap analysis, and cover letters tailored for breaking into the industry." },
            { title: "Experienced Professionals", icon: BrainCircuit, color: "from-emerald-500 to-teal-500", tags: ["Mid-level", "Senior", "Specialists"], desc: "Sharpen your bullet points, quantify impact, and optimize for ATS systems at top companies." },
            { title: "Career Switchers", icon: Target, color: "from-amber-500 to-orange-500", tags: ["Career change", "Reskilling", "Pivoting"], desc: "Highlight transferable skills, find skill gaps for your target role, and reframe your experience." },
            { title: "Executives & Leaders", icon: Zap, color: "from-pink-500 to-rose-500", tags: ["Directors", "VPs", "C-Suite"], desc: "Build a concise, impact-driven resume that showcases leadership, scale, and business outcomes." },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{card.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* â”€â”€ CTA BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-gradient-to-r from-brand-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Your resume is your first impression — make it count
          </h2>
          <p className="text-brand-100 mb-8 max-w-xl mx-auto leading-relaxed">
            Analyze for free. No signup required. Get instant, actionable feedback powered by AI in under 60 seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/analyzer" className="flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition shadow-lg">
              <BrainCircuit size={18} /> Analyze My Resume
            </Link>
            <Link href="/login" className="flex items-center gap-2 px-6 py-3 bg-brand-800/40 text-white font-semibold rounded-xl hover:bg-brand-800/60 border border-white/20 transition">
              Create Free Account <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Frequently asked questions</h2>
          <p className="text-gray-600">Everything you need to know about Resumelyzer.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-200 shadow-sm">
          {faqs.map((faq) => (
            <div key={faq.q} className="px-6">
              <FaqItem q={faq.q} a={faq.a} />
            </div>
          ))}
        </div>
      </section>

      {/* â”€â”€ SUPPORT ROW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-gray-50 border-t border-gray-200 py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Support that helps</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">Stuck with something? Check the guide or use the analyzer — everything is free and instant.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/guide" className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm flex items-center gap-2">
              <BookOpen size={16} /> Resume Guide
            </Link>
            <Link href="/analyzer" className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition text-sm flex items-center gap-2">
              <Sparkles size={16} /> Start Analyzing
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
