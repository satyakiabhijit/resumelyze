// ── TypeScript types for Resumelyzer API ──

// ── Resume Data (extracted from resume text) ──
export interface ResumeExperienceItem {
  id: string; // client-only uuid for keying
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ResumeEducationItem {
  id: string;
  institution: string;
  degree: string;
  year: string;
  gpa?: string;
}

export interface ResumeData {
  skills: string[];
  experience: ResumeExperienceItem[];
  projects: ResumeExperienceItem[];
  education: ResumeEducationItem[];
  certifications: string[];
  languages: string[];
  summary: string;
}

// ── User Profile (from Supabase) ──
export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin_url: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  resume_data: ResumeData | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

// ── Resume Template (admin-managed) ──
export interface ResumeTemplate {
  id: string;
  name: string;
  author: string;
  description: string;
  category: string[];
  tags: string[];
  accent: string;
  bg: string;
  preview_image_url: string | null;
  sample_latex_code: string;
  recommended: string[];
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SectionScore {
  score: number;
  suggestion: string;
}

export interface ClicheItem {
  phrase: string;
  suggestion: string;
}

export interface ActionVerbAnalysis {
  score: number;
  weak_verbs: string[];
  strong_verbs: string[];
  suggestions: string[];
}

export interface QuantificationAnalysis {
  score: number;
  quantified_bullets: number;
  total_bullets: number;
  suggestions: string[];
}

export interface ATSDetailedCheck {
  overall_score: number;
  has_email: boolean;
  has_phone: boolean;
  has_linkedin: boolean;
  has_clean_formatting: boolean;
  section_headings_valid: boolean;
  keyword_density: number;
  issues: string[];
  recommendations: string[];
}

export interface ContentImprovement {
  original: string;
  improved: string;
  reason: string;
}

export interface AnalysisResult {
  jd_match: number;
  ats_score: number;
  missing_keywords: string[];
  found_keywords: string[];
  section_scores: Record<string, SectionScore>;
  profile_summary: string;
  strengths: string[];
  weaknesses: string[];
  action_items: string[];
  keyword_density: number;
  readability_score: number;
  formatting_feedback: string;
  recommended_roles: string[];
  analysis_mode: string;
  // Enhanced analysis fields
  cliches?: ClicheItem[];
  action_verb_analysis?: ActionVerbAnalysis;
  quantification_analysis?: QuantificationAnalysis;
  ats_detailed?: ATSDetailedCheck;
  content_improvements?: ContentImprovement[];
  section_completeness?: number;
  overall_grade?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  ai_available: boolean;
  nlp_available: boolean;
}

export interface AnalysisMode {
  id: string;
  name: string;
  available: boolean;
  description: string;
}

export interface ModesResponse {
  modes: AnalysisMode[];
  default: string;
}

// ── Cover Letter Types ──
export interface CoverLetterRequest {
  resume_text: string;
  job_description: string;
  tone?: "professional" | "creative" | "conversational";
  company_name?: string;
  role_title?: string;
}

export interface CoverLetterResult {
  cover_letter: string;
  tone: string;
  word_count: number;
}

// ── Skills Finder Types ──
export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface SkillsFinderResult {
  role: string;
  hard_skills: SkillCategory[];
  soft_skills: string[];
  missing_from_resume: string[];
  matching_in_resume: string[];
}

// ── Job Tracker Types ──
export type JobStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface TrackedJob {
  id: string;
  user_id?: string;
  company: string;
  role: string;
  url?: string;
  status: JobStatus;
  applied_date?: string;
  date_applied?: string; // legacy alias
  date_updated?: string; // legacy alias
  job_description?: string;
  notes?: string;
  salary?: string;
  resume_score?: number;
  jd_text?: string;
  created_at?: string;
  updated_at?: string;
}

// ── Analysis History (DB row) ──
export interface AnalysisHistoryRow {
  id: string;
  user_id: string;
  resume_filename: string | null;
  job_description_preview: string | null;
  analysis_mode: string | null;
  jd_match: number | null;
  ats_score: number | null;
  readability_score: number | null;
  overall_grade: string | null;
  missing_keywords: string[] | null;
  found_keywords: string[] | null;
  full_result: AnalysisResult | null;
  created_at: string;
}

// ── Cover Letter History (DB row) ──
export interface CoverLetterRow {
  id: string;
  user_id: string;
  title: string | null;
  company_name: string | null;
  role_title: string | null;
  tone: string | null;
  cover_letter_text: string;
  word_count: number | null;
  job_description_preview: string | null;
  created_at: string;
  updated_at: string;
}
