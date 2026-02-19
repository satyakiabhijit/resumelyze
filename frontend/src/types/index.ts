// ── TypeScript types for Resumelyzer API ──

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
  company: string;
  role: string;
  url?: string;
  status: JobStatus;
  date_applied: string;
  date_updated: string;
  notes?: string;
  resume_score?: number;
  jd_text?: string;
}
