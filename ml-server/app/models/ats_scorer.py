"""
ATS Score Model — trained GradientBoosting classifier for ATS compatibility scoring.

Features extracted:
  - Contact info presence (email, phone, linkedin, github)
  - Number of sections detected
  - Standard section header usage
  - Keyword density against JD
  - Bullet point usage
  - Quantification usage (numbers/metrics)
  - Resume length appropriateness
  - Formatting heuristics
"""

from __future__ import annotations
import re
import numpy as np
from typing import Dict, List, Optional
from pathlib import Path
import joblib

from app.config import MODELS_DIR, SECTION_ALIASES
from app.models.nlp_engine import (
    detect_sections,
    detect_contact_info,
    count_bullet_points,
    extract_keywords,
    compute_keyword_overlap,
    tokenize,
)

_ats_model = None
_ats_scaler = None


def _load_ats_model():
    """Load trained ATS model or return None if not trained yet."""
    global _ats_model, _ats_scaler
    model_path = MODELS_DIR / "ats_model.joblib"
    scaler_path = MODELS_DIR / "ats_scaler.joblib"
    if model_path.exists() and scaler_path.exists():
        _ats_model = joblib.load(model_path)
        _ats_scaler = joblib.load(scaler_path)
        print("[ML] ATS model loaded ✓")
    else:
        print("[ML] ATS model not found — using rule-based fallback")


def extract_ats_features(
    resume_text: str,
    job_description: str,
    sections: Optional[Dict[str, str]] = None,
) -> np.ndarray:
    """
    Extract a feature vector for ATS scoring.
    Returns a 1D array of 20 features.
    """
    if sections is None:
        sections = detect_sections(resume_text)

    contact = detect_contact_info(resume_text)
    jd_keywords = extract_keywords(job_description, 40)
    _, _, kw_density = compute_keyword_overlap(resume_text, jd_keywords)

    words = tokenize(resume_text)
    word_count = len(words)
    bullets = count_bullet_points(resume_text)
    lines = resume_text.strip().split("\n")
    non_empty_lines = [l for l in lines if l.strip()]

    # Count standard sections present
    standard_sections = {"summary", "skills", "experience", "education", "projects"}
    sections_found = set(sections.keys()) - {"header"}
    standard_found = sections_found & standard_sections
    extra_sections = sections_found - standard_sections

    # Quantification: count numbers/percentages in experience section
    exp_text = sections.get("experience", "")
    numbers_in_exp = len(re.findall(r"\b\d+[%+]?\b", exp_text))
    dollar_amounts = len(re.findall(r"\$[\d,]+", exp_text))

    # Check for common ATS-unfriendly patterns
    has_tables = bool(re.search(r"\t.*\t.*\t", resume_text))
    has_images_refs = bool(re.search(r"\.(png|jpg|jpeg|gif|svg|bmp)\b", resume_text, re.I))
    excess_special_chars = len(re.findall(r"[^\w\s.,:;!?\-()/@#$%&*+='\"{}[\]<>]", resume_text))

    features = np.array([
        float(contact["has_email"]),           # 0
        float(contact["has_phone"]),           # 1
        float(contact["has_linkedin"]),        # 2
        float(contact["has_github"]),          # 3
        len(standard_found),                   # 4: standard sections count (0-5)
        len(extra_sections),                   # 5: extra sections
        kw_density,                            # 6: keyword overlap density (0-1)
        min(word_count / 100, 10),             # 7: word count (scaled, 0-10)
        min(bullets / 5, 10),                  # 8: bullet points (scaled, 0-10)
        min(numbers_in_exp / 3, 10),           # 9: quantification (scaled, 0-10)
        min(dollar_amounts / 2, 5),            # 10: dollar figures (scaled, 0-5)
        min(len(non_empty_lines) / 10, 10),    # 11: line density (0-10)
        float(not has_tables),                 # 12: no tables (good)
        float(not has_images_refs),            # 13: no images (good)
        min(excess_special_chars / 50, 5),     # 14: special chars (lower is better)
        float("summary" in sections),          # 15: has summary section
        float("skills" in sections),           # 16: has skills section
        float("experience" in sections),       # 17: has experience section
        float("education" in sections),        # 18: has education section
        float("projects" in sections),         # 19: has projects section
    ], dtype=np.float32)

    return features


