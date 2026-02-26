"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

import type { ResumeTemplate } from "@/types";
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  FileCode2,
  Eye,
  Sparkles,
  BookOpen,
  Search,
  X,
  Loader2,
  UserCheck,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

type TemplateCategory = "all" | "professional" | "academic" | "creative" | "simple" | "two-column";

const CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: "all", label: "All Templates" },
  { id: "professional", label: "Professional" },
  { id: "academic", label: "Academic" },
  { id: "creative", label: "Creative" },
  { id: "simple", label: "Simple" },
  { id: "two-column", label: "Two-Column" },
];

/* ═══════════════════════════════════════════════════════════════
   FORM DATA TYPES
   ═══════════════════════════════════════════════════════════════ */

interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;
  location: string;
  bullets: string[];
}

interface EducationEntry {
  institution: string;
  degree: string;
  year: string;
  gpa: string;
  location: string;
}

interface ProjectEntry {
  name: string;
  tech: string;
  duration: string;
  bullets: string[];
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  headline: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: { category: string; items: string }[];
  certifications: string[];
  achievements: string[];
}

const EMPTY_EXPERIENCE: ExperienceEntry = { company: "", role: "", duration: "", location: "", bullets: [""] };
const EMPTY_EDUCATION: EducationEntry = { institution: "", degree: "", year: "", gpa: "", location: "" };
const EMPTY_PROJECT: ProjectEntry = { name: "", tech: "", duration: "", bullets: [""] };

function defaultFormData(): FormData {
  return {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    headline: "",
    summary: "",
    experience: [{ ...EMPTY_EXPERIENCE, bullets: [""] }],
    education: [{ ...EMPTY_EDUCATION }],
    projects: [{ ...EMPTY_PROJECT, bullets: [""] }],
    skills: [{ category: "Languages", items: "" }, { category: "Frameworks", items: "" }, { category: "Tools", items: "" }],
    certifications: [""],
    achievements: [""],
  };
}

/* ═══════════════════════════════════════════════════════════════
   PLACEHOLDER REPLACEMENT ENGINE
   ═══════════════════════════════════════════════════════════════

   Supports:
   - Simple: {{NAME}}, {{EMAIL}}, {{PHONE}}, etc.
   - Repeating sections:
       {{#EXPERIENCE}}
         ... {{COMPANY}} ... {{ROLE}} ...
         {{#BULLETS}}{{BULLET}}{{/BULLETS}}
       {{/EXPERIENCE}}
   ═══════════════════════════════════════════════════════════════ */

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function el(text: string) { return escapeLatex(text); }

