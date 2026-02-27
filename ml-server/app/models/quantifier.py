"""
Quantification Analyzer — checks for metrics, numbers, and data in resume bullets.

Resumes with quantified achievements rank significantly higher in ATS
and are 40% more likely to get interviews (according to hiring studies).
"""

from __future__ import annotations
import re
from typing import Dict, List

# Patterns that indicate quantification
METRIC_PATTERNS = [
    re.compile(r"\b\d+[%]\b"),                          # percentages: 25%
    re.compile(r"\$[\d,]+(?:\.\d+)?(?:\s*[KMBkmb])?\b"),  # dollar amounts: $50K, $1.2M
    re.compile(r"\b\d+(?:\.\d+)?x\b", re.I),            # multipliers: 3x, 2.5x
    re.compile(r"\b\d+\+?\s*(?:users?|customers?|clients?|employees?|people|engineers?|developers?|members?)\b", re.I),
    re.compile(r"\b\d+\+?\s*(?:projects?|applications?|features?|products?|services?|systems?)\b", re.I),
    re.compile(r"\b\d+\+?\s*(?:years?|months?|weeks?|days?|hours?)\b", re.I),
    re.compile(r"\b(?:increased|decreased|reduced|improved|grew|boosted|cut|saved|generated)\s+(?:by\s+)?\d+", re.I),
    re.compile(r"\b\d{1,3}(?:,\d{3})+\b"),              # large numbers: 1,000,000
    re.compile(r"\b(?:top|bottom)\s+\d+[%]?\b", re.I),  # rankings: top 5%
    re.compile(r"\b\d+\s*(?:to|[-–])\s*\d+\b"),         # ranges: 5-10
]

# Patterns for bullet points
BULLET_LINE = re.compile(r"^[\s]*[•\-\*\u2022\u25CF\u25CB\d.)]+\s*(.+)", re.M)


def analyze_quantification(resume_text: str) -> Dict:
    """
    Analyze quantification usage in the resume.

    Returns:
        {
            "score": int (0-100),
            "quantified_bullets": int,
            "total_bullets": int,
            "suggestions": [str],
            "examples_found": [str],   # sample quantified bullet excerpts
        }
    """
    lines = resume_text.strip().split("\n")

    # Find all bullet-point lines
    bullet_lines = []
    for line in lines:
        stripped = line.strip()
        if re.match(r"^[•\-\*\u2022\d.)]+\s+\S", stripped):
            bullet_lines.append(stripped)
        elif len(stripped) > 20 and not _is_header_line(stripped):
            # Count substantial non-header lines as content
            bullet_lines.append(stripped)

    total_bullets = len(bullet_lines)
    quantified_bullets = 0
    examples_found = []
    unquantified_examples = []

    for bullet in bullet_lines:
        has_metric = False
        for pattern in METRIC_PATTERNS:
            if pattern.search(bullet):
                has_metric = True
                break

        if has_metric:
            quantified_bullets += 1
            if len(examples_found) < 3:
                examples_found.append(bullet[:120])
        else:
            if len(unquantified_examples) < 3:
                unquantified_examples.append(bullet[:120])

    # Score
    if total_bullets == 0:
        score = 20
    else:
        ratio = quantified_bullets / total_bullets
        # Target: at least 50% of bullets should be quantified
        score = round(min(100, ratio * 150 + 10))

    # Suggestions
    suggestions = []
    if quantified_bullets == 0:
        suggestions.append(
            "Add numbers and metrics to your achievements — quantified bullets "
            "are 40% more likely to catch a recruiter's attention"
        )
    elif quantified_bullets < total_bullets * 0.3:
        suggestions.append(
            "Try to quantify at least 50% of your bullet points with "
            "specific numbers, percentages, or dollar amounts"
        )

    for bullet in unquantified_examples[:2]:
        clean = re.sub(r"^[•\-\*\u2022\d.)]+\s*", "", bullet).strip()
        if len(clean) > 15:
            suggestions.append(
                f"Add metrics to: \"{clean[:80]}...\" — "
                f"How many? How much? What % improvement?"
            )

    if total_bullets > 0 and quantified_bullets / total_bullets >= 0.5:
        suggestions.append("Great job quantifying your achievements! Keep it up.")

    return {
        "score": max(0, min(100, score)),
        "quantified_bullets": quantified_bullets,
        "total_bullets": total_bullets,
        "suggestions": suggestions[:5],
    }


def _is_header_line(text: str) -> bool:
    """Check if a line looks like a section header."""
    text = text.strip()
    if len(text) > 50:
        return False
    if text.isupper() and len(text) < 40:
        return True
    header_words = {
        "summary", "skills", "experience", "education", "projects",
        "certifications", "achievements", "awards", "objective",
        "profile", "qualifications", "references", "interests",
    }
    return text.lower().rstrip(":") in header_words
