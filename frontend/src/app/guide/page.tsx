"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Target,
  Lightbulb,
  Shield,
  Zap,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Star,
  TrendingUp,
  Hash,
  Sparkles,
} from "lucide-react";

const tips = [
  {
    icon: Target,
    title: "Tailor Every Resume",
    content:
      "Customize your resume for each application. Use keywords from the job description to pass ATS filters and resonate with recruiters. One-size-fits-all resumes get rejected.",
    color: "text-brand-400",
  },
  {
    icon: Hash,
    title: "Quantify Achievements",
    content:
      "Replace vague statements with numbers. Instead of 'Improved sales,' write 'Increased quarterly sales by 35%, generating $500K in new revenue.' Numbers catch the eye.",
    color: "text-green-400",
  },
  {
    icon: Zap,
    title: "Use Strong Action Verbs",
    content:
      "Start every bullet point with a powerful action verb: Spearheaded, Architected, Optimized, Streamlined, Orchestrated. Avoid weak verbs like 'helped', 'worked on', 'was responsible for'.",
    color: "text-yellow-400",
  },
  {
    icon: Shield,
    title: "Optimize for ATS",
    content:
      "Use standard section headings (Experience, Education, Skills). Avoid tables, images, or complex formatting. Stick to clean, single-column layouts for maximum ATS compatibility.",
    color: "text-purple-400",
  },
  {
    icon: AlertTriangle,
    title: "Avoid Resume Clichés",
    content:
      "Phrases like 'results-driven', 'team player', 'hard-working', and 'self-motivated' are meaningless. Replace them with specific examples that demonstrate those qualities.",
    color: "text-red-400",
  },
  {
    icon: FileText,
    title: "Keep It Concise",
    content:
      "For most professionals, one page is ideal. Two pages for 10+ years of experience. Every line should earn its place — if it doesn't strengthen your candidacy, remove it.",
    color: "text-cyan-400",
  },
  {
    icon: CheckCircle2,
    title: "Include All Essential Sections",
    content:
      "A complete resume includes: Contact Info, Summary/Objective, Experience, Education, and Skills. Optional: Projects, Certifications, Awards, Languages, Volunteering.",
    color: "text-emerald-400",
  },
  {
    icon: Star,
    title: "Write a Compelling Summary",
    content:
      "Your summary is your elevator pitch. Keep it 2-4 sentences. Lead with your title, years of experience, key expertise, and a headline achievement. Make recruiters want to read more.",
    color: "text-amber-400",
  },
  {
    icon: TrendingUp,
    title: "Show Career Progression",
    content:
      "Demonstrate growth by highlighting promotions, increasing responsibilities, and expanded scope. Recruiters love candidates who show upward trajectory.",
    color: "text-indigo-400",
  },
  {
    icon: Sparkles,
    title: "Proofread Everything",
    content:
      "A single typo can disqualify you. Read your resume backwards sentence by sentence, use a grammar checker, and ask someone else to review it. Attention to detail matters.",
    color: "text-pink-400",
  },
];

const actionVerbsByCategory = [
  {
    category: "Leadership",
    verbs: ["Spearheaded", "Orchestrated", "Directed", "Championed", "Pioneered", "Mentored"],
  },
  {
    category: "Achievement",
    verbs: ["Achieved", "Exceeded", "Surpassed", "Delivered", "Secured", "Earned"],
  },
  {
    category: "Technical",
    verbs: ["Architected", "Engineered", "Optimized", "Automated", "Integrated", "Deployed"],
  },
  {
    category: "Communication",
    verbs: ["Presented", "Negotiated", "Collaborated", "Advocated", "Facilitated", "Conveyed"],
  },
  {
    category: "Improvement",
    verbs: ["Streamlined", "Revamped", "Transformed", "Modernized", "Accelerated", "Restructured"],
  },
  {
    category: "Analysis",
    verbs: ["Analyzed", "Evaluated", "Assessed", "Researched", "Investigated", "Diagnosed"],
  },
];

const clichesToAvoid = [
  { bad: "Results-driven professional", good: "Increased team output by 40% through process automation" },
  { bad: "Team player", good: "Collaborated with 5 cross-functional teams to launch new product line" },
  { bad: "Hard-working", good: "Consistently exceeded quarterly targets by 20% for 3 consecutive years" },
  { bad: "Responsible for", good: "Led / Managed / Directed / Oversaw" },
  { bad: "Self-motivated", good: "Independently initiated and completed 3 process improvement projects" },
  { bad: "Think outside the box", good: "Developed innovative caching strategy reducing latency by 60%" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function GuidePage() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Resume Writing Guide
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Expert tips and best practices to make your resume stand out.
          Written by career experts and ATS specialists.
        </p>
      </motion.div>

      {/* Tips Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 gap-6 mb-16"
      >
        {tips.map((tip, idx) => {
          const Icon = tip.icon;
          return (
            <motion.div key={idx} variants={item} className="glass-card p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
                <Icon size={20} className={tip.color} />
                {tip.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{tip.content}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Action Verbs Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Power Action Verbs
          </span>
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Use these instead of weak verbs like &quot;managed&quot;, &quot;helped&quot;, or &quot;worked on&quot;
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionVerbsByCategory.map((cat) => (
            <div key={cat.category} className="glass-card p-5">
              <h4 className="text-sm font-medium text-brand-400 mb-3">{cat.category}</h4>
              <div className="flex flex-wrap gap-2">
                {cat.verbs.map((verb) => (
                  <span
                    key={verb}
                    className="px-3 py-1 bg-brand-500/10 border border-brand-500/20 text-brand-300 rounded-full text-sm"
                  >
                    {verb}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Clichés Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Clichés to Avoid
          </span>
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Replace overused phrases with specific, quantified achievements
        </p>
        <div className="space-y-3">
          {clichesToAvoid.map((c, idx) => (
            <div key={idx} className="glass-card p-4 grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-red-400 font-medium mb-0.5">DON&apos;T</div>
                  <p className="text-gray-400 text-sm line-through">{c.bad}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-green-400 font-medium mb-0.5">DO</div>
                  <p className="text-gray-300 text-sm">{c.good}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Resume Section Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Section Checklist
          </span>
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Ensure your resume has all the essential sections
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { section: "Contact Information", required: true, desc: "Name, email, phone, LinkedIn, location" },
            { section: "Professional Summary", required: true, desc: "2-4 sentence elevator pitch with key achievements" },
            { section: "Work Experience", required: true, desc: "Role, company, dates, bullet-point achievements" },
            { section: "Education", required: true, desc: "Degree, institution, graduation year, GPA (if strong)" },
            { section: "Skills", required: true, desc: "Technical and soft skills, proficiency levels" },
            { section: "Projects", required: false, desc: "Key projects with outcomes and technologies used" },
            { section: "Certifications", required: false, desc: "Relevant certifications with issuing body" },
            { section: "Awards & Achievements", required: false, desc: "Quantified accomplishments and recognitions" },
            { section: "Languages", required: false, desc: "Languages with proficiency levels" },
          ].map((s) => (
            <div
              key={s.section}
              className={`glass-card p-4 border-l-4 ${
                s.required ? "border-l-green-500" : "border-l-gray-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2
                  size={14}
                  className={s.required ? "text-green-400" : "text-gray-500"}
                />
                <h4 className="font-medium text-white text-sm">{s.section}</h4>
                {s.required && (
                  <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                    Required
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs ml-6">{s.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
