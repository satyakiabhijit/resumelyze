"""
Resumelyze ML Server — Configuration
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "trained_models"
DATA_DIR = BASE_DIR / "training_data"

# Sentence-Transformer model (proven 95%+ accuracy on STS benchmarks)
SBERT_MODEL_NAME = "all-MiniLM-L6-v2"

# spaCy model
SPACY_MODEL = "en_core_web_sm"

# Server
HOST = os.getenv("ML_HOST", "127.0.0.1")
PORT = int(os.getenv("ML_PORT", "8100"))

# Scoring weights
WEIGHTS = {
    "semantic_similarity": 0.40,
    "keyword_overlap": 0.30,
    "section_quality": 0.15,
    "formatting": 0.15,
}

# Section mapping
SECTION_ALIASES = {
    "summary": ["summary", "professional summary", "objective", "career objective", "profile", "about"],
    "skills": ["skills", "technical skills", "core competencies", "technologies", "tools"],
    "experience": ["experience", "work experience", "professional experience", "employment", "work history"],
    "education": ["education", "academic background", "qualifications"],
    "projects": ["projects", "project", "personal projects", "key projects"],
    "certifications": ["certifications", "certification", "licenses", "credentials"],
}

# Grade thresholds
GRADE_MAP = [
    (95, "A+"), (90, "A"), (85, "A-"),
    (80, "B+"), (75, "B"), (70, "B-"),
    (65, "C+"), (60, "C"), (55, "C-"),
    (50, "D+"), (45, "D"), (0, "F"),
]
