"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Upload,
  FileCode2,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Shield,
  AlertTriangle,
  Copy,
  Loader2,
} from "lucide-react";
import type { ResumeTemplate } from "@/types";

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const CATEGORY_OPTIONS = ["professional", "academic", "creative", "simple", "two-column"];

const ACCENT_PRESETS = [
  { label: "Blue", value: "from-blue-600 to-blue-800", bg: "bg-blue-50" },
  { label: "Red", value: "from-red-600 to-red-800", bg: "bg-red-50" },
  { label: "Teal", value: "from-teal-600 to-teal-800", bg: "bg-teal-50" },
  { label: "Slate", value: "from-slate-600 to-slate-800", bg: "bg-slate-50" },
  { label: "Purple", value: "from-purple-600 to-purple-800", bg: "bg-purple-50" },
  { label: "Emerald", value: "from-emerald-600 to-emerald-800", bg: "bg-emerald-50" },
  { label: "Gray", value: "from-gray-700 to-gray-900", bg: "bg-gray-50" },
  { label: "Amber", value: "from-amber-700 to-amber-900", bg: "bg-amber-50" },
  { label: "Pink", value: "from-pink-500 to-rose-600", bg: "bg-pink-50" },
];

const PLACEHOLDER_GUIDE = `Available placeholders (use in your LaTeX code):

── Simple ──
{{NAME}}          Full name
{{EMAIL}}         Email address
{{PHONE}}         Phone number
{{LOCATION}}      City, State
{{LINKEDIN}}      LinkedIn URL
{{GITHUB}}        GitHub URL
{{WEBSITE}}       Website/Portfolio URL
{{HEADLINE}}      Professional title
{{SUMMARY}}       Professional summary

── Repeating Sections ──
{{#EDUCATION}}...{{/EDUCATION}}
  Inside: {{INSTITUTION}}, {{DEGREE}}, {{YEAR}}, {{GPA}}, {{EDU_LOCATION}}

{{#EXPERIENCE}}...{{/EXPERIENCE}}
  Inside: {{COMPANY}}, {{ROLE}}, {{DURATION}}, {{EXP_LOCATION}}
  Bullets: {{#BULLETS}}{{BULLET}}{{/BULLETS}}

{{#PROJECTS}}...{{/PROJECTS}}
  Inside: {{PROJECT_NAME}}, {{TECH}}, {{PROJ_DURATION}}
  Bullets: {{#BULLETS}}{{BULLET}}{{/BULLETS}}

{{#SKILLS}}...{{/SKILLS}}
  Inside: {{CATEGORY}}, {{ITEMS}}

{{#CERTIFICATIONS}}...{{/CERTIFICATIONS}}
  Inside: {{CERT}}

{{#ACHIEVEMENTS}}...{{/ACHIEVEMENTS}}
  Inside: {{ACHIEVEMENT}}`;

/* ═══════════════════════════════════════════════════════════════
   FORM STATE
   ═══════════════════════════════════════════════════════════════ */

interface TemplateForm {
  id?: string;
  name: string;
  author: string;
  description: string;
  category: string[];
  tags: string;
  accent: string;
  bg: string;
  preview_image_url: string;
  sample_latex_code: string;
  recommended: string;
  is_active: boolean;
  sort_order: number;
}

function emptyForm(): TemplateForm {
  return {
    name: "",
    author: "",
    description: "",
    category: [],
    tags: "",
    accent: ACCENT_PRESETS[0].value,
    bg: ACCENT_PRESETS[0].bg,
    preview_image_url: "",
    sample_latex_code: "",
    recommended: "",
    is_active: true,
    sort_order: 0,
  };
}

function templateToForm(t: ResumeTemplate): TemplateForm {
  return {
    id: t.id,
    name: t.name,
    author: t.author,
    description: t.description,
    category: t.category,
    tags: t.tags.join(", "),
    accent: t.accent,
    bg: t.bg,
    preview_image_url: t.preview_image_url || "",
    sample_latex_code: t.sample_latex_code,
    recommended: t.recommended.join(", "),
    is_active: t.is_active,
    sort_order: t.sort_order,
  };
}

