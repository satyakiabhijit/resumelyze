"""
NLP Engine — spaCy-based text processing for resume analysis.

Handles: tokenization, NER, POS tagging, section detection, keyword extraction.
"""

from __future__ import annotations
import re
from typing import List, Dict, Set, Tuple
from collections import Counter

_nlp = None

STOP_WORDS: Set[str] = {
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "from",
    "had", "has", "have", "he", "her", "his", "how", "i", "if", "in", "into",
    "is", "it", "its", "just", "me", "more", "my", "no", "nor", "not", "of",
    "on", "or", "our", "out", "own", "per", "she", "so", "some", "than",
    "that", "the", "their", "them", "then", "there", "these", "they", "this",
    "those", "through", "to", "too", "under", "up", "very", "was", "we",
    "were", "what", "when", "where", "which", "while", "who", "whom", "why",
    "will", "with", "would", "you", "your", "also", "can", "could", "do",
    "does", "may", "might", "shall", "should", "such", "about", "above",
    "after", "again", "all", "already", "among", "any", "because", "been",
    "before", "below", "between", "both", "did", "doing", "each", "few",
    "get", "got", "here", "new", "now", "only", "other", "over", "same",
    "still", "use", "used", "using", "well", "work", "working", "etc",
    "one", "two", "first", "last", "many", "much", "must", "need", "since",
}


def _get_nlp():
    """Lazy-load spaCy model."""
    global _nlp
    if _nlp is None:
        import spacy
        try:
            _nlp = spacy.load("en_core_web_sm", disable=["parser", "lemmatizer"])
        except OSError:
            print("[NLP] Downloading spaCy model en_core_web_sm...")
            from spacy.cli import download
            download("en_core_web_sm")
            _nlp = spacy.load("en_core_web_sm", disable=["parser", "lemmatizer"])
        print("[NLP] spaCy loaded ✓")
    return _nlp


# ── Section Detection ─────────────────────────────────────────

SECTION_PATTERNS = [
    (re.compile(r"^(?:professional\s+)?summary\b", re.I), "summary"),
    (re.compile(r"^(?:career\s+)?objective\b", re.I), "summary"),
    (re.compile(r"^(?:about\s+me|profile)\b", re.I), "summary"),
    (re.compile(r"^(?:technical\s+)?skills?\b", re.I), "skills"),
    (re.compile(r"^(?:core\s+)?competenc", re.I), "skills"),
    (re.compile(r"^technolog", re.I), "skills"),
    (re.compile(r"^(?:work\s+)?experience\b", re.I), "experience"),
    (re.compile(r"^(?:professional\s+)?experience\b", re.I), "experience"),
    (re.compile(r"^employment\b", re.I), "experience"),
    (re.compile(r"^(?:work\s+)?history\b", re.I), "experience"),
    (re.compile(r"^education\b", re.I), "education"),
    (re.compile(r"^academic\b", re.I), "education"),
    (re.compile(r"^qualifications?\b", re.I), "education"),
    (re.compile(r"^projects?\b", re.I), "projects"),
    (re.compile(r"^(?:personal|key)\s+projects?\b", re.I), "projects"),
    (re.compile(r"^certifications?\b", re.I), "certifications"),
    (re.compile(r"^(?:licenses?|credentials?)\b", re.I), "certifications"),
    (re.compile(r"^achievements?\b", re.I), "achievements"),
    (re.compile(r"^awards?\b", re.I), "achievements"),
    (re.compile(r"^languages?\b", re.I), "languages"),
    (re.compile(r"^interests?\b", re.I), "interests"),
    (re.compile(r"^hobbies?\b", re.I), "interests"),
    (re.compile(r"^volunteer", re.I), "volunteer"),
    (re.compile(r"^publications?\b", re.I), "publications"),
    (re.compile(r"^references?\b", re.I), "references"),
]


def detect_sections(text: str) -> Dict[str, str]:
    """
    Parse resume text into sections.
    Returns dict like {"summary": "...", "skills": "...", ...}
    """
    lines = text.split("\n")
    sections: Dict[str, str] = {}
    current_section = "header"
    current_lines: List[str] = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            current_lines.append("")
            continue

        matched_section = None
        # Heuristic: section headers are usually short lines (< 60 chars)
        # and often ALL CAPS or Title Case
        if len(stripped) < 60:
            for pattern, section_name in SECTION_PATTERNS:
                if pattern.search(stripped):
                    matched_section = section_name
                    break

        if matched_section:
            if current_lines:
                content = "\n".join(current_lines).strip()
                if content:
                    sections[current_section] = content
            current_section = matched_section
            current_lines = []
        else:
            current_lines.append(line)

    # Last section
    if current_lines:
        content = "\n".join(current_lines).strip()
        if content:
            sections[current_section] = content

    return sections


