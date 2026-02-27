"""
Semantic Similarity Engine — using Sentence-BERT (all-MiniLM-L6-v2).

This model achieves 95%+ Spearman correlation on STS benchmarks.
It encodes resume sections and job descriptions into 384-dim vectors,
then computes cosine similarity for precise matching.
"""

from __future__ import annotations
import numpy as np
from functools import lru_cache
from typing import List, Dict, Tuple

_model = None


def _get_model():
    """Lazy-load sentence-transformer model (downloads ~90 MB on first run)."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        from app.config import SBERT_MODEL_NAME
        print(f"[ML] Loading Sentence-BERT model: {SBERT_MODEL_NAME} ...")
        _model = SentenceTransformer(SBERT_MODEL_NAME)
        print("[ML] Sentence-BERT loaded ✓")
    return _model


def encode_texts(texts: List[str]) -> np.ndarray:
    """Encode a list of texts into embeddings (N x 384)."""
    model = _get_model()
    return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two normalized vectors."""
    return float(np.dot(a, b))


def compute_semantic_similarity(text_a: str, text_b: str) -> float:
    """Compute semantic similarity between two texts (0–1 scale)."""
    if not text_a.strip() or not text_b.strip():
        return 0.0
    embeddings = encode_texts([text_a, text_b])
    return max(0.0, min(1.0, cosine_similarity(embeddings[0], embeddings[1])))


def compute_section_similarities(
    resume_sections: Dict[str, str],
    job_description: str,
) -> Dict[str, float]:
    """
    Compute semantic similarity of each resume section against the full JD.
    Returns dict like {"summary": 0.72, "skills": 0.85, ...}
    """
    if not resume_sections or not job_description.strip():
        return {}

    section_names = list(resume_sections.keys())
    section_texts = [resume_sections[k] for k in section_names]

    # Encode all sections + JD in one batch for efficiency
    all_texts = section_texts + [job_description]
    embeddings = encode_texts(all_texts)

    jd_embedding = embeddings[-1]
    results = {}
    for i, name in enumerate(section_names):
        sim = cosine_similarity(embeddings[i], jd_embedding)
        results[name] = max(0.0, min(1.0, sim))

    return results


def compute_keyword_semantic_matches(
    resume_text: str,
    jd_keywords: List[str],
    threshold: float = 0.55,
) -> Tuple[List[str], List[str]]:
    """
    Use semantic similarity to find which JD keywords are conceptually
    present in the resume (even if exact words differ).

    Returns (found_keywords, missing_keywords).
    """
    if not jd_keywords or not resume_text.strip():
        return [], list(jd_keywords)

    # Encode resume as a single embedding + each keyword
    all_texts = [resume_text] + jd_keywords
    embeddings = encode_texts(all_texts)
    resume_emb = embeddings[0]

    found = []
    missing = []
    for i, kw in enumerate(jd_keywords):
        sim = cosine_similarity(resume_emb, embeddings[i + 1])
        if sim >= threshold:
            found.append(kw)
        else:
            missing.append(kw)

    return found, missing


def compute_jd_match_score(
    resume_text: str,
    job_description: str,
    resume_sections: Dict[str, str],
) -> float:
    """
    Compute an overall JD match score (0–100) using:
    - Full resume ↔ JD semantic similarity (weight: 0.5)
    - Weighted section similarities (weight: 0.5)
    """
    # Full text similarity
    full_sim = compute_semantic_similarity(resume_text, job_description)

    # Section-weighted similarity
    section_weights = {
        "skills": 0.30,
        "experience": 0.30,
        "summary": 0.15,
        "projects": 0.15,
        "education": 0.10,
    }

    section_sims = compute_section_similarities(resume_sections, job_description)
    weighted_section_score = 0.0
    total_weight = 0.0

    for section, weight in section_weights.items():
        if section in section_sims:
            weighted_section_score += section_sims[section] * weight
            total_weight += weight

    if total_weight > 0:
        weighted_section_score /= total_weight
    else:
        weighted_section_score = full_sim

    # Combined score
    score = (full_sim * 0.5 + weighted_section_score * 0.5) * 100
    return max(0, min(100, round(score)))
