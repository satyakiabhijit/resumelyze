"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, Filter } from "lucide-react";

const categories = ["All", "Software Engineering", "Data Science", "Product", "Design", "Marketing", "Finance", "Sales", "Healthcare", "Operations", "HR", "Legal"];

const examples = [
  {
    title: "Software Engineer",
    category: "Software Engineering",
    level: "Mid-level",
    tags: ["React", "Node.js", "TypeScript"],
    atsScore: 92,
    color: "from-brand-500 to-purple-500",
    bg: "bg-brand-50",
    border: "border-brand-100",
    sections: ["Summary", "Experience", "Skills", "Projects", "Education"],
    bullets: [
      "Led migration of monolithic app to microservices — reduced load time by 40%",
      "Built CI/CD pipeline handling 200+ deployments/month with zero downtime",
      "Mentored 4 junior developers, improving team velocity by 30%",
    ],
  },
  {
    title: "Data Scientist",
    category: "Data Science",
    level: "Senior",
    tags: ["Python", "ML", "SQL", "TensorFlow"],
    atsScore: 88,
    color: "from-cyan-500 to-blue-500",
    bg: "bg-cyan-50",
    border: "border-cyan-100",
    sections: ["Summary", "Experience", "Skills", "Publications", "Education"],
    bullets: [
      "Developed fraud detection model with 97.3% precision, saving $2.4M annually",
      "Built NLP pipeline processing 1M+ customer reviews for sentiment analysis",
      "Reduced model training time by 65% through distributed computing",
    ],
  },
  {
    title: "Product Manager",
    category: "Product",
    level: "Mid-level",
    tags: ["Roadmap", "Agile", "Analytics"],
    atsScore: 85,
    color: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    sections: ["Summary", "Experience", "Achievements", "Skills", "Education"],
    bullets: [
      "Launched 3 product features adopted by 80% of user base within 30 days",
      "Increased user retention by 22% through A/B tested onboarding flow",
      "Managed $2M product roadmap across 4 engineering teams",
    ],
  },
  {
    title: "UX/UI Designer",
    category: "Design",
    level: "Mid-level",
    tags: ["Figma", "UX Research", "Prototyping"],
    atsScore: 87,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    border: "border-pink-100",
    sections: ["Summary", "Experience", "Portfolio", "Tools", "Education"],
    bullets: [
      "Redesigned checkout flow reducing cart abandonment by 35%",
      "Conducted 40+ user interviews across 3 product verticals",
      "Built design system with 200+ components used by 8 engineers",
    ],
  },
  {
    title: "Marketing Manager",
    category: "Marketing",
    level: "Senior",
    tags: ["SEO", "Content", "Paid Ads", "Analytics"],
    atsScore: 83,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
    sections: ["Summary", "Experience", "Campaigns", "Skills", "Education"],
    bullets: [
      "Grew organic traffic 180% in 12 months through content-led SEO strategy",
      "Managed $500K paid advertising budget with 4.2x ROAS",
      "Launched email campaign achieving 34% open rate (industry avg: 21%)",
    ],
  },
  {
    title: "Financial Analyst",
    category: "Finance",
    level: "Entry-level",
    tags: ["Excel", "Financial Modeling", "SQL"],
    atsScore: 86,
    color: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
    sections: ["Summary", "Experience", "Skills", "Certifications", "Education"],
    bullets: [
      "Built DCF models for 15 acquisition targets totaling $400M in deal value",
      "Automated monthly reporting, saving 12 hours of manual work per month",
      "Presented investment analysis to C-suite for $50M capital allocation",
    ],
  },
  {
    title: "Sales Executive",
    category: "Sales",
    level: "Mid-level",
    tags: ["B2B", "CRM", "Negotiation"],
    atsScore: 84,
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
    border: "border-green-100",
    sections: ["Summary", "Experience", "Achievements", "Skills", "Education"],
    bullets: [
      "Exceeded annual quota by 134% ($1.2M ARR vs. $900K target)",
      "Managed 60-account enterprise portfolio including 3 Fortune 500 clients",
      "Reduced sales cycle from 90 to 52 days through improved discovery process",
    ],
  },
  {
    title: "Frontend Developer",
    category: "Software Engineering",
    level: "Entry-level",
    tags: ["React", "CSS", "JavaScript"],
    atsScore: 89,
    color: "from-sky-500 to-blue-500",
    bg: "bg-sky-50",
    border: "border-sky-100",
    sections: ["Summary", "Skills", "Projects", "Experience", "Education"],
    bullets: [
      "Built responsive e-commerce UI serving 50K+ monthly active users",
      "Reduced first contentful paint by 2.1s through code-splitting and lazy loading",
      "Contributed to open-source React component library with 400+ GitHub stars",
    ],
  },
  {
    title: "DevOps Engineer",
    category: "Software Engineering",
    level: "Senior",
    tags: ["AWS", "Kubernetes", "Terraform", "CI/CD"],
    atsScore: 91,
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50",
    border: "border-orange-100",
    sections: ["Summary", "Experience", "Certifications", "Skills", "Education"],
    bullets: [
      "Designed Kubernetes cluster architecture handling 10M+ requests/day",
      "Reduced infrastructure costs by $180K/year through resource optimization",
      "Achieved 99.99% uptime SLA across 6 production environments",
    ],
  },
  {
    title: "HR Manager",
    category: "HR",
    level: "Mid-level",
    tags: ["Recruiting", "HRIS", "L&D"],
    atsScore: 81,
    color: "from-fuchsia-500 to-pink-500",
    bg: "bg-fuchsia-50",
    border: "border-fuchsia-100",
    sections: ["Summary", "Experience", "Skills", "Certifications", "Education"],
    bullets: [
      "Reduced time-to-hire from 45 to 22 days through structured hiring process",
      "Implemented L&D program with 92% employee satisfaction score",
      "Managed full-cycle recruiting for 120+ roles across 3 offices",
    ],
  },
  {
    title: "ML Engineer",
    category: "Data Science",
    level: "Senior",
    tags: ["Python", "PyTorch", "MLOps", "AWS"],
    atsScore: 93,
    color: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    sections: ["Summary", "Experience", "Research", "Skills", "Education"],
    bullets: [
      "Deployed real-time recommendation system achieving 28% lift in CTR",
      "Reduced model inference latency from 450ms to 38ms using quantization",
      "Built MLOps pipeline automating model retraining and A/B testing",
    ],
  },
  {
    title: "Business Analyst",
    category: "Operations",
    level: "Mid-level",
    tags: ["SQL", "Tableau", "Process Improvement"],
    atsScore: 82,
    color: "from-teal-500 to-cyan-500",
    bg: "bg-teal-50",
    border: "border-teal-100",
    sections: ["Summary", "Experience", "Skills", "Certifications", "Education"],
    bullets: [
      "Optimized order fulfillment process reducing lead time by 3 days",
      "Built Tableau dashboard adopted by 45 stakeholders for weekly reporting",
      "Identified $340K in annual savings through vendor contract analysis",
    ],
  },
];

