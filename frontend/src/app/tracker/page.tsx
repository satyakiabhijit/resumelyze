"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Plus,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  Trash2,
  Edit3,
  X,
  Check,
  StickyNote,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import type { TrackedJob, JobStatus } from "@/types";

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bg: string }> = {
  saved: { label: "Saved", color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/20" },
  applied: { label: "Applied", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  interview: { label: "Interview", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  offer: { label: "Offer", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
};

const STATUS_ORDER: JobStatus[] = ["saved", "applied", "interview", "offer", "rejected"];

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadJobs(): TrackedJob[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("resumelyzer_jobs");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveJobs(jobs: TrackedJob[]) {
  localStorage.setItem("resumelyzer_jobs", JSON.stringify(jobs));
}

export default function JobTrackerPage() {
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<JobStatus | "all">("all");

  // Form state
  const [formCompany, setFormCompany] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formStatus, setFormStatus] = useState<JobStatus>("saved");
  const [formNotes, setFormNotes] = useState("");

  useEffect(() => {
    setJobs(loadJobs());
  }, []);

  const persist = useCallback((updated: TrackedJob[]) => {
    setJobs(updated);
    saveJobs(updated);
  }, []);

  function resetForm() {
    setFormCompany("");
    setFormRole("");
    setFormUrl("");
    setFormStatus("saved");
    setFormNotes("");
    setShowForm(false);
    setEditingId(null);
  }

  function handleAdd() {
    if (!formCompany.trim() || !formRole.trim()) {
      toast.error("Company and role are required");
      return;
    }
    const now = new Date().toISOString();
    const job: TrackedJob = {
      id: generateId(),
      company: formCompany.trim(),
      role: formRole.trim(),
      url: formUrl.trim() || undefined,
      status: formStatus,
      date_applied: now,
      date_updated: now,
      notes: formNotes.trim() || undefined,
    };
    persist([job, ...jobs]);
    toast.success("Job added!");
    resetForm();
  }

  function handleUpdate() {
    if (!editingId) return;
    const updated = jobs.map((j) =>
      j.id === editingId
        ? {
            ...j,
            company: formCompany.trim(),
            role: formRole.trim(),
            url: formUrl.trim() || undefined,
            status: formStatus,
            notes: formNotes.trim() || undefined,
            date_updated: new Date().toISOString(),
          }
        : j
    );
    persist(updated);
    toast.success("Job updated!");
    resetForm();
  }

  function startEdit(job: TrackedJob) {
    setFormCompany(job.company);
    setFormRole(job.role);
    setFormUrl(job.url || "");
    setFormStatus(job.status);
    setFormNotes(job.notes || "");
    setEditingId(job.id);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    persist(jobs.filter((j) => j.id !== id));
    toast.success("Job removed");
  }

  function handleStatusChange(id: string, status: JobStatus) {
    const updated = jobs.map((j) =>
      j.id === id ? { ...j, status, date_updated: new Date().toISOString() } : j
    );
    persist(updated);
  }

  const filteredJobs = filterStatus === "all" ? jobs : jobs.filter((j) => j.status === filterStatus);

  // Stats
  const stats = STATUS_ORDER.map((status) => ({
    status,
    count: jobs.filter((j) => j.status === status).length,
    ...STATUS_CONFIG[status],
  }));

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-brand-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Job Tracker
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Keep your job search organized. Track applications, interviews, and offers
          — all in one place.
        </p>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8"
      >
        {stats.map((s) => (
          <button
            key={s.status}
            onClick={() => setFilterStatus(filterStatus === s.status ? "all" : s.status)}
            className={`glass-card p-4 text-center transition cursor-pointer ${
              filterStatus === s.status ? "ring-2 ring-brand-500" : ""
            }`}
          >
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </button>
        ))}
      </motion.div>

      {/* Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 size={18} className="text-brand-400" />
            Applications ({filteredJobs.length})
          </h2>
          {filterStatus !== "all" && (
            <button
              onClick={() => setFilterStatus("all")}
              className="text-xs text-gray-400 hover:text-white bg-gray-800 px-2 py-1 rounded-lg transition"
            >
              Show all
            </button>
          )}
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition"
        >
          <Plus size={16} />
          Add Job
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editingId ? "Edit Application" : "Add Application"}
                </h3>
                <button onClick={resetForm} className="text-gray-400 hover:text-white transition">
                  <X size={18} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Company *</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g., Google"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Role *</label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g., Software Engineer"
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Job URL (optional)</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_CONFIG[s].label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Add any notes about this application..."
                  className="w-full h-20 bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <button
                onClick={editingId ? handleUpdate : handleAdd}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium transition"
              >
                <Check size={16} />
                {editingId ? "Update" : "Add Application"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job List */}
      {filteredJobs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Briefcase size={64} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500 text-lg">
            {jobs.length === 0
              ? "No applications tracked yet. Start by adding a job!"
              : "No applications match the current filter."}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job, idx) => {
            const config = STATUS_CONFIG[job.status];
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-4 sm:p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                      <h3 className="font-semibold text-white truncate">{job.company}</h3>
                      {job.url && (
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-brand-400 transition flex-shrink-0"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Briefcase size={13} />
                      {job.role}
                    </p>
                    {job.notes && (
                      <p className="text-xs text-gray-500 mt-1.5 flex items-start gap-1.5">
                        <StickyNote size={12} className="mt-0.5 flex-shrink-0" />
                        {job.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Status Selector */}
                    <select
                      value={job.status}
                      onChange={(e) => handleStatusChange(job.id, e.target.value as JobStatus)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full border ${config.bg} ${config.color} bg-transparent cursor-pointer focus:outline-none`}
                    >
                      {STATUS_ORDER.map((s) => (
                        <option key={s} value={s} className="bg-gray-900 text-gray-200">
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>

                    <div className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                      <Calendar size={12} />
                      {new Date(job.date_updated).toLocaleDateString()}
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(job)}
                        className="p-1.5 text-gray-400 hover:text-white transition"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
