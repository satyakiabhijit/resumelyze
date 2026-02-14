"""
Resumelyze Backend Configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# CORS Origins — allow Next.js dev & production
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://resumelyze.vercel.app",
    "https://*.vercel.app",  # Allow all Vercel preview deployments
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]

# Gemini Model
# Candidate Gemini / Generative model names to try (order matters).
# Discovered from API on 2026-02-14 - these are confirmed working models.
GEMINI_MODEL_CANDIDATES = [
    os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash"),
    "models/gemini-2.5-flash",      # Latest fast model (recommended)
    "models/gemini-2.0-flash",       # Stable fast model
    "models/gemini-flash-latest",    # Auto-updated flash alias
    "models/gemini-2.5-pro",         # Most capable model
    "models/gemini-pro-latest",      # Auto-updated pro alias
]

# Upload settings
MAX_FILE_SIZE_MB = 10
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

# Analysis Prompt Template
ANALYSIS_PROMPT = """
You are an advanced AI-powered ATS and resume evaluator with deep expertise in hiring.

Analyze the resume against the job description provided.
Evaluate it critically and provide section-wise improvement suggestions.
Focus on improving the resume for maximum impact and alignment with the JD.
Score each section individually on a scale of 0-100.

Resume:
{resume_text}

Job Description:
{job_description}

Return the result ONLY as valid JSON in the following format:
{{
  "jd_match": 75,
  "ats_score": 80,
  "missing_keywords": ["keyword1", "keyword2"],
  "found_keywords": ["keyword1", "keyword2"],
  "section_scores": {{
    "summary": {{ "score": 70, "suggestion": "..." }},
    "skills": {{ "score": 80, "suggestion": "..." }},
    "experience": {{ "score": 65, "suggestion": "..." }},
    "education": {{ "score": 90, "suggestion": "..." }},
    "projects": {{ "score": 75, "suggestion": "..." }}
  }},
  "profile_summary": "Overall evaluation ...",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "action_items": ["action1", "action2", "action3"],
  "keyword_density": 0.15,
  "readability_score": 85,
  "formatting_feedback": "Feedback about resume formatting...",
  "recommended_roles": ["role1", "role2", "role3"]
}}
"""

# Section extraction patterns
RESUME_SECTIONS = [
    "summary", "objective", "skills", "experience", "work experience",
    "education", "projects", "certifications", "achievements",
    "awards", "publications", "references", "languages", "interests",
    "volunteer", "hobbies", "professional summary", "technical skills",
]