def compute_ats_score(
    resume_text: str,
    job_description: str,
    sections: Optional[Dict[str, str]] = None,
    keyword_density: float = 0.0,
) -> Dict:
    """
    Compute ATS compatibility score using trained model or rule-based fallback.

    Returns dict with: overall_score, has_email, has_phone, has_linkedin,
    has_clean_formatting, section_headings_valid, keyword_density, issues, recommendations.
    """
    if sections is None:
        sections = detect_sections(resume_text)

    features = extract_ats_features(resume_text, job_description, sections)
    contact = detect_contact_info(resume_text)

    # Try ML model first
    if _ats_model is not None and _ats_scaler is not None:
        scaled = _ats_scaler.transform(features.reshape(1, -1))
        score = float(_ats_model.predict(scaled)[0])
        score = max(0, min(100, round(score)))
    else:
        # Rule-based scoring (still quite accurate with good features)
        score = _rule_based_ats_score(features, contact, sections, keyword_density)

    # Build detailed feedback
    issues = []
    recommendations = []

    if not contact["has_email"]:
        issues.append("Missing email address")
        recommendations.append("Add a professional email address at the top")
    if not contact["has_phone"]:
        issues.append("Missing phone number")
        recommendations.append("Include your phone number for recruiter contact")
    if not contact["has_linkedin"]:
        recommendations.append("Add your LinkedIn profile URL")

    standard_sections = {"summary", "skills", "experience", "education"}
    missing_std = standard_sections - set(sections.keys())
    if missing_std:
        issues.append(f"Missing standard sections: {', '.join(missing_std)}")
        recommendations.append(f"Add these sections: {', '.join(missing_std)}")

    if keyword_density < 0.3:
        issues.append("Low keyword alignment with job description")
        recommendations.append("Incorporate more keywords from the job description")

    bullets = count_bullet_points(resume_text)
    if bullets < 5:
        recommendations.append("Use more bullet points to improve ATS readability")

    words = tokenize(resume_text)
    if len(words) < 200:
        issues.append("Resume may be too short")
        recommendations.append("Expand your experience and skills sections")
    elif len(words) > 1200:
        recommendations.append("Consider condensing — most ATS prefer 1-2 pages")

    section_headings_valid = len(missing_std) == 0

    return {
        "overall_score": score,
        "has_email": contact["has_email"],
        "has_phone": contact["has_phone"],
        "has_linkedin": contact["has_linkedin"],
        "has_clean_formatting": features[12] > 0 and features[13] > 0,
        "section_headings_valid": section_headings_valid,
        "keyword_density": round(keyword_density, 3),
        "issues": issues,
        "recommendations": recommendations,
    }


def _rule_based_ats_score(
    features: np.ndarray,
    contact: Dict[str, bool],
    sections: Dict[str, str],
    keyword_density: float,
) -> int:
    """High-quality rule-based ATS scoring as fallback."""
    score = 0.0

    # Contact info (max 20 pts)
    score += features[0] * 8   # email
    score += features[1] * 6   # phone
    score += features[2] * 4   # linkedin
    score += features[3] * 2   # github

    # Standard sections (max 25 pts)
    score += features[4] * 5  # 5 pts per standard section

    # Keyword density (max 25 pts)
    score += min(keyword_density, 1.0) * 25

    # Quantification (max 10 pts)
    score += min(features[9] * 2, 10)

    # Bullet points (max 10 pts)
    score += min(features[8] * 2, 10)

    # Clean formatting (max 5 pts)
    score += features[12] * 2.5  # no tables
    score += features[13] * 2.5  # no images

    # Length appropriateness (max 5 pts)
    word_scaled = features[7]  # 0–10 scale
    if 3 <= word_scaled <= 8:
        score += 5
    elif 2 <= word_scaled <= 10:
        score += 3
    else:
        score += 1

    return max(0, min(100, round(score)))