function ResumeCard({ ex, delay }: { ex: typeof examples[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {/* Mock resume preview */}
      <div className={`${ex.bg} ${ex.border} border-b p-4 h-44 overflow-hidden relative`}>
        {/* Header bar */}
        <div className="mb-3">
          <div className={`h-3 w-32 rounded bg-gradient-to-r ${ex.color} mb-1.5`} />
          <div className="h-1.5 w-20 rounded bg-gray-300" />
        </div>
        {/* Section lines */}
        {ex.sections.slice(0, 3).map((s, i) => (
          <div key={s} className="mb-2">
            <div className={`h-1.5 w-16 rounded bg-gradient-to-r ${ex.color} opacity-60 mb-1`} />
            <div className="space-y-0.5">
              {[0.9, 0.75, 0.6].slice(0, i === 0 ? 1 : 2).map((w, j) => (
                <div key={j} className="h-1 rounded bg-gray-200" style={{ width: `${w * 100}%` }} />
              ))}
            </div>
          </div>
        ))}
        {/* ATS badge */}
        <div className="absolute top-3 right-3 bg-white rounded-lg px-2 py-1 shadow-sm border border-gray-100 text-xs font-bold text-gray-700">
          ATS {ex.atsScore}%
        </div>
      </div>

      {/* Card info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{ex.title}</h3>
            <span className="text-xs text-gray-500">{ex.level}</span>
          </div>
          <Link href={`/analyzer`}
            className={`opacity-0 group-hover:opacity-100 transition flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700`}>
            Analyze <ArrowRight size={12} />
          </Link>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {ex.tags.map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{t}</span>
          ))}
        </div>
        <div className="space-y-1">
          {ex.bullets.slice(0, 2).map((b, i) => (
            <p key={i} className="text-[11px] text-gray-500 leading-relaxed line-clamp-1">• {b}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ResumeExamplesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = examples.filter((ex) => {
    const matchesSearch = !search || ex.title.toLowerCase().includes(search.toLowerCase()) || ex.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = activeCategory === "All" || ex.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen text-gray-900">
      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-200 py-14">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Resume Examples for Every Role
            </h1>
            <p className="text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed">
              Browse professionally crafted resume examples across 50+ industries and career levels. Use them as inspiration or analyze yours against them.
            </p>
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder='Try "Software Engineer" or "React"…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-brand-400 shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category filters */}
      <section className="border-b border-gray-200 sticky top-16 bg-white z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Filter size={14} className="text-gray-400 shrink-0" />
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${activeCategory === cat ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg font-semibold mb-2">No examples found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-6">{filtered.length} example{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((ex, i) => (
                <ResumeCard key={ex.title} ex={ex} delay={i * 0.04} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-purple-600 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to build yours?</h2>
          <p className="text-brand-100 mb-6 text-sm">Analyze your existing resume or build a new one from scratch.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/analyzer" className="px-6 py-2.5 bg-white text-brand-700 font-semibold rounded-xl text-sm hover:bg-brand-50 transition">
              Analyze My Resume
            </Link>
            <Link href="/resume-templates" className="px-6 py-2.5 bg-brand-800/40 text-white font-semibold rounded-xl text-sm border border-white/20 hover:bg-brand-800/60 transition">
              Build a New Resume
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
