"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCheck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import type { ResumeData } from "@/types";

interface SaveToProfileModalProps {
  open: boolean;
  onClose: () => void;
  /** The uploaded file (if user used file mode) */
  resumeFile: File | null;
  /** The pasted text (if user used text mode) */
  resumeText: string | null;
}

export default function SaveToProfileModal({
  open,
  onClose,
  resumeFile,
  resumeText,
}: SaveToProfileModalProps) {
  const { refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      let res: Response;

      if (resumeFile) {
        const formData = new FormData();
        formData.append("resume_file", resumeFile);
        formData.append("save_to_profile", "true");
        res = await fetch("/api/extract-resume", {
          method: "POST",
          body: formData,
        });
      } else if (resumeText && resumeText.trim().length >= 50) {
        res = await fetch("/api/extract-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_text: resumeText,
            save_to_profile: true,
          }),
        });
      } else {
        setError("No resume content available to extract.");
        setSaving(false);
        return;
      }

      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || "Failed to extract resume data");
      }

      const data = await res.json();
      setPreview(data);
      setSaved(true);
      await refreshProfile();
      toast.success("Resume data saved to your profile!");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setSaved(false);
    setPreview(null);
    setError(null);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="save-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            key="save-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-brand-50 via-purple-50 to-transparent px-6 pt-6 pb-5">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-1.5 text-gray-500 hover:text-gray-900 transition rounded-lg hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                    {saved ? (
                      <CheckCircle2 size={20} className="text-white" />
                    ) : (
                      <UserCheck size={20} className="text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {saved ? "Profile Updated!" : "Save to Profile?"}
                    </h2>
                    <p className="text-sm text-brand-600">
                      {saved
                        ? "Your resume data is now on your profile"
                        : "We can extract and save your resume data"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                {!saved && !error && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We&apos;ll extract your <strong>skills</strong>,{" "}
                      <strong>experience</strong>, <strong>education</strong>,{" "}
                      <strong>projects</strong>, and more from your resume and save
                      it to your profile for quick access across Resumelyzer.
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        "Skills & Technologies",
                        "Work Experience",
                        "Education & GPA",
                        "Projects",
                        "Certifications",
                        "Languages",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-1.5 text-gray-500"
                        >
                          <CheckCircle2 size={12} className="text-brand-500 shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {saved && preview && (
                  <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
                    {preview.skills?.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {preview.skills.slice(0, 15).map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 bg-brand-50 border border-brand-100 rounded-full text-xs text-brand-700"
                            >
                              {s}
                            </span>
                          ))}
                          {preview.skills.length > 15 && (
                            <span className="px-2 py-0.5 text-xs text-gray-400">
                              +{preview.skills.length - 15} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {preview.experience?.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Experience</p>
                        {preview.experience.map((exp) => (
                          <p key={exp.id} className="text-gray-600 text-xs">
                            <strong>{exp.role}</strong>
                            {exp.company ? ` at ${exp.company}` : ""}
                            {exp.duration ? ` (${exp.duration})` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                    {preview.education?.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Education</p>
                        {preview.education.map((edu) => (
                          <p key={edu.id} className="text-gray-600 text-xs">
                            <strong>{edu.degree || edu.institution}</strong>
                            {edu.institution && edu.degree ? ` — ${edu.institution}` : ""}
                            {edu.year ? ` (${edu.year})` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                    {preview.projects?.length > 0 && (
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Projects</p>
                        {preview.projects.map((proj) => (
                          <p key={proj.id} className="text-gray-600 text-xs">
                            <strong>{proj.company || proj.role}</strong>
                            {proj.duration ? ` (${proj.duration})` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex flex-col gap-2">
                {!saved ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Extracting & Saving…
                        </>
                      ) : (
                        <>
                          <UserCheck size={16} />
                          Yes, Save to My Profile
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleClose}
                      disabled={saving}
                      className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 rounded-xl transition"
                    >
                      No thanks, skip
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleClose}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all"
                  >
                    <CheckCircle2 size={16} />
                    Done
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