/* ═══════════════════════════════════════════════════════════════
   ADMIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function AdminTemplatesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [showGuide, setShowGuide] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const isAdmin = profile?.is_admin === true;

  /* ── Fetch all templates (admin endpoint) ── */
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/templates/admin");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      } else {
        const err = await res.json();
        toast.error(err.detail || "Failed to load templates");
      }
    } catch {
      toast.error("Network error loading templates");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && isAdmin) fetchTemplates();
  }, [authLoading, isAdmin, fetchTemplates]);

  /* ── Image upload ── */
  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/templates/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm(prev => ({ ...prev, preview_image_url: url }));
        toast.success("Image uploaded!");
      } else {
        const err = await res.json();
        toast.error(err.detail || "Upload failed");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }, []);

  /* ── Save (create or update) ── */
  const handleSave = useCallback(async () => {
    if (!form.name.trim()) { toast.error("Template name is required"); return; }
    if (!form.sample_latex_code.trim()) { toast.error("Sample LaTeX code is required"); return; }

    setSaving(true);
    const payload = {
      ...(form.id ? { id: form.id } : {}),
      name: form.name,
      author: form.author,
      description: form.description,
      category: form.category,
      tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
      accent: form.accent,
      bg: form.bg,
      preview_image_url: form.preview_image_url || null,
      sample_latex_code: form.sample_latex_code,
      recommended: form.recommended.split(",").map(r => r.trim()).filter(Boolean),
      is_active: form.is_active,
      sort_order: form.sort_order,
    };

    try {
      const method = form.id ? "PUT" : "POST";
      const res = await fetch("/api/templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(form.id ? "Template updated!" : "Template created!");
        setShowForm(false);
        setForm(emptyForm());
        fetchTemplates();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Save failed");
      }
    } catch {
      toast.error("Network error");
    }
    setSaving(false);
  }, [form, fetchTemplates]);

  /* ── Delete ── */
  const handleDelete = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Template deleted");
        setDeleteConfirm(null);
        fetchTemplates();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Delete failed");
      }
    } catch {
      toast.error("Network error");
    }
  }, [fetchTemplates]);

  /* ── Edit ── */
  const handleEdit = useCallback((t: ResumeTemplate) => {
    setForm(templateToForm(t));
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* ── Auth guard ── */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto shadow-sm">
          <AlertTriangle size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 text-sm">You need to be signed in as an admin to access this page.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-md mx-auto shadow-sm">
          <Shield size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-sm">You need admin privileges to access this page. Contact the site administrator.</p>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="bg-gray-50 min-h-screen text-gray-900">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-brand-600" />
              <h1 className="text-2xl font-extrabold text-gray-900">Admin — Template Manager</h1>
            </div>
            <p className="text-sm text-gray-500">Add, edit, and manage resume LaTeX templates. Upload preview images and paste sample code with placeholders.</p>
          </div>
          <button
            onClick={() => { setForm(emptyForm()); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition shadow">
            <Plus size={16} /> New Template
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── CREATE / EDIT FORM ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    {form.id ? "Edit Template" : "New Template"}
                  </h2>
                  <button onClick={() => { setShowForm(false); setForm(emptyForm()); }}
                    className="text-gray-400 hover:text-gray-600 transition">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left column — meta */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Template Name *</label>
                      <input
                        value={form.name}
                        onChange={ev => setForm(p => ({ ...p, name: ev.target.value }))}
                        placeholder="Jake's Resume"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Author</label>
                        <input
                          value={form.author}
                          onChange={ev => setForm(p => ({ ...p, author: ev.target.value }))}
                          placeholder="Jake Ryan"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Sort Order</label>
                        <input
                          type="number"
                          value={form.sort_order}
                          onChange={ev => setForm(p => ({ ...p, sort_order: parseInt(ev.target.value) || 0 }))}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                      <textarea
                        value={form.description}
                        onChange={ev => setForm(p => ({ ...p, description: ev.target.value }))}
                        placeholder="A clean, single-column resume..."
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y"
                      />
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORY_OPTIONS.map(cat => (
                          <button key={cat}
                            onClick={() => setForm(p => ({
                              ...p,
                              category: p.category.includes(cat)
                                ? p.category.filter(c => c !== cat)
                                : [...p.category, cat],
                            }))}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition ${form.category.includes(cat) ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tags (comma separated)</label>
                        <input
                          value={form.tags}
                          onChange={ev => setForm(p => ({ ...p, tags: ev.target.value }))}
                          placeholder="ATS Friendly, Popular"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Recommended For (comma separated)</label>
                        <input
                          value={form.recommended}
                          onChange={ev => setForm(p => ({ ...p, recommended: ev.target.value }))}
                          placeholder="Software Engineer, New Grad"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Accent color */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Color Theme</label>
                      <div className="flex flex-wrap gap-2">
                        {ACCENT_PRESETS.map(p => (
                          <button key={p.label}
                            onClick={() => setForm(prev => ({ ...prev, accent: p.value, bg: p.bg }))}
                            className={`w-8 h-8 rounded-lg bg-gradient-to-r ${p.value} transition ring-2 ${form.accent === p.value ? "ring-brand-500 ring-offset-2" : "ring-transparent"}`}
                            title={p.label}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Active toggle */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                        className={`relative w-10 h-5 rounded-full transition ${form.is_active ? "bg-brand-600" : "bg-gray-300"}`}>
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? "translate-x-5" : ""}`} />
                      </button>
                      <span className="text-sm text-gray-700 font-medium">{form.is_active ? "Active (visible to users)" : "Inactive (hidden)"}</span>
                    </div>

                    {/* Preview image upload */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Preview Image</label>
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <input
                            value={form.preview_image_url}
                            onChange={ev => setForm(p => ({ ...p, preview_image_url: ev.target.value }))}
                            placeholder="Image URL (or upload below)"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none mb-2"
                          />
                          <label className={`inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-600 cursor-pointer hover:border-brand-400 hover:text-brand-600 transition ${uploading ? "opacity-50" : ""}`}>
                            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {uploading ? "Uploading..." : "Upload Image"}
                            <input type="file" accept="image/*" className="hidden" disabled={uploading}
                              onChange={ev => { if (ev.target.files?.[0]) handleImageUpload(ev.target.files[0]); }} />
                          </label>
                        </div>
                        {form.preview_image_url && (
                          <div className="w-24 h-32 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={form.preview_image_url}
                              alt="Preview"
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right column — LaTeX code */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-gray-500">
                        Sample LaTeX Code *{" "}
                        <span className="text-gray-400 font-normal">(with placeholders)</span>
                      </label>
                      <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold">
                        <FileCode2 size={12} /> {showGuide ? "Hide" : "Show"} Placeholder Guide
                      </button>
                    </div>

                    {/* Placeholder guide */}
                    <AnimatePresence>
                      {showGuide && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden">
                          <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 leading-relaxed whitespace-pre-wrap mb-2">
                            {PLACEHOLDER_GUIDE}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <textarea
                      value={form.sample_latex_code}
                      onChange={ev => setForm(p => ({ ...p, sample_latex_code: ev.target.value }))}
                      placeholder={`\\documentclass{article}\n\\begin{document}\n\n% Paste your LaTeX template here\n% Use {{NAME}}, {{EMAIL}}, etc. for placeholders\n\n\\end{document}`}
                      rows={22}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none resize-y font-mono leading-relaxed bg-gray-50"
                      spellCheck={false}
                    />

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <FileCode2 size={12} />
                      {form.sample_latex_code.length.toLocaleString()} characters
                    </div>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => { setShowForm(false); setForm(emptyForm()); }}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition">
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition shadow disabled:opacity-50">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {form.id ? "Update Template" : "Create Template"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TEMPLATE LIST ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-brand-600" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <FileCode2 size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">No Templates Yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first template to get started.</p>
            <button
              onClick={() => { setForm(emptyForm()); setShowForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition">
              <Plus size={14} /> Create Template
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{templates.length} Template{templates.length !== 1 ? "s" : ""}</h2>
            </div>

            {templates.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all ${!t.is_active ? "opacity-60 border-gray-200" : "border-gray-200"}`}>
                <div className="flex items-center gap-4 p-4">
                  {/* Drag handle / order */}
                  <div className="flex items-center gap-2 text-gray-300 shrink-0">
                    <GripVertical size={16} />
                    <span className="text-xs font-mono text-gray-400 w-6 text-center">{t.sort_order}</span>
                  </div>

                  {/* Preview thumbnail */}
                  <div className="w-12 h-16 rounded-md overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                    {t.preview_image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={t.preview_image_url}
                        alt={t.name}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${t.accent} opacity-30`} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 truncate">{t.name}</h3>
                      {!t.is_active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-semibold">HIDDEN</span>
                      )}
                      {t.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-100 font-semibold">{tag}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{t.description || "No description"}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-gray-400">by {t.author || "Unknown"}</span>
                      <span className="text-[10px] text-gray-300">|</span>
                      <span className="text-[10px] text-gray-400">{t.category.join(", ") || "Uncategorized"}</span>
                      <span className="text-[10px] text-gray-300">|</span>
                      <span className="text-[10px] text-gray-400">{t.sample_latex_code.length.toLocaleString()} chars</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                      title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(t.sample_latex_code);
                        toast.success("LaTeX code copied!");
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      title="Copy code">
                      <Copy size={15} />
                    </button>
                    {deleteConfirm === t.id ? (
                      <div className="flex items-center gap-1 bg-red-50 rounded-lg px-2 py-1">
                        <span className="text-xs text-red-600 font-semibold">Delete?</span>
                        <button onClick={() => handleDelete(t.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition text-xs font-bold">Yes</button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="p-1 text-gray-500 hover:bg-gray-200 rounded transition text-xs font-bold">No</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(t.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