function replacePlaceholders(template: string, data: FormData): string {
  let result = template;

  // ── Simple replacements ──
  const simpleMap: Record<string, string> = {
    "{{NAME}}": el(data.name || "Your Name"),
    "{{EMAIL}}": el(data.email || "email@example.com"),
    "{{PHONE}}": el(data.phone || ""),
    "{{LOCATION}}": el(data.location || ""),
    "{{LINKEDIN}}": data.linkedin || "",
    "{{GITHUB}}": data.github || "",
    "{{WEBSITE}}": data.website || "",
    "{{HEADLINE}}": el(data.headline || ""),
    "{{SUMMARY}}": el(data.summary || ""),
  };

  for (const [placeholder, value] of Object.entries(simpleMap)) {
    result = result.replaceAll(placeholder, value);
  }

  // ── Repeating: {{#EDUCATION}}...{{/EDUCATION}} ──
  result = replaceRepeatingSection(result, "EDUCATION", data.education.filter(e => e.institution), (edu, block) => {
    let out = block;
    out = out.replaceAll("{{INSTITUTION}}", el(edu.institution));
    out = out.replaceAll("{{DEGREE}}", el(edu.degree));
    out = out.replaceAll("{{YEAR}}", el(edu.year));
    out = out.replaceAll("{{GPA}}", el(edu.gpa));
    out = out.replaceAll("{{EDU_LOCATION}}", el(edu.location));
    return out;
  });

  // ── Repeating: {{#EXPERIENCE}}...{{/EXPERIENCE}} ──
  result = replaceRepeatingSection(result, "EXPERIENCE", data.experience.filter(e => e.company), (exp, block) => {
    let out = block;
    out = out.replaceAll("{{COMPANY}}", el(exp.company));
    out = out.replaceAll("{{ROLE}}", el(exp.role));
    out = out.replaceAll("{{DURATION}}", el(exp.duration));
    out = out.replaceAll("{{EXP_LOCATION}}", el(exp.location));
    // Nested bullets
    out = replaceRepeatingSection(out, "BULLETS", exp.bullets.filter(b => b.trim()), (bullet, bBlock) => {
      return bBlock.replaceAll("{{BULLET}}", el(bullet));
    });
    return out;
  });

  // ── Repeating: {{#PROJECTS}}...{{/PROJECTS}} ──
  result = replaceRepeatingSection(result, "PROJECTS", data.projects.filter(p => p.name), (proj, block) => {
    let out = block;
    out = out.replaceAll("{{PROJECT_NAME}}", el(proj.name));
    out = out.replaceAll("{{TECH}}", el(proj.tech));
    out = out.replaceAll("{{PROJ_DURATION}}", el(proj.duration));
    out = replaceRepeatingSection(out, "BULLETS", proj.bullets.filter(b => b.trim()), (bullet, bBlock) => {
      return bBlock.replaceAll("{{BULLET}}", el(bullet));
    });
    return out;
  });

  // ── Repeating: {{#SKILLS}}...{{/SKILLS}} ──
  result = replaceRepeatingSection(result, "SKILLS", data.skills.filter(s => s.items.trim()), (skill, block) => {
    let out = block;
    out = out.replaceAll("{{CATEGORY}}", el(skill.category));
    out = out.replaceAll("{{ITEMS}}", el(skill.items));
    return out;
  });

  // ── Repeating: {{#CERTIFICATIONS}}...{{/CERTIFICATIONS}} ──
  result = replaceRepeatingSection(result, "CERTIFICATIONS", data.certifications.filter(c => c.trim()), (cert, block) => {
    return block.replaceAll("{{CERT}}", el(cert));
  });

  // ── Repeating: {{#ACHIEVEMENTS}}...{{/ACHIEVEMENTS}} ──
  result = replaceRepeatingSection(result, "ACHIEVEMENTS", data.achievements.filter(a => a.trim()), (ach, block) => {
    return block.replaceAll("{{ACHIEVEMENT}}", el(ach));
  });

  return result;
}

function replaceRepeatingSection<T>(
  template: string,
  sectionName: string,
  items: T[],
  replacer: (item: T, blockTemplate: string) => string,
): string {
  const openTag = `{{#${sectionName}}}`;
  const closeTag = `{{/${sectionName}}}`;

  const openIdx = template.indexOf(openTag);
  const closeIdx = template.indexOf(closeTag);

  if (openIdx === -1 || closeIdx === -1) return template;

  const before = template.slice(0, openIdx);
  const blockTemplate = template.slice(openIdx + openTag.length, closeIdx);
  const after = template.slice(closeIdx + closeTag.length);

  const expanded = items.map(item => replacer(item, blockTemplate)).join("\n");

  return before + expanded + after;
}

