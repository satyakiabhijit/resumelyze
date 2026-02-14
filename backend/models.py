"""
Pydantic models for Resumelyze API
"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class AnalysisMode(str, Enum):
    AI = "ai"           # Full AI analysis via Gemini
    LOCAL = "local"     # Local NLP-only analysis (no API key needed)
    HYBRID = "hybrid"   # Local NLP + AI enhancement


class SectionScore(BaseModel):
    score: int = Field(0, ge=0, le=100)
    suggestion: str = ""


class AnalysisRequest(BaseModel):
    job_description: str = Field(..., min_length=10, description="The job description text")
    resume_text: Optional[str] = Field(None, description="Resume text (if not uploading file)")
    mode: AnalysisMode = Field(AnalysisMode.AI, description="Analysis mode")


class AnalysisResult(BaseModel):
    jd_match: int = Field(0, ge=0, le=100, description="JD match percentage")
    ats_score: int = Field(0, ge=0, le=100, description="ATS compatibility score")
    missing_keywords: list[str] = Field(default_factory=list)
    found_keywords: list[str] = Field(default_factory=list)
    section_scores: dict[str, SectionScore] = Field(default_factory=dict)
    profile_summary: str = ""
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    action_items: list[str] = Field(default_factory=list)
    keyword_density: float = 0.0
    readability_score: int = Field(0, ge=0, le=100)
    formatting_feedback: str = ""
    recommended_roles: list[str] = Field(default_factory=list)
    analysis_mode: str = "hybrid"


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "2.0.0"
    ai_available: bool = False
    nlp_available: bool = False


class ErrorResponse(BaseModel):
    detail: str
    error_code: str = "UNKNOWN_ERROR"
