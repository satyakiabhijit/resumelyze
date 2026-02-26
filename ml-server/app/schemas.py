"""
Pydantic schemas matching the frontend's TypeScript types exactly.
"""

from __future__ import annotations
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class SectionScore(BaseModel):
    score: int = 0
    suggestion: str = ""


class ClicheItem(BaseModel):
    phrase: str
    suggestion: str


class ActionVerbAnalysis(BaseModel):
    score: int = 0
    weak_verbs: List[str] = []
    strong_verbs: List[str] = []
    suggestions: List[str] = []


class QuantificationAnalysis(BaseModel):
    score: int = 0
    quantified_bullets: int = 0
    total_bullets: int = 0
    suggestions: List[str] = []


class ATSDetailedCheck(BaseModel):
    overall_score: int = 0
    has_email: bool = False
    has_phone: bool = False
    has_linkedin: bool = False
    has_clean_formatting: bool = True
    section_headings_valid: bool = False
    keyword_density: float = 0.0
    issues: List[str] = []
    recommendations: List[str] = []


class ContentImprovement(BaseModel):
    original: str
    improved: str
    reason: str


class AnalysisResult(BaseModel):
    """Matches the frontend AnalysisResult interface exactly."""
    jd_match: int = 0
    ats_score: int = 0
    missing_keywords: List[str] = []
    found_keywords: List[str] = []
    section_scores: Dict[str, SectionScore] = {}
    profile_summary: str = ""
    strengths: List[str] = []
    weaknesses: List[str] = []
    action_items: List[str] = []
    keyword_density: float = 0.0
    readability_score: int = 0
    formatting_feedback: str = ""
    recommended_roles: List[str] = []
    analysis_mode: str = "ml"

    # Enhanced fields
    cliches: List[ClicheItem] = []
    action_verb_analysis: Optional[ActionVerbAnalysis] = None
    quantification_analysis: Optional[QuantificationAnalysis] = None
    ats_detailed: Optional[ATSDetailedCheck] = None
    content_improvements: List[ContentImprovement] = []
    section_completeness: int = 0
    overall_grade: str = ""


class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., min_length=50)
    job_description: str = Field(..., min_length=10)


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "2.0.0"
    ai_available: bool = True
    nlp_available: bool = True
    models_loaded: Dict[str, bool] = {}


class CoverLetterRequest(BaseModel):
    resume_text: str = Field(..., min_length=50)
    job_description: str = Field(..., min_length=10)
    tone: str = "professional"
    company_name: str = ""
    role_title: str = ""


class CoverLetterResult(BaseModel):
    cover_letter: str
    tone: str
    word_count: int


class SkillsRequest(BaseModel):
    job_description: str = Field(..., min_length=10)
    resume_text: str = ""
    role_title: str = ""


class SkillCategory(BaseModel):
    category: str
    skills: List[str]


class SkillsResult(BaseModel):
    role: str
    hard_skills: List[SkillCategory] = []
    soft_skills: List[str] = []
    missing_from_resume: List[str] = []
    matching_in_resume: List[str] = []
