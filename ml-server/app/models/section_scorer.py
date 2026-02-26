"""
Section Scorer — ML-enhanced section quality evaluation.

For each resume section (summary, skills, experience, education, projects),
computes a quality score (0–100) and actionable suggestion.

Uses:
  - Semantic similarity of section ↔ JD (from Sentence-BERT)
  - Section-specific heuristics (length, bullet points, quantification, verbs)
  - Trained regression model (when available)
"""

from __future__ import annotations
import re
import numpy as np
from typing import Dict, Optional, Tuple
from pathlib import Path
import joblib

from app.config import MODELS_DIR
from app.models.nlp_engine import (
    tokenize,
    count_bullet_points,
    extract_keywords,
    compute_keyword_overlap,
)
from app.models.semantic import compute_semantic_similarity

_section_model = None
_section_scaler = None


def _load_section_model():
    global _section_model, _section_scaler
    model_path = MODELS_DIR / "section_model.joblib"
    scaler_path = MODELS_DIR / "section_scaler.joblib"
    if model_path.exists() and scaler_path.exists():
        _section_model = joblib.load(model_path)
        _section_scaler = joblib.load(scaler_path)
        print("[ML] Section scorer loaded ✓")


def extract_section_features(
    section_text: str,
    jd_text: str,
    section_name: str,
    semantic_sim: float = -1.0,
) -> np.ndarray:
    """
    Extract features for a single section.
    Returns 12-dimensional feature vector.
    """
    words = tokenize(section_text) if section_text else []
    word_count = len(words)

    # Keyword overlap
    jd_kws = extract_keywords(jd_text, 30)
    _, _, kw_density = compute_keyword_overlap(section_text, jd_kws)

    # Bullet points
    bullets = count_bullet_points(section_text) if section_text else 0

    # Numbers / metrics
    numbers = len(re.findall(r"\b\d+[%+,.]?\d*\b", section_text)) if section_text else 0

    # Action verbs at start of bullets/sentences
    action_verb_count = 0
    if section_text:
        lines = section_text.strip().split("\n")
        for line in lines:
            stripped = re.sub(r"^[\s•\-\*\u2022\d.)]+", "", line).strip()
            first_word = stripped.split()[0].lower() if stripped.split() else ""
            if first_word in STRONG_ACTION_VERBS:
                action_verb_count += 1

    # Semantic similarity (compute if not provided)
    if semantic_sim < 0:
        semantic_sim = compute_semantic_similarity(section_text, jd_text) if section_text and jd_text else 0.0

    # Section-specific optimal lengths
    optimal_lengths = {
        "summary": (50, 150),
        "skills": (30, 200),
        "experience": (100, 600),
        "education": (30, 200),
        "projects": (50, 400),
    }
    opt_min, opt_max = optimal_lengths.get(section_name, (30, 300))
    length_score = 1.0
    if word_count < opt_min:
        length_score = max(0.1, word_count / opt_min)
    elif word_count > opt_max * 1.5:
        length_score = max(0.5, opt_max / word_count)

    features = np.array([
        semantic_sim,                          # 0: semantic similarity to JD
        kw_density,                            # 1: keyword density
        min(word_count / 100, 10),             # 2: word count scaled
        min(bullets / 3, 5),                   # 3: bullet points
        min(numbers / 3, 5),                   # 4: quantification
        min(action_verb_count / 3, 5),         # 5: action verb usage
        length_score,                          # 6: length appropriateness
        float(word_count > 0),                 # 7: section exists
        float(section_name == "summary"),      # 8: is summary
        float(section_name == "skills"),       # 9: is skills
        float(section_name == "experience"),   # 10: is experience
        float(section_name == "education"),    # 11: is education
    ], dtype=np.float32)

    return features


STRONG_ACTION_VERBS = {
    "achieved", "architected", "automated", "built", "championed", "coached",
    "consolidated", "created", "decreased", "delivered", "designed", "developed",
    "directed", "drove", "eliminated", "engineered", "established", "exceeded",
    "executed", "expanded", "generated", "grew", "headed", "implemented",
    "improved", "increased", "influenced", "initiated", "innovated", "integrated",
    "introduced", "launched", "led", "leveraged", "maximized", "mentored",
    "modernized", "negotiated", "optimized", "orchestrated", "overhauled",
    "partnered", "pioneered", "produced", "propelled", "raised", "redesigned",
    "reduced", "revamped", "scaled", "secured", "simplified", "spearheaded",
    "streamlined", "strengthened", "surpassed", "transformed", "unified",
}


