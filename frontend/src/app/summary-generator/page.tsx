"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Check, RefreshCw, Lightbulb, ChevronDown } from "lucide-react";

type Summary = { label: string; text: string; wordCount: number };
type Result = { summaries: Summary[]; keywordSuggestions: string[]; tips: string[] };

const toneOptions = ["Professional", "Confident", "Creative", "Results-driven", "Executive"];
const expOptions = ["Student / No experience", "0-2 years", "3-5 years", "6-10 years", "10+ years"];

export default function SummaryGeneratorPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState("3-5 years");
  const [skills, setSkills] = useState("");
  const [tone, setTone] = useState("Professional");
  const [existing, setExisting] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    if (!jobTitle.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/summary-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, yearsOfExperience: experience, skills, tone, existingSummary: existing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function copyText(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="bg-white min-h-screen text-gray-900">
      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-4">
            <Sparkles size={12} /> AI-Powered
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Resume Summary Generator</h1>
          <p className="text-gray-600 leading-relaxed">
            Enter your job title and experience — our AI generates 3 ATS-optimized professional summary variations in seconds.
          </p>
        </div>
      </section>

      {/* Form + Result */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Job Title */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Senior Software Engineer, Product Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white"
              />
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Years of Experience</label>
              <div className="relative">
                <select value={experience} onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white appearance-none pr-8">
                  {expOptions.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tone</label>
              <div className="relative">
                <select value={tone} onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white appearance-none pr-8">
                  {toneOptions.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Skills */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Key Skills <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g., React, Node.js, TypeScript, REST APIs, Agile"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white"
              />
            </div>

            {/* Existing summary */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Existing Summary to Improve <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                rows={3}
                placeholder="Paste your current summary here if you want AI to improve it…"
                value={existing}
                onChange={(e) => setExisting(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white resize-none"
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button onClick={generate} disabled={!jobTitle.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm">
            {loading ? (
              <><RefreshCw size={16} className="animate-spin" /> Generating summaries…</>
            ) : (
              <><Sparkles size={16} /> Generate Professional Summaries</>
            )}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Summary cards */}
              <h2 className="text-lg font-bold text-gray-900 mb-4">Your Generated Summaries</h2>
              <div className="space-y-4 mb-8">
                {result.summaries?.map((s, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-200 transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-brand-600">{s.label}</span>
                        <span className="text-xs text-gray-400">{s.wordCount} words</span>
                      </div>
                      <button onClick={() => copyText(s.text, i)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-brand-600 transition">
                        {copied === i ? <><Check size={13} className="text-green-500" /> Copied!</> : <><Copy size={13} /> Copy</>}
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>

              {/* Keywords */}
              {result.keywordSuggestions?.length > 0 && (
                <div className="bg-brand-50 border border-brand-100 rounded-xl p-5 mb-6">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <Sparkles size={14} className="text-brand-600" /> Recommended Keywords to Include
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordSuggestions.map((kw) => (
                      <span key={kw} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-brand-700 border border-brand-200">{kw}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {result.tips?.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <Lightbulb size={14} className="text-amber-600" /> Pro Tips for Your Summary
                  </h3>
                  <ul className="space-y-2">
                    {result.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-amber-500 mt-0.5">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
