"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Briefcase,
  FileText,
  Save,
  LogOut,
  Sparkles,
  Plus,
  X,
  Pencil,
  Check,
  GraduationCap,
  Award,
  Languages,
  Cpu,
  Upload,
  FolderOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import type {
  ResumeData,
  ResumeExperienceItem,
  ResumeEducationItem,
} from "@/types";

// ── tiny helpers ─────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ── Chip (for skills / certs / languages) ────────────────────
function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 bg-brand-50 border border-brand-100 text-brand-700 rounded-full text-xs font-medium">
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 text-brand-600/70 hover:text-red-500 transition"
      >
        <X size={11} />
      </button>
    </span>
  );
}

// ── ChipInput ─────────────────────────────────────────────────
function ChipInput({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function add() {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInput("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            onRemove={() => onChange(items.filter((i) => i !== item))}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          onClick={add}
          className="px-3 py-2 bg-brand-50 border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-100 transition text-sm"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Experience Card ───────────────────────────────────────────
function ExperienceCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: ResumeExperienceItem;
  onUpdate: (v: ResumeExperienceItem) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  function save() {
    onUpdate(draft);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{item.role || "Role"}</p>
            <p className="text-sm text-brand-600">{item.company || "Company"}</p>
            {item.duration && (
              <p className="text-xs text-gray-500 mt-0.5">{item.duration}</p>
            )}
            {item.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
            <button
              onClick={() => { setDraft(item); setEditing(true); }}
              className="p-1.5 text-gray-500 hover:text-gray-700 transition"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-500 hover:text-red-400 transition"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-200 rounded-xl p-4 space-y-2">
      <div className="grid sm:grid-cols-2 gap-2">
        <input
          value={draft.role}
          onChange={(e) => setDraft({ ...draft, role: e.target.value })}
          placeholder="Role / Title"
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <input
          value={draft.company}
          onChange={(e) => setDraft({ ...draft, company: e.target.value })}
          placeholder="Company"
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>
      <input
        value={draft.duration}
        onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
        placeholder="Duration (e.g. Jan 2022 – Present)"
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="Key responsibilities and achievements..."
        rows={3}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => setEditing(false)}
          className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition"
        >
          Cancel
        </button>
        <button
          onClick={save}
          className="px-3 py-1.5 text-sm bg-brand-50 border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-100 transition flex items-center gap-1"
        >
          <Check size={13} /> Save
        </button>
      </div>
    </div>
  );
}

// ── Education Card ────────────────────────────────────────────
function EducationCard({
  item,
  onUpdate,
  onDelete,
}: {
  item: ResumeEducationItem;
  onUpdate: (v: ResumeEducationItem) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item);

  function save() {
    onUpdate(draft);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 group">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{item.degree || "Degree"}</p>
            <p className="text-sm text-purple-700">{item.institution || "Institution"}</p>
            <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
              {item.year && <span>{item.year}</span>}
              {item.gpa && <span>GPA {item.gpa}</span>}
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
            <button onClick={() => { setDraft(item); setEditing(true); }} className="p-1.5 text-gray-500 hover:text-gray-700 transition">
              <Pencil size={13} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-gray-500 hover:text-red-400 transition">
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-purple-200 rounded-xl p-4 space-y-2">
      <div className="grid sm:grid-cols-2 gap-2">
        <input value={draft.degree} onChange={(e) => setDraft({ ...draft, degree: e.target.value })} placeholder="Degree / Field" className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500" />
        <input value={draft.institution} onChange={(e) => setDraft({ ...draft, institution: e.target.value })} placeholder="Institution" className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500" />
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <input value={draft.year} onChange={(e) => setDraft({ ...draft, year: e.target.value })} placeholder="Graduation year" className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500" />
        <input value={draft.gpa || ""} onChange={(e) => setDraft({ ...draft, gpa: e.target.value })} placeholder="GPA (optional)" className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500" />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 transition">Cancel</button>
        <button onClick={save} className="px-3 py-1.5 text-sm bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"><Check size={13} /> Save</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Profile Page
// ══════════════════════════════════════════════════════════════
export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const supabase = createClient();

  const [tab, setTab] = useState<"basic" | "resume">("basic");

  // ── Basic info ──
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  // ── Resume data ──
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<ResumeExperienceItem[]>([]);
  const [projects, setProjects] = useState<ResumeExperienceItem[]>([]);
  const [education, setEducation] = useState<ResumeEducationItem[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [summary, setSummary] = useState("");

  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractText, setExtractText] = useState("");
  const [showExtractBox, setShowExtractBox] = useState(false);
  const [extractInputMode, setExtractInputMode] = useState<"text" | "file">("file");
  const [extractFile, setExtractFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setLocation(profile.location || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");

      const rd = profile.resume_data;
      if (rd) {
        setSkills(rd.skills || []);
        setExperience(rd.experience || []);
        setProjects(rd.projects || []);
        setEducation(rd.education || []);
        setCertifications(rd.certifications || []);
        setLanguages(rd.languages || []);
        setSummary(rd.summary || "");
      }
    }
  }, [profile]);

  async function saveBasic() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          location: location.trim(),
          linkedin_url: linkedinUrl.trim(),
          headline: headline.trim(),
          bio: bio.trim(),
        })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Profile saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function saveResumeData() {
    if (!user) return;
    setSaving(true);
    const resumeData: ResumeData = {
      skills,
      experience,
      projects,
      education,
      certifications,
      languages,
      summary,
    };
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ resume_data: resumeData })
        .eq("id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Resume data saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleExtract() {
    setExtracting(true);
    try {
      let fetchInit: RequestInit;
      if (extractInputMode === "file") {
        if (!extractFile) {
          toast.error("Please select a PDF or Word file first.");
          setExtracting(false);
          return;
        }
        const fd = new FormData();
        fd.append("resume_file", extractFile);
        fd.append("save_to_profile", "false");
        fetchInit = { method: "POST", body: fd };
      } else {
        if (!extractText.trim() || extractText.trim().length < 50) {
          toast.error("Paste at least 50 characters of your resume");
          setExtracting(false);
          return;
        }
        fetchInit = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume_text: extractText, save_to_profile: false }),
        };
      }
      const res = await fetch("/api/extract-resume", fetchInit);
      if (!res.ok) throw new Error("Extraction failed");
      const data: ResumeData = await res.json();
      setSkills(data.skills || []);
      setExperience(data.experience || []);
      setProjects(data.projects || []);
      setEducation(data.education || []);
      setCertifications(data.certifications || []);
      setLanguages(data.languages || []);
      setSummary(data.summary || "");
      setShowExtractBox(false);
      setExtractText("");
      setExtractFile(null);
      toast.success("Resume data extracted! Review and save when ready.");
    } catch {
      toast.error("Extraction failed. Please try again.");
    } finally {
      setExtracting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const initials = (fullName || user.email || "?")[0]?.toUpperCase();

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-3 shadow-lg shadow-brand-500/30">
          {initials}
        </div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent mb-1">
          My Profile
        </h1>
        <p className="text-gray-500 text-sm">{user.email}</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["basic", "resume"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition flex-1 sm:flex-none ${
              tab === t
                ? "bg-brand-50 text-brand-700 border border-brand-200"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {t === "basic" ? "Basic Info" : "Resume Data"}
          </button>
        ))}
        <button
          onClick={() => { signOut(); router.push("/"); }}
          className="w-full sm:w-auto sm:ml-auto flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Basic Info Tab ── */}
        {tab === "basic" && (
          <motion.div
            key="basic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-6 space-y-5"
          >
            {/* Name */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            {/* Headline */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Headline</label>
              <div className="relative">
                <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g., Senior Frontend Developer" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            {/* Bio */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Bio</label>
              <div className="relative">
                <FileText size={15} className="absolute left-3 top-3 text-gray-500" />
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short description about yourself..." className="w-full h-24 bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Phone</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Location</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">LinkedIn URL</label>
              <div className="relative">
                <Linkedin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourname" className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email (read-only)</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" value={user.email || ""} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-gray-400 cursor-not-allowed" />
              </div>
            </div>
            <div className="pt-2">
              <button onClick={saveBasic} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                Save Basic Info
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Resume Data Tab ── */}
        {tab === "resume" && (
          <motion.div
            key="resume"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Auto-extract banner */}
            <div className="glass-card p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles size={15} className="text-brand-600" />
                    Auto-extract from resume
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Upload a PDF / Word file or paste text — we&apos;ll fill everything in
                  </p>
                </div>
                <button
                  onClick={() => setShowExtractBox(!showExtractBox)}
                  className="px-3 py-1.5 text-sm bg-brand-50 border border-brand-200 text-brand-700 rounded-lg hover:bg-brand-100 transition"
                >
                  {showExtractBox ? "Cancel" : "Extract Resume"}
                </button>
              </div>
              <AnimatePresence>
                {showExtractBox && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                    {/* Mode toggle */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => setExtractInputMode("file")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          extractInputMode === "file"
                            ? "bg-brand-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        <Upload size={12} /> Upload File
                      </button>
                      <button
                        onClick={() => setExtractInputMode("text")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          extractInputMode === "text"
                            ? "bg-brand-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        <FileText size={12} /> Paste Text
                      </button>
                    </div>

                    {extractInputMode === "file" ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-50 transition group">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => setExtractFile(e.target.files?.[0] ?? null)}
                        />
                        {extractFile ? (
                          <div className="text-center px-4">
                            <p className="text-sm font-medium text-brand-700">{extractFile.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(extractFile.size / 1024).toFixed(0)} KB — click to change</p>
                          </div>
                        ) : (
                          <div className="text-center px-4">
                            <Upload size={24} className="mx-auto mb-2 text-gray-500 group-hover:text-brand-400 transition" />
                            <p className="text-sm text-gray-600 group-hover:text-gray-700 transition">Click to upload <span className="text-gray-500">or drag &amp; drop</span></p>
                            <p className="text-xs text-gray-600 mt-1">PDF, DOC, DOCX</p>
                          </div>
                        )}
                      </label>
                    ) : (
                      <textarea value={extractText} onChange={(e) => setExtractText(e.target.value)} placeholder="Paste your resume text here..." rows={8} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
                    )}

                    <button onClick={handleExtract} disabled={extracting} className="mt-3 flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 disabled:bg-gray-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50">
                      {extracting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Extracting...</> : <><Sparkles size={14} /> Extract Data</>}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Skills */}
            <div className="glass-card p-5">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <Cpu size={16} className="text-brand-600" /> Skills
              </h3>
              <ChipInput items={skills} onChange={setSkills} placeholder="Add a skill and press Enter" />
            </div>

            {/* Experience */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <Briefcase size={16} className="text-purple-400" /> Experience
                </h3>
                <button
                  onClick={() => setExperience([{ id: uid(), company: "", role: "", duration: "", description: "" }, ...experience])}
                  className="px-3 py-1.5 text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-100 transition flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {experience.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No experience added yet. Click Add or use auto-extract.</p>}
                {experience.map((exp) => (
                  <ExperienceCard
                    key={exp.id}
                    item={exp}
                    onUpdate={(updated) => setExperience(experience.map((e) => e.id === updated.id ? updated : e))}
                    onDelete={() => setExperience(experience.filter((e) => e.id !== exp.id))}
                  />
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <FolderOpen size={16} className="text-blue-400" /> Projects
                </h3>
                <button
                  onClick={() => setProjects([{ id: uid(), company: "", role: "", duration: "", description: "" }, ...projects])}
                  className="px-3 py-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {projects.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No projects added yet. Click Add or use auto-extract.</p>}
                {projects.map((proj) => (
                  <ExperienceCard
                    key={proj.id}
                    item={proj}
                    onUpdate={(updated) => setProjects(projects.map((p) => p.id === updated.id ? updated : p))}
                    onDelete={() => setProjects(projects.filter((p) => p.id !== proj.id))}
                  />
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 font-semibold text-gray-900">
                  <GraduationCap size={16} className="text-green-400" /> Education
                </h3>
                <button
                  onClick={() => setEducation([{ id: uid(), institution: "", degree: "", year: "", gpa: "" }, ...education])}
                  className="px-3 py-1.5 text-xs bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {education.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No education added yet.</p>}
                {education.map((edu) => (
                  <EducationCard
                    key={edu.id}
                    item={edu}
                    onUpdate={(updated) => setEducation(education.map((e) => e.id === updated.id ? updated : e))}
                    onDelete={() => setEducation(education.filter((e) => e.id !== edu.id))}
                  />
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="glass-card p-5">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <Award size={16} className="text-yellow-400" /> Certifications
              </h3>
              <ChipInput items={certifications} onChange={setCertifications} placeholder="Add a certification and press Enter" />
            </div>

            {/* Languages */}
            <div className="glass-card p-5">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <Languages size={16} className="text-pink-400" /> Languages
              </h3>
              <ChipInput items={languages} onChange={setLanguages} placeholder="e.g., English, Spanish…" />
            </div>

            {/* Summary */}
            <div className="glass-card p-5">
              <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-4">
                <FileText size={16} className="text-brand-600" /> Professional Summary
              </h3>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A brief professional summary extracted from your resume..."
                rows={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            {/* Save */}
            <button onClick={saveResumeData} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              Save Resume Data
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