def score_section(
    section_text: str,
    jd_text: str,
    section_name: str,
    semantic_sim: float = -1.0,
) -> Dict:
    """
    Score a single resume section.
    Returns {"score": int, "suggestion": str}
    """
    if not section_text or len(section_text.strip()) < 10:
        return {
            "score": 15,
            "suggestion": f"Your {section_name} section is missing or too brief. "
                         f"Add detailed, relevant content aligned with the job description.",
        }

    features = extract_section_features(section_text, jd_text, section_name, semantic_sim)

    # Try ML model
    if _section_model is not None and _section_scaler is not None:
        scaled = _section_scaler.transform(features.reshape(1, -1))
        score = float(_section_model.predict(scaled)[0])
    else:
        # High-quality rule-based scoring
        score = _rule_based_section_score(features, section_name)

    score = max(5, min(100, round(score)))
    suggestion = _generate_suggestion(score, section_name, features)

    return {"score": score, "suggestion": suggestion}


def _rule_based_section_score(features: np.ndarray, section_name: str) -> float:
    """Rule-based section scoring with calibrated weights."""
    semantic_sim = features[0]
    kw_density = features[1]
    word_scaled = features[2]
    bullets = features[3]
    numbers = features[4]
    action_verbs = features[5]
    length_score = features[6]

    # Base score from semantic similarity (0–40)
    base = semantic_sim * 40

    # Keyword match (0–25)
    kw_score = kw_density * 25

    # Structure quality (0–20)
    struct_score = 0.0
    if section_name == "experience":
        struct_score = min(bullets * 2, 8) + min(numbers * 2, 6) + min(action_verbs * 2, 6)
    elif section_name == "skills":
        struct_score = min(word_scaled * 2, 10) + kw_density * 10
    elif section_name == "summary":
        struct_score = min(length_score * 10, 10) + min(action_verbs * 2, 5) + min(numbers * 2, 5)
    elif section_name == "education":
        struct_score = min(word_scaled * 3, 10) + min(numbers * 2, 5) + 5
    elif section_name == "projects":
        struct_score = min(bullets * 2, 6) + min(numbers * 2, 6) + min(action_verbs * 2, 8)
    else:
        struct_score = min(word_scaled * 2, 10) + min(length_score * 5, 10)

    # Length appropriateness (0–15)
    len_score = length_score * 15

    total = base + kw_score + struct_score + len_score
    return max(5, min(100, total))


def _generate_suggestion(score: int, section_name: str, features: np.ndarray) -> str:
    """Generate actionable suggestion based on score and features."""
    suggestions = []

    if score >= 80:
        return f"Excellent {section_name} section — well-aligned with the job description."

    if features[0] < 0.4:  # low semantic similarity
        suggestions.append(f"Tailor your {section_name} more closely to the job description language")

    if features[1] < 0.3:  # low keyword density
        suggestions.append("incorporate more relevant keywords from the JD")

    if section_name in ("experience", "projects"):
        if features[3] < 1:  # few bullets
            suggestions.append("use bullet points for each responsibility/achievement")
        if features[4] < 1:  # no numbers
            suggestions.append("quantify your achievements with specific metrics (%, $, numbers)")
        if features[5] < 1:  # weak verbs
            suggestions.append("start bullet points with strong action verbs (Led, Architected, Optimized)")

    if section_name == "summary" and features[2] < 0.5:
        suggestions.append("expand your summary to 3-4 sentences highlighting your key qualifications")

    if section_name == "skills" and features[1] < 0.4:
        suggestions.append("add technical skills mentioned in the job description")

    if features[6] < 0.5:  # length issue
        suggestions.append(f"adjust the length of your {section_name} section")

    if not suggestions:
        if score < 50:
            suggestions.append(f"significantly strengthen your {section_name} with more relevant content")
        else:
            suggestions.append(f"fine-tune your {section_name} by matching the JD's language more closely")

    prefix = "Good start, but " if score >= 50 else "Needs work — "
    return prefix + "; ".join(suggestions) + "."


def score_all_sections(
    sections: Dict[str, str],
    jd_text: str,
    section_sims: Optional[Dict[str, float]] = None,
) -> Dict[str, Dict]:
    """Score all standard resume sections."""
    standard = ["summary", "skills", "experience", "education", "projects"]
    results = {}

    for name in standard:
        text = sections.get(name, "")
        sim = section_sims.get(name, -1.0) if section_sims else -1.0
        results[name] = score_section(text, jd_text, name, sim)

    return results
