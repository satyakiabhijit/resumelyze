"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, CheckCircle2, ArrowRight, Zap, Target, AlertTriangle, Search, Hash } from "lucide-react";

const checks = [
  { icon: Shield, title: "ATS Compatibility", desc: "Checks formatting, fonts, columns, and structure against top ATS systems including Greenhouse, Lever, and Workday.", color: "text-green-600 bg-green-50" },
  { icon: Search, title: "Keyword Analysis", desc: "Spots missing keywords from your target job description and shows your current keyword density.", color: "text-brand-600 bg-brand-50" },
  { icon: Target, title: "Section-by-Section Scoring", desc: "Each resume section — Summary, Experience, Skills, Education — gets an individual score and tailored improvement tips.", color: "text-purple-600 bg-purple-50" },
  { icon: Zap, title: "Action Verb Analysis", desc: "Identifies weak verbs like 'managed' and 'helped' and suggests stronger alternatives like 'orchestrated' and 'drove'.", color: "text-amber-600 bg-amber-50" },
  { icon: Hash, title: "Quantification Check", desc: "Detects bullet points that lack metrics and flags opportunities to add numbers, percentages, and revenue figures.", color: "text-cyan-600 bg-cyan-50" },
  { icon: AlertTriangle, title: "Cliché Detection", desc: "Flags overused phrases like 'results-driven', 'team player', and 'go-getter' — with recruiter-approved alternatives.", color: "text-orange-600 bg-orange-50" },
];

const scores = [
  { label: "ATS Score", value: 82, color: "bg-green-500" },
  { label: "Keyword Match", value: 74, color: "bg-brand-500" },
  { label: "Content Quality", value: 79, color: "bg-purple-500" },
  { label: "Action Verbs", value: 88, color: "bg-amber-500" },
  { label: "Quantification", value: 55, color: "bg-cyan-500" },
];

export default function ResumeCheckerPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900">
      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-200 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-5">
                <Shield size={12} /> Free Resume Checker
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                Check if your resume will pass the ATS
              </h1>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our AI-powered resume checker scans your resume across 8+ dimensions: ATS compatibility, keyword match, content quality, action verbs, and more. Get instant, actionable feedback in under 60 seconds.
              </p>
              <ul className="space-y-2.5 mb-8">
                {["No signup required", "PDF & DOCX supported", "Works with or without job description", "Results in under 60 seconds"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 size={15} className="text-green-500 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/analyzer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-lg shadow-brand-500/20 text-sm">
                <Shield size={16} /> Check My Resume — Free <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Score preview */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-bold text-gray-900">Resume Check Results</span>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-brand-600">78</span>
                    <span className="text-xs text-gray-500">Overall</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {scores.map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600 font-medium">{s.label}</span>
                        <span className="font-bold text-gray-800">{s.value}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${s.value}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                          className={`h-full ${s.color} rounded-full`} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-800 mb-1">💡 Top recommendation</p>
                  <p className="text-xs text-amber-700">Add metrics to 4 bullet points — quantified achievements get 40% more recruiter attention.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What we check */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">What our resume checker analyzes</h2>
          <p className="text-gray-600 max-w-xl mx-auto">A comprehensive, AI-powered review covering every dimension recruiters and ATS systems evaluate.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {checks.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.color}`}>
                  <Icon size={17} />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{c.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-200 py-14">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-10">How to check your resume</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload or Paste", desc: "Upload your PDF/DOCX or paste the resume text. Add a job description for keyword matching." },
              { step: "2", title: "Run the Check", desc: "Our AI analyzes 8+ dimensions in under 60 seconds — no account needed." },
              { step: "3", title: "Fix & Apply", desc: "Follow the prioritized action items to improve your score and land more interviews." },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-black mb-4 shadow-lg shadow-brand-500/20">
                  {s.step}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{s.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/analyzer"
              className="inline-flex items-center gap-2 px-7 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-lg shadow-brand-500/20 text-sm">
              <Zap size={15} /> Start Free Resume Check <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* VS comparison */}
      <section className="max-w-3xl mx-auto px-4 py-14">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-8">Resume Checker vs. Full Analysis</h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
            <div className="p-4" />
            <div className="p-4 text-center border-l border-gray-200">
              <p className="text-sm font-bold text-gray-700">Quick Check</p>
              <p className="text-xs text-gray-400">No JD needed</p>
            </div>
            <div className="p-4 text-center border-l border-gray-200 bg-brand-50">
              <p className="text-sm font-bold text-brand-700">Full Analysis</p>
              <p className="text-xs text-brand-400">With JD match</p>
            </div>
          </div>
          {[
            ["ATS Compatibility Score", true, true],
            ["Section-wise Scores", true, true],
            ["Action Verb Analysis", true, true],
            ["Cliché Detection", true, true],
            ["Keyword Match vs JD", false, true],
            ["JD Match %", false, true],
            ["AI Rewrite Suggestions", false, true],
            ["Missing Keywords List", false, true],
          ].map(([label, quick, full]) => (
            <div key={label as string} className="grid grid-cols-3 border-b border-gray-100 last:border-0">
              <div className="p-3 text-sm text-gray-700">{label}</div>
              <div className="p-3 border-l border-gray-100 flex justify-center">
                {quick ? <CheckCircle2 size={16} className="text-green-500" /> : <span className="text-gray-300 text-lg">–</span>}
              </div>
              <div className="p-3 border-l border-gray-100 flex justify-center bg-brand-50/40">
                {full ? <CheckCircle2 size={16} className="text-brand-500" /> : <span className="text-gray-300 text-lg">–</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">Both are completely free. Our full analyzer supports job description for deeper insights.</p>
      </section>
    </div>
  );
}
