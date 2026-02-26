"""
Action Verb Analyzer — evaluates the strength of verbs used in resume bullets.

Categorizes verbs as weak or strong, provides replacement suggestions,
and scores overall verb usage quality.
"""

from __future__ import annotations
import re
from typing import List, Dict, Set, Tuple

# ── Weak verbs that should be replaced ──
WEAK_VERBS: Dict[str, List[str]] = {
    "managed": ["orchestrated", "directed", "spearheaded", "oversaw"],
    "helped": ["facilitated", "enabled", "contributed to", "supported"],
    "worked": ["collaborated", "partnered", "executed", "delivered"],
    "worked on": ["developed", "built", "engineered", "crafted"],
    "did": ["executed", "accomplished", "completed", "delivered"],
    "made": ["created", "produced", "constructed", "developed"],
    "used": ["leveraged", "utilized", "applied", "employed"],
    "got": ["secured", "obtained", "acquired", "earned"],
    "was responsible for": ["led", "owned", "drove", "managed"],
    "was in charge of": ["directed", "led", "supervised", "headed"],
    "handled": ["managed", "processed", "coordinated", "oversaw"],
    "showed": ["demonstrated", "illustrated", "presented", "proved"],
    "tried": ["pursued", "attempted", "explored", "investigated"],
    "ran": ["administered", "operated", "directed", "managed"],
    "looked at": ["analyzed", "evaluated", "assessed", "reviewed"],
    "checked": ["audited", "verified", "validated", "inspected"],
    "set up": ["established", "configured", "launched", "initialized"],
    "put together": ["assembled", "compiled", "organized", "composed"],
    "came up with": ["devised", "formulated", "conceived", "designed"],
    "went through": ["reviewed", "analyzed", "processed", "examined"],
    "took care of": ["managed", "administered", "maintained", "handled"],
    "talked to": ["consulted", "engaged", "communicated with", "advised"],
    "changed": ["transformed", "revamped", "modified", "restructured"],
    "fixed": ["resolved", "remediated", "corrected", "repaired"],
    "started": ["initiated", "launched", "pioneered", "established"],
    "ended": ["concluded", "finalized", "completed", "terminated"],
    "improved": ["enhanced", "elevated", "refined", "advanced"],
    "increased": ["amplified", "boosted", "expanded", "accelerated"],
    "decreased": ["reduced", "minimized", "curtailed", "lowered"],
    "assisted": ["supported", "aided", "facilitated", "contributed"],
    "participated": ["contributed", "engaged in", "played a key role in"],
    "communicated": ["presented", "articulated", "conveyed", "briefed"],
    "learned": ["mastered", "acquired expertise in", "developed proficiency in"],
}

# ── Strong verbs (comprehensive set) ──
STRONG_VERBS: Set[str] = {
    "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
    "advanced", "advocated", "amplified", "analyzed", "appointed", "approved",
    "architected", "assembled", "assessed", "attained", "audited", "authored",
    "automated", "balanced", "boosted", "budgeted", "built", "calculated",
    "captured", "centralized", "championed", "clarified", "coached", "collaborated",
    "compiled", "composed", "conceptualized", "conducted", "configured", "consolidated",
    "constructed", "consulted", "converted", "coordinated", "crafted", "cultivated",
    "customized", "debugged", "decentralized", "decreased", "defined", "delegated",
    "delivered", "deployed", "designed", "devised", "diagnosed", "digitized",
    "directed", "discovered", "documented", "doubled", "drove", "earned",
    "edited", "educated", "elevated", "eliminated", "empowered", "enabled",
    "encouraged", "engineered", "enhanced", "established", "evaluated", "examined",
    "exceeded", "executed", "expanded", "expedited", "experimented", "fabricated",
    "facilitated", "finalized", "forecasted", "formalized", "formulated", "founded",
    "generated", "governed", "grew", "guided", "halved", "headed",
    "identified", "illustrated", "implemented", "improved", "incorporated",
    "increased", "influenced", "initiated", "innovated", "inspected", "installed",
    "instituted", "integrated", "introduced", "invented", "investigated", "launched",
    "led", "leveraged", "licensed", "maintained", "mapped", "marketed",
    "maximized", "mediated", "mentored", "merged", "migrated", "minimized",
    "mobilized", "modernized", "modified", "monitored", "motivated", "navigated",
    "negotiated", "normalized", "obtained", "onboarded", "operated", "optimized",
    "orchestrated", "organized", "originated", "outperformed", "overhauled",
    "oversaw", "partnered", "piloted", "pioneered", "planned", "presented",
    "prioritized", "produced", "programmed", "projected", "promoted", "proposed",
    "prototyped", "provisioned", "published", "raised", "ranked", "reconciled",
    "redesigned", "reduced", "refactored", "refined", "reformed", "regulated",
    "remodeled", "renegotiated", "reorganized", "replaced", "reported",
    "researched", "resolved", "restructured", "revamped", "reviewed", "revitalized",
    "revolutionized", "scaled", "scheduled", "secured", "simplified", "solved",
    "spearheaded", "specified", "standardized", "steered", "streamlined",
    "strengthened", "structured", "succeeded", "supervised", "surpassed",
    "synthesized", "systematized", "targeted", "tested", "traced", "trained",
    "transitioned", "transformed", "translated", "tripled", "troubleshot",
    "uncovered", "unified", "upgraded", "validated", "visualized",
}


def analyze_action_verbs(resume_text: str) -> Dict:
    """
    Analyze action verb usage in the resume.

    Returns:
        {
            "score": int (0-100),
            "weak_verbs": [str],
            "strong_verbs": [str],
            "suggestions": [str],
        }
    """
    lines = resume_text.strip().split("\n")
    found_weak: List[str] = []
    found_strong: List[str] = []
    suggestions: List[str] = []
    seen_weak: Set[str] = set()
    seen_strong: Set[str] = set()

    for line in lines:
        # Strip bullet markers
        stripped = re.sub(r"^[\s•\-\*\u2022\d.)]+", "", line).strip()
        if not stripped:
            continue

        words = stripped.lower().split()
        if not words:
            continue

        first_word = words[0]

        # Check for weak multi-word phrases first
        first_two = " ".join(words[:2]) if len(words) >= 2 else ""
        first_three = " ".join(words[:3]) if len(words) >= 3 else ""

        matched_weak = None
        for phrase in [first_three, first_two, first_word]:
            if phrase in WEAK_VERBS:
                matched_weak = phrase
                break

        if matched_weak and matched_weak not in seen_weak:
            found_weak.append(matched_weak)
            seen_weak.add(matched_weak)
            replacements = WEAK_VERBS[matched_weak]
            suggestions.append(
                f"Replace '{matched_weak}' with '{replacements[0]}' or '{replacements[1]}'"
            )
        elif first_word in STRONG_VERBS and first_word not in seen_strong:
            found_strong.append(first_word)
            seen_strong.add(first_word)

    # Score calculation
    total_verb_lines = len(found_weak) + len(found_strong)
    if total_verb_lines == 0:
        score = 30  # No clear verb usage detected
        suggestions.append("Start bullet points with strong action verbs like 'Led', 'Architected', 'Delivered'")
    else:
        strong_ratio = len(found_strong) / total_verb_lines
        score = round(strong_ratio * 80 + 20)  # Scale 20-100

    if len(found_strong) == 0 and len(found_weak) > 0:
        suggestions.append("Try to start every bullet point with a strong action verb")

    return {
        "score": max(0, min(100, score)),
        "weak_verbs": found_weak[:10],
        "strong_verbs": found_strong[:10],
        "suggestions": suggestions[:6],
    }