/* ═══════════════════════════════════════════════════════════════
   FORM INPUT COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Input({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input type={type} value={value} onChange={ev => onChange(ev.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <textarea value={value} onChange={ev => onChange(ev.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white resize-y" />
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left">
        <span className="font-semibold text-sm text-gray-800">{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-4 bg-white">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ResumeTemplatesPage() {
  const { user, profile } = useAuth();

  // ── Template data from API ──
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  // ── UI state ──
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [profileFilled, setProfileFilled] = useState(false);

  /* ── Fetch templates from API ── */
  useEffect(() => {
    async function load() {
      setLoadingTemplates(true);
      try {
        const res = await fetch("/api/templates");
        if (res.ok) {
          const data: ResumeTemplate[] = await res.json();
          setTemplates(data);
        }
      } catch {
        // silent fail — page still works
      }
      setLoadingTemplates(false);
    }
    load();
  }, []);

  /* ── Auto-fill form from profile when user is logged in ── */
  useEffect(() => {
    if (!profile || profileFilled) return;

    const rd = profile.resume_data;
    const newForm: FormData = {
      name: profile.full_name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      linkedin: profile.linkedin_url || "",
      github: "",
      website: "",
      headline: profile.headline || "",
      summary: rd?.summary || profile.bio || "",
      experience: rd?.experience?.length
        ? rd.experience.map(x => ({
            company: x.company,
            role: x.role,
            duration: x.duration,
            location: "",
            bullets: x.description ? x.description.split("\n").filter(Boolean) : [""],
          }))
        : [{ ...EMPTY_EXPERIENCE, bullets: [""] }],
      education: rd?.education?.length
        ? rd.education.map(x => ({
            institution: x.institution,
            degree: x.degree,
            year: x.year,
            gpa: x.gpa || "",
            location: "",
          }))
        : [{ ...EMPTY_EDUCATION }],
      projects: rd?.projects?.length
        ? rd.projects.map(x => ({
            name: x.company,
            tech: x.role,
            duration: x.duration,
            bullets: x.description ? x.description.split("\n").filter(Boolean) : [""],
          }))
        : [{ ...EMPTY_PROJECT, bullets: [""] }],
      skills: rd?.skills?.length
        ? rd.skills.map((s, i) => ({ category: i === 0 ? "Skills" : `Skills ${i + 1}`, items: s }))
        : [{ category: "Languages", items: "" }, { category: "Frameworks", items: "" }, { category: "Tools", items: "" }],
      certifications: rd?.certifications?.length ? rd.certifications : [""],
      achievements: [""],
    };

    setFormData(newForm);
    setProfileFilled(true);
  }, [profile, profileFilled]);

  /* ── Computed ── */
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCategory = selectedCategory === "all" || t.category.includes(selectedCategory);
      const matchesSearch = !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || null;

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  /* ── Generate code using placeholder replacement ── */
  const handleGenerate = useCallback(() => {
    if (!selectedTemplate) return;
    if (!selectedTemplate.sample_latex_code.trim()) {
      toast.error("This template has no sample code. Admin needs to add LaTeX code.");
      return;
    }
    const code = replacePlaceholders(selectedTemplate.sample_latex_code, formData);
    setGeneratedCode(code);
    setShowCode(true);
    toast.success("LaTeX code generated successfully!");
  }, [selectedTemplate, formData]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("LaTeX code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [generatedCode]);

  const handleOpenOverleaf = useCallback(() => {
    const encoded = encodeURIComponent(generatedCode);
    window.open(`https://www.overleaf.com/docs?snip_uri=data:application/x-tex,${encoded}`, "_blank");
  }, [generatedCode]);

  // ── RENDER: Loading state ──
  if (loadingTemplates) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-brand-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading templates...</p>
        </div>
      </div>
    );
  }

  // ── RENDER: Gallery View ─────────────────────────
  if (!selectedTemplateId) {
    return (
    <>
      <div className="bg-white min-h-screen text-gray-900">
        {/* Hero */}
        <section className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200 py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-4 border border-brand-100">
                <Sparkles size={13} /> Overleaf-Ready LaTeX Templates
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                Professional CV Templates
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                Browse our collection of LaTeX CV templates inspired by the most popular formats on Overleaf. Fill in your details, generate production-ready LaTeX code, and compile on Overleaf in seconds.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                {[
                  { v: String(templates.length), l: "Templates" },
                  { v: "LaTeX", l: "Format" },
                  { v: "Free", l: "Forever" },
                  { v: "1-Click", l: "Overleaf Export" },
                ].map((s) => (
                  <div key={s.l} className="flex items-center gap-1.5">
                    <CheckCircle2 size={15} className="text-brand-500" />
                    <span className="font-semibold text-gray-700">{s.v}</span>
                    <span className="text-gray-500">{s.l}</span>
                  </div>
                ))}
              </div>

              {/* Auto-fill hint */}
              {user && profile && (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  <UserCheck size={14} />
                  Logged in as {profile.full_name || profile.email} — your details will be auto-filled!
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Filter bar */}
        <section className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-1">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition ${selectedCategory === cat.id
                      ? "bg-brand-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search templates..." value={searchQuery} onChange={ev => setSearchQuery(ev.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Templates grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <FileCode2 size={40} className="mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No templates found.</p>
              {searchQuery || selectedCategory !== "all" ? (
                <button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="mt-2 text-brand-600 text-sm hover:underline">Clear filters</button>
              ) : (
                <p className="mt-2 text-sm text-gray-400">Templates are managed by admins. Check back soon!</p>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTemplates.map((t, i) => (
                  <motion.div key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all group cursor-pointer max-w-sm mx-auto"
                  onClick={() => setSelectedTemplateId(t.id)}>

                  {/* Preview Image */}
                  <div className="relative border-b border-gray-100 bg-gray-50 overflow-hidden">
                    {t.preview_image_url ? (
                      <div className="w-full overflow-hidden" style={{ aspectRatio: "4/3", maxHeight: 320 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={t.preview_image_url}
                          alt={`${t.name} preview`}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className={`w-full bg-gradient-to-br ${t.accent} opacity-20`} style={{ aspectRatio: "4/3" }}>
                        <div className="flex items-center justify-center h-full">
                          <FileCode2 size={48} className="text-gray-300" />
                        </div>
                      </div>
                    )}
                    {t.preview_image_url && (
                      <button
                        onClick={(ev) => { ev.stopPropagation(); setPreviewImage(t.preview_image_url); }}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                        <span className="bg-white/90 backdrop-blur text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                          <Eye size={14} /> Preview
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-gray-900">{t.name}</h3>
                      <div className="flex gap-1">
                        {t.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 font-semibold">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 mb-2">by {t.author}</p>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">{t.description}</p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {t.recommended.map(r => (
                        <span key={r} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">{r}</span>
                      ))}
                    </div>

                    <button
                      className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r ${t.accent} text-white hover:opacity-90 transition group-hover:shadow-md`}>
                      Use This Template <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="bg-gray-50 border-t border-gray-200 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">How It Works</h2>
            <div className="grid sm:grid-cols-4 gap-6">
              {[
                { step: "1", icon: <Eye size={22} />, title: "Pick a Template", desc: "Browse our gallery and choose a design that matches your industry." },
                { step: "2", icon: <BookOpen size={22} />, title: "Fill Your Details", desc: "Enter your info — or let us auto-fill from your profile." },
                { step: "3", icon: <FileCode2 size={22} />, title: "Get LaTeX Code", desc: "We generate professional LaTeX code matching your chosen style." },
                { step: "4", icon: <ExternalLink size={22} />, title: "Compile on Overleaf", desc: "One click opens Overleaf with your code ready to compile." },
              ].map(s => (
                <motion.div key={s.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center">
                  <div className="w-12 h-12 bg-brand-100 text-brand-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                    {s.icon}
                  </div>
                  <div className="text-xs font-bold text-brand-500 mb-1">Step {s.step}</div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white border-t border-gray-200 py-14">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="flex justify-center gap-1 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-amber-400 text-amber-400" />)}
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
              Don&apos;t just pick a template — get feedback on it
            </h2>
            <p className="text-gray-600 mb-6 text-sm">After building your resume, run it through our AI analyzer to check ATS compatibility.</p>
            <Link href="/analyzer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition shadow-lg shadow-brand-500/20 text-sm">
              <ArrowRight size={15} /> Analyze Your Resume
            </Link>
          </div>
        </section>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewImage(null)}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={ev => ev.stopPropagation()}>
              <div className="w-full" style={{ height: "85vh", maxHeight: "85vh" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Template preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg transition">
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
    );
  }

  // ── RENDER: Template Builder View ───────────────
  return (
    <>
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedTemplateId(null); setShowCode(false); setGeneratedCode(""); }}
              className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition">
              <ArrowRight size={14} className="rotate-180" /> Back to Templates
            </button>
            <span className="text-gray-300">|</span>
            <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${selectedTemplate?.accent || "from-gray-600 to-gray-800"}`}>
              {selectedTemplate?.name}
            </span>
            <span className="text-xs text-gray-400">by {selectedTemplate?.author}</span>
          </div>
          <div className="flex items-center gap-2">
            {user && profile && profileFilled && (
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                <UserCheck size={12} /> Auto-filled
              </span>
            )}
            <button onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition shadow">
              <Sparkles size={14} /> Generate LaTeX
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">

          {/* ── LEFT: Form ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Your Details</h2>
              <p className="text-xs text-gray-500 mb-5">
                {profileFilled
                  ? "Your profile data has been auto-filled. Edit any field below as needed."
                  : "Fill in your information below. All fields are optional — we'll only include sections with content."}
              </p>

              <div className="space-y-4">
                {/* Personal Info */}
                <CollapsibleSection title="Personal Information" defaultOpen={true}>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input label="Full Name" value={formData.name} onChange={v => updateField("name", v)} placeholder="John Doe" />
                    </div>
                    <Input label="Email" value={formData.email} onChange={v => updateField("email", v)} placeholder="john@example.com" type="email" />
                    <Input label="Phone" value={formData.phone} onChange={v => updateField("phone", v)} placeholder="+1 (555) 000-0000" />
                    <Input label="Location" value={formData.location} onChange={v => updateField("location", v)} placeholder="City, State" />
                    <Input label="Headline / Title" value={formData.headline} onChange={v => updateField("headline", v)} placeholder="Software Engineer" />
                    <Input label="LinkedIn URL" value={formData.linkedin} onChange={v => updateField("linkedin", v)} placeholder="https://linkedin.com/in/..." />
                    <Input label="GitHub URL" value={formData.github} onChange={v => updateField("github", v)} placeholder="https://github.com/..." />
                    <div className="col-span-2">
                      <Input label="Website / Portfolio" value={formData.website} onChange={v => updateField("website", v)} placeholder="https://yoursite.com" />
                    </div>
                  </div>
                </CollapsibleSection>

                {/* Summary */}
                <CollapsibleSection title="Professional Summary">
                  <TextArea label="Summary" value={formData.summary} onChange={v => updateField("summary", v)}
                    placeholder="Experienced software engineer with 5+ years building scalable web applications..." rows={4} />
                </CollapsibleSection>

                {/* Education */}
                <CollapsibleSection title={`Education (${formData.education.length})`}>
                  {formData.education.map((edu, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 relative">
                      {formData.education.length > 1 && (
                        <button onClick={() => updateField("education", formData.education.filter((_, j) => j !== i))}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Institution" value={edu.institution} onChange={v => {
                          const arr = [...formData.education]; arr[i] = { ...arr[i], institution: v }; updateField("education", arr);
                        }} placeholder="MIT" />
                        <Input label="Degree" value={edu.degree} onChange={v => {
                          const arr = [...formData.education]; arr[i] = { ...arr[i], degree: v }; updateField("education", arr);
                        }} placeholder="B.S. Computer Science" />
                        <Input label="Year" value={edu.year} onChange={v => {
                          const arr = [...formData.education]; arr[i] = { ...arr[i], year: v }; updateField("education", arr);
                        }} placeholder="2020 - 2024" />
                        <Input label="GPA (optional)" value={edu.gpa} onChange={v => {
                          const arr = [...formData.education]; arr[i] = { ...arr[i], gpa: v }; updateField("education", arr);
                        }} placeholder="3.8/4.0" />
                        <div className="col-span-2">
                          <Input label="Location" value={edu.location} onChange={v => {
                            const arr = [...formData.education]; arr[i] = { ...arr[i], location: v }; updateField("education", arr);
                          }} placeholder="Cambridge, MA" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => updateField("education", [...formData.education, { ...EMPTY_EDUCATION }])}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1">
                    <Plus size={13} /> Add Education
                  </button>
                </CollapsibleSection>

                {/* Experience */}
                <CollapsibleSection title={`Experience (${formData.experience.length})`}>
                  {formData.experience.map((exp, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 relative">
                      {formData.experience.length > 1 && (
                        <button onClick={() => updateField("experience", formData.experience.filter((_, j) => j !== i))}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Company" value={exp.company} onChange={v => {
                          const arr = [...formData.experience]; arr[i] = { ...arr[i], company: v }; updateField("experience", arr);
                        }} placeholder="Google" />
                        <Input label="Role" value={exp.role} onChange={v => {
                          const arr = [...formData.experience]; arr[i] = { ...arr[i], role: v }; updateField("experience", arr);
                        }} placeholder="Software Engineer" />
                        <Input label="Duration" value={exp.duration} onChange={v => {
                          const arr = [...formData.experience]; arr[i] = { ...arr[i], duration: v }; updateField("experience", arr);
                        }} placeholder="Jun 2022 - Present" />
                        <Input label="Location" value={exp.location} onChange={v => {
                          const arr = [...formData.experience]; arr[i] = { ...arr[i], location: v }; updateField("experience", arr);
                        }} placeholder="Mountain View, CA" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Bullet Points</label>
                        {exp.bullets.map((b, bi) => (
                          <div key={bi} className="flex gap-1 mb-1">
                            <span className="text-gray-400 text-xs mt-2">•</span>
                            <input value={b} onChange={ev => {
                              const arr = [...formData.experience]; const bullets = [...arr[i].bullets]; bullets[bi] = ev.target.value; arr[i] = { ...arr[i], bullets }; updateField("experience", arr);
                            }} placeholder="Describe your achievement..."
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" />
                            {exp.bullets.length > 1 && (
                              <button onClick={() => {
                                const arr = [...formData.experience]; arr[i] = { ...arr[i], bullets: arr[i].bullets.filter((_, j) => j !== bi) }; updateField("experience", arr);
                              }} className="text-gray-400 hover:text-red-500"><X size={13} /></button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => {
                          const arr = [...formData.experience]; arr[i] = { ...arr[i], bullets: [...arr[i].bullets, ""] }; updateField("experience", arr);
                        }} className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 mt-1">
                          <Plus size={11} /> Add Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => updateField("experience", [...formData.experience, { ...EMPTY_EXPERIENCE, bullets: [""] }])}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1">
                    <Plus size={13} /> Add Experience
                  </button>
                </CollapsibleSection>

                {/* Projects */}
                <CollapsibleSection title={`Projects (${formData.projects.length})`}>
                  {formData.projects.map((proj, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2 relative">
                      {formData.projects.length > 1 && (
                        <button onClick={() => updateField("projects", formData.projects.filter((_, j) => j !== i))}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Input label="Project Name" value={proj.name} onChange={v => {
                          const arr = [...formData.projects]; arr[i] = { ...arr[i], name: v }; updateField("projects", arr);
                        }} placeholder="E-commerce Platform" />
                        <Input label="Technologies" value={proj.tech} onChange={v => {
                          const arr = [...formData.projects]; arr[i] = { ...arr[i], tech: v }; updateField("projects", arr);
                        }} placeholder="React, Node.js, PostgreSQL" />
                        <div className="col-span-2">
                          <Input label="Duration" value={proj.duration} onChange={v => {
                            const arr = [...formData.projects]; arr[i] = { ...arr[i], duration: v }; updateField("projects", arr);
                          }} placeholder="Jan 2024 - Mar 2024" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Bullet Points</label>
                        {proj.bullets.map((b, bi) => (
                          <div key={bi} className="flex gap-1 mb-1">
                            <span className="text-gray-400 text-xs mt-2">•</span>
                            <input value={b} onChange={ev => {
                              const arr = [...formData.projects]; const bullets = [...arr[i].bullets]; bullets[bi] = ev.target.value; arr[i] = { ...arr[i], bullets }; updateField("projects", arr);
                            }} placeholder="Describe your contribution..."
                              className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-brand-500 outline-none" />
                            {proj.bullets.length > 1 && (
                              <button onClick={() => {
                                const arr = [...formData.projects]; arr[i] = { ...arr[i], bullets: arr[i].bullets.filter((_, j) => j !== bi) }; updateField("projects", arr);
                              }} className="text-gray-400 hover:text-red-500"><X size={13} /></button>
                            )}
                          </div>
                        ))}
                        <button onClick={() => {
                          const arr = [...formData.projects]; arr[i] = { ...arr[i], bullets: [...arr[i].bullets, ""] }; updateField("projects", arr);
                        }} className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 mt-1">
                          <Plus size={11} /> Add Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => updateField("projects", [...formData.projects, { ...EMPTY_PROJECT, bullets: [""] }])}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1">
                    <Plus size={13} /> Add Project
                  </button>
                </CollapsibleSection>

                {/* Skills */}
                <CollapsibleSection title={`Skills (${formData.skills.length} categories)`}>
                  {formData.skills.map((skill, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="w-32">
                        <Input label={i === 0 ? "Category" : ""} value={skill.category} onChange={v => {
                          const arr = [...formData.skills]; arr[i] = { ...arr[i], category: v }; updateField("skills", arr);
                        }} placeholder="Languages" />
                      </div>
                      <div className="flex-1">
                        <Input label={i === 0 ? "Skills (comma-separated)" : ""} value={skill.items} onChange={v => {
                          const arr = [...formData.skills]; arr[i] = { ...arr[i], items: v }; updateField("skills", arr);
                        }} placeholder="Python, JavaScript, Go, Rust" />
                      </div>
                      {formData.skills.length > 1 && (
                        <button onClick={() => updateField("skills", formData.skills.filter((_, j) => j !== i))}
                          className={`text-gray-400 hover:text-red-500 ${i === 0 ? "mt-5" : ""}`}><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => updateField("skills", [...formData.skills, { category: "", items: "" }])}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1">
                    <Plus size={13} /> Add Skill Category
                  </button>
                </CollapsibleSection>

                {/* Certifications */}
                <CollapsibleSection title={`Certifications (${formData.certifications.filter(c => c.trim()).length})`}>
                  {formData.certifications.map((cert, i) => (
                    <div key={i} className="flex gap-1">
                      <input value={cert} onChange={ev => {
                        const arr = [...formData.certifications]; arr[i] = ev.target.value; updateField("certifications", arr);
                      }} placeholder="AWS Solutions Architect"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                      {formData.certifications.length > 1 && (
                        <button onClick={() => updateField("certifications", formData.certifications.filter((_, j) => j !== i))}
                          className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => updateField("certifications", [...formData.certifications, ""])}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1">
                    <Plus size={13} /> Add Certification
                  </button>
                </CollapsibleSection>

                {/* Achievements */}
                <CollapsibleSection title={`Achievements (${formData.achievements.filter(a => a.trim()).length})`}>
                  {formData.achievements.map((ach, i) => (
                    <div key={i} className="flex gap-1">
                      <input value={ach} onChange={ev => {
                        const arr = [...formData.achievements]; arr[i] = ev.target.value; updateField("achievements", arr);
                      }} placeholder="Won first place at XYZ Hackathon"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
                      {formData.achievements.length > 1 && (
                        <button onClick={() => updateField("achievements", formData.achievements.filter((_, j) => j !== i))}
                          className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => updateField("achievements", [...formData.achievements, ""])}
                    className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold mt-1">
                    <Plus size={13} /> Add Achievement
                  </button>
                </CollapsibleSection>
              </div>

              {/* Generate button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-bold rounded-xl transition shadow-lg shadow-brand-500/20 text-sm">
                  <Sparkles size={16} /> Generate LaTeX Code
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Preview / Code ── */}
          <div className="space-y-4">
            {/* Template info card */}
            {selectedTemplate && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {selectedTemplate.preview_image_url ? (
                  <div className="relative w-full bg-gray-50 cursor-pointer group overflow-hidden" style={{ aspectRatio: "3/4", maxHeight: 420 }}
                    onClick={() => setPreviewImage(selectedTemplate.preview_image_url)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedTemplate.preview_image_url!}
                      alt={`${selectedTemplate.name} preview`}
                      className="w-full h-full object-contain object-top"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                      <span className="bg-white/90 backdrop-blur text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                        <Eye size={14} /> View Full Size
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full bg-gradient-to-br ${selectedTemplate.accent} opacity-20 flex items-center justify-center`} style={{ aspectRatio: "3/4", maxHeight: 420 }}>
                    <FileCode2 size={48} className="text-gray-400" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{selectedTemplate.name}</h3>
                    <span className="text-xs text-gray-400">by {selectedTemplate.author}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{selectedTemplate.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTemplate.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 font-semibold">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generated code */}
            <AnimatePresence>
              {showCode && generatedCode && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <FileCode2 size={16} className="text-brand-600" />
                      <span className="font-semibold text-sm text-gray-800">Generated LaTeX Code</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                        <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                      </button>
                      <button onClick={handleOpenOverleaf}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition">
                        <ExternalLink size={12} /> Open in Overleaf
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[500px] overflow-auto">
                    <pre className="p-4 text-xs leading-relaxed text-gray-700 font-mono whitespace-pre-wrap break-words">
                      {generatedCode}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overleaf instructions */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <h3 className="font-bold text-gray-900">How to Use on Overleaf</h3>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Generate your LaTeX code",
                    desc: "Fill in your details on the left and click \"Generate LaTeX Code\". Review the output to make sure everything looks correct.",
                  },
                  {
                    step: 2,
                    title: "Copy or open in Overleaf",
                    desc: "Click \"Open in Overleaf\" to load your code directly, or copy it to your clipboard.",
                  },
                  {
                    step: 3,
                    title: "Create a new project on Overleaf",
                    desc: "If you copied the code: go to overleaf.com → New Project → Blank Project. Paste the code into the editor replacing the default content.",
                  },
                  {
                    step: 4,
                    title: "Set the correct compiler",
                    desc: "Click the Overleaf menu (top-left) → Settings → Compiler → Select \"pdfLaTeX\" (or \"XeLaTeX\" for some templates).",
                  },
                  {
                    step: 5,
                    title: "Upload required .cls files (if needed)",
                    desc: "Some templates need a .cls file. Check the template notes or template's source for required files and upload to your Overleaf project.",
                  },
                  {
                    step: 6,
                    title: "Compile & download your PDF",
                    desc: "Click the green \"Recompile\" button. Once compiled, download your polished CV as a PDF.",
                  },
                ].map(item => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-2">
                <a href="https://www.overleaf.com/gallery/tagged/cv" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition">
                  <Eye size={14} /> Browse Overleaf Gallery
                </a>
                <a href="https://www.overleaf.com/project" target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow">
                  <ExternalLink size={14} /> Go to Overleaf
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setPreviewImage(null)}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-3xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={ev => ev.stopPropagation()}>
              <div className="w-full" style={{ height: "85vh", maxHeight: "85vh" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage!}
                  alt="Template preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white hover:text-gray-900 shadow-lg transition">
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
