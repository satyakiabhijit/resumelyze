"""
Content Improvement Engine — suggests concrete improvements for resume bullets.

Uses NLP analysis to identify weak bullets and generate improved versions with:
- Stronger action verbs
- Added quantification
- Better alignment with JD keywords
"""

from __future__ import annotations
import re
from typing import List, Dict
from app.models.verb_analyzer import WEAK_VERBS, STRONG_VERBS
from app.models.nlp_engine import extract_keywords


def generate_content_improvements(
    resume_text: str,
    job_description: str,
    max_improvements: int = 5,
) -> List[Dict[str, str]]:
    """
    Generate content improvement suggestions for weak resume bullets.

    Returns list of:
        {"original": str, "improved": str, "reason": str}
    """
    lines = resume_text.strip().split("\n")
    jd_keywords = extract_keywords(job_description, 20)
    improvements = []

    for line in lines:
        if len(improvements) >= max_improvements:
            break

        stripped = line.strip()
        # Skip short lines, headers, contact info
        if len(stripped) < 20 or _is_header(stripped):
            continue

        # Clean bullet marker
        clean = re.sub(r"^[•\-\*\u2022\d.)]+\s*", "", stripped).strip()
        if len(clean) < 15:
            continue

        improvement = _try_improve(clean, jd_keywords)
        if improvement:
            improvements.append(improvement)

    return improvements


def _try_improve(original: str, jd_keywords: List[str]) -> Dict[str, str] | None:
    """Try to improve a single bullet point. Returns None if already good."""
    issues = []
    improved = original

    words = original.lower().split()
    if not words:
        return None

    # 1. Check for weak verbs
    first_word = words[0]
    first_two = " ".join(words[:2]) if len(words) >= 2 else ""
    first_three = " ".join(words[:3]) if len(words) >= 3 else ""

    weak_match = None
    for phrase in [first_three, first_two, first_word]:
        if phrase in WEAK_VERBS:
            weak_match = phrase
            break

    if weak_match:
        replacement = WEAK_VERBS[weak_match][0].capitalize()
        # Replace the weak verb at the beginning
        pattern = re.compile(r"^" + re.escape(weak_match), re.I)
        improved = pattern.sub(replacement, improved, count=1)
        issues.append("upgraded to a stronger action verb")

    # 2. Check for missing quantification
    has_number = bool(re.search(r"\d", original))
    if not has_number:
        # Add a placeholder hint for quantification
        improved = improved.rstrip(".")
        if "team" in original.lower():
            improved += ", impacting a team of [X] members"
            issues.append("added team size quantification")
        elif any(w in original.lower() for w in ["project", "feature", "system", "application"]):
            improved += ", resulting in [X]% improvement in [metric]"
            issues.append("added measurable impact")
        elif any(w in original.lower() for w in ["process", "workflow", "efficiency"]):
            improved += ", reducing [time/cost] by [X]%"
            issues.append("added efficiency metric")
        elif any(w in original.lower() for w in ["revenue", "sales", "growth", "customer"]):
            improved += ", generating $[X] in additional [revenue/savings]"
            issues.append("added financial impact")
        else:
            improved += ", achieving [X]% [relevant metric]"
            issues.append("added quantification placeholder")

    # 3. Check for JD keyword alignment
    original_lower = original.lower()
    missing_kws = [kw for kw in jd_keywords[:5] if kw not in original_lower]
    if missing_kws and len(missing_kws) <= 3:
        # Suggest incorporating a relevant JD keyword
        issues.append(f"consider incorporating: {', '.join(missing_kws[:2])}")

    if not issues:
        return None

    # Only return if the improvement is meaningfully different
    if improved == original and len(issues) <= 1:
        return None

    reason = "; ".join(issues).capitalize()
    return {
        "original": original,
        "improved": improved,
        "reason": reason,
    }


def _is_header(text: str) -> bool:
    """Check if line is a section header."""
    text = text.strip()
    if len(text) > 60:
        return False
    if text.isupper():
        return True
    headers = {
        "summary", "skills", "experience", "education", "projects",
        "certifications", "achievements", "objective", "profile",
    }
    return text.lower().rstrip(":") in headers
