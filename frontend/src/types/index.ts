// ── TypeScript types for Resumelyze API ──

export interface SectionScore {
  score: number;
  suggestion: string;
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