# ── Keyword Extraction ────────────────────────────────────────

def tokenize(text: str) -> List[str]:
    """Simple word tokenization."""
    return re.findall(r"\b[a-zA-Z][a-zA-Z+#.]{1,30}\b", text.lower())


def extract_keywords(text: str, top_n: int = 50) -> List[str]:
    """Extract top keywords using frequency analysis, filtering stop words."""
    tokens = tokenize(text)
    filtered = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
    counter = Counter(filtered)
    return [word for word, _ in counter.most_common(top_n)]


def extract_ngrams(text: str, n: int = 2, top_k: int = 30) -> List[str]:
    """Extract top n-grams."""
    tokens = tokenize(text)
    filtered = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
    ngrams: List[str] = []
    for i in range(len(filtered) - n + 1):
        ngrams.append(" ".join(filtered[i:i + n]))
    counter = Counter(ngrams)
    return [ng for ng, _ in counter.most_common(top_k)]


def extract_entities(text: str) -> Dict[str, List[str]]:
    """Extract named entities using spaCy."""
    nlp = _get_nlp()
    doc = nlp(text[:100000])  # Limit to avoid OOM
    entities: Dict[str, List[str]] = {}
    for ent in doc.ents:
        label = ent.label_
        if label not in entities:
            entities[label] = []
        if ent.text not in entities[label]:
            entities[label].append(ent.text)
    return entities


# ── Contact Info Detection ────────────────────────────────────

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
PHONE_PATTERN = re.compile(r"[+]?[\d\s\-().]{7,15}")
LINKEDIN_PATTERN = re.compile(r"linkedin\.com/in/[\w-]+", re.I)
GITHUB_PATTERN = re.compile(r"github\.com/[\w-]+", re.I)
WEBSITE_PATTERN = re.compile(r"https?://[\w.-]+\.\w+(?:/[\w./-]*)?", re.I)


def detect_contact_info(text: str) -> Dict[str, bool]:
    """Check for presence of contact information."""
    return {
        "has_email": bool(EMAIL_PATTERN.search(text)),
        "has_phone": bool(PHONE_PATTERN.search(text)),
        "has_linkedin": bool(LINKEDIN_PATTERN.search(text)),
        "has_github": bool(GITHUB_PATTERN.search(text)),
        "has_website": bool(WEBSITE_PATTERN.search(text)),
    }


# ── Bullet Point Analysis ────────────────────────────────────

BULLET_PATTERN = re.compile(r"^[\s]*[•\-\*\u2022\u25CF\u25CB\u2023\u2043►▪▸‣]\s*", re.M)
NUMBERED_PATTERN = re.compile(r"^[\s]*\d+[.)]\s+", re.M)


def count_bullet_points(text: str) -> int:
    """Count bullet points and numbered list items."""
    bullets = len(BULLET_PATTERN.findall(text))
    numbered = len(NUMBERED_PATTERN.findall(text))
    return bullets + numbered


# ── Readability ───────────────────────────────────────────────

def compute_readability(text: str) -> float:
    """
    Compute readability score (0–100).
    Based on average sentence length and word complexity.
    """
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
    words = tokenize(text)

    if not sentences or not words:
        return 50.0

    avg_sentence_len = len(words) / len(sentences)
    long_words = sum(1 for w in words if len(w) > 8)
    long_pct = long_words / len(words) if words else 0

    # Optimal: 12–20 words per sentence
    sentence_score = max(0, 100 - abs(avg_sentence_len - 16) * 4)
    word_score = max(0, 100 - long_pct * 200)
    length_score = min(100, len(words) / 3)  # Penalize very short resumes

    return min(100, round((sentence_score * 0.4 + word_score * 0.3 + length_score * 0.3)))


# ── Keyword Overlap ───────────────────────────────────────────

def compute_keyword_overlap(
    resume_text: str,
    jd_keywords: List[str],
) -> Tuple[List[str], List[str], float]:
    """
    Check which JD keywords appear in resume (exact match, case-insensitive).
    Returns (found, missing, density).
    """
    resume_lower = resume_text.lower()
    found = []
    missing = []

    for kw in jd_keywords:
        if kw.lower() in resume_lower:
            found.append(kw)
        else:
            missing.append(kw)

    density = len(found) / max(len(jd_keywords), 1)
    return found, missing, density
