"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Sparkles, ChevronDown, Lightbulb, HelpCircle, RefreshCw, Users, Code, BookOpen, Heart, type LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Users, Code, Lightbulb, Heart, BookOpen, MessageSquare,
};

type Question = { question: string; tip: string; sampleAnswer: string };
type Category = { name: string; icon: string; questions: Question[] };
type Result = { categories: Category[]; prepTips: string[]; questionsToAsk: string[] };

const levelOptions = ["Entry-level (0-2 yrs)", "Mid-level (3-5 yrs)", "Senior (6-10 yrs)", "Executive (10+ yrs)"];
const focusOptions = ["General", "Technical deep-dive", "Leadership & management", "Culture & values", "Problem-solving", "Behavioral (STAR)"];

const popularRoles = ["Software Engineer", "Product Manager", "Data Scientist", "UX Designer", "Marketing Manager", "Sales Executive", "Business Analyst", "DevOps Engineer"];

function QuestionCard({ q, idx }: { q: Question; idx: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition">
        <div className="flex items-start gap-3">
          <span className="text-xs font-bold text-brand-600 bg-brand-50 rounded-full px-2 py-0.5 mt-0.5 shrink-0">Q{idx + 1}</span>
          <span className="text-sm font-semibold text-gray-900 leading-relaxed">{q.question}</span>
        </div>
        <ChevronDown size={16} className={`shrink-0 ml-3 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
          {q.tip && (
            <div className="flex items-start gap-2 mt-3 mb-3 bg-amber-50 border border-amber-100 rounded-lg p-3">
              <Lightbulb size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed"><span className="font-semibold">Tip:</span> {q.tip}</p>
            </div>
          )}
          {q.sampleAnswer && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sample Answer</p>
              <p className="text-sm text-gray-700 leading-relaxed">{q.sampleAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function InterviewQuestionsPage() {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [level, setLevel] = useState("Mid-level (3-5 yrs)");
  const [focus, setFocus] = useState("General");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  async function generate(title?: string) {
    const t = title || jobTitle;
    if (!t.trim()) return;
    if (title) setJobTitle(title);
    setLoading(true);
    setError("");
    setResult(null);
    setActiveCategory(0);
    try {
      const res = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle: t, company, experienceLevel: level, focusArea: focus }),
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

  return (
    <div className="bg-white min-h-screen text-gray-900">
      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold mb-4">
            <Sparkles size={12} /> AI-Powered
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Interview Questions Generator</h1>
          <p className="text-gray-600 leading-relaxed">
            Enter any job title and get AI-generated interview questions with sample answers and expert tips — tailored to your role and experience level.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        {/* Quick role pills */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Popular Roles</p>
          <div className="flex flex-wrap gap-2">
            {popularRoles.map((r) => (
              <button key={r} onClick={() => generate(r)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-transparent transition">
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g., Product Manager" value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Company <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" placeholder="e.g., Google, Stripe" value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience Level</label>
              <div className="relative">
                <select value={level} onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white appearance-none pr-8">
                  {levelOptions.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Focus Area</label>
              <div className="relative">
                <select value={focus} onChange={(e) => setFocus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-400 bg-white appearance-none pr-8">
                  {focusOptions.map(o => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button onClick={() => generate()} disabled={!jobTitle.trim() || loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm">
            {loading
              ? <><RefreshCw size={16} className="animate-spin" /> Generating questions…</>
              : <><MessageSquare size={16} /> Generate Interview Questions</>}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Category pills */}
              {result.categories?.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {result.categories.map((cat, i) => {
                      const Icon = ICON_MAP[cat.icon] || MessageSquare;
                      return (
                        <button key={i} onClick={() => setActiveCategory(i)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition ${activeCategory === i ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                          <Icon size={13} /> {cat.name}
                          <span className="text-xs opacity-60">({cat.questions?.length || 0})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Questions */}
                  <div className="space-y-3 mb-8">
                    {result.categories[activeCategory]?.questions?.map((q, i) => (
                      <QuestionCard key={i} q={q} idx={i} />
                    ))}
                  </div>
                </>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Prep tips */}
                {result.prepTips?.length > 0 && (
                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <Sparkles size={14} className="text-brand-600" /> Interview Prep Tips
                    </h3>
                    <ul className="space-y-2">
                      {result.prepTips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-brand-500 shrink-0">•</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Questions to ask */}
                {result.questionsToAsk?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                      <HelpCircle size={14} className="text-amber-600" /> Questions to Ask the Interviewer
                    </h3>
                    <ul className="space-y-2">
                      {result.questionsToAsk.map((q) => (
                        <li key={q} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-amber-500 shrink-0">→</span> {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
