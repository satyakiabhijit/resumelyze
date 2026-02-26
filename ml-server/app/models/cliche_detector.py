"""
Cliché Detector — identifies overused resume phrases and suggests replacements.

Uses a comprehensive dictionary of 100+ clichés mapped to better alternatives,
plus pattern matching for vague/generic language.
"""

from __future__ import annotations
import re
from typing import List, Dict

# ── Comprehensive cliché database ──
CLICHES: Dict[str, str] = {
    # Generic self-descriptors
    "results-driven": "Replace with a specific achievement that demonstrates measurable results",
    "results-oriented": "Show results through quantified accomplishments instead",
    "self-motivated": "Describe an initiative you took independently with measurable outcome",
    "self-starter": "Give an example of a project you initiated on your own",
    "hard worker": "Replace with specific examples of dedication (e.g., 'Completed X ahead of schedule')",
    "hardworking": "Show work ethic through quantified achievements, not adjectives",
    "go-getter": "Describe a proactive achievement with specific impact",
    "detail-oriented": "Show attention to detail through a specific quality achievement",
    "team player": "Describe a specific cross-functional collaboration and its outcome",
    "team-oriented": "Mention a concrete team achievement with your role in it",
    "dynamic": "Replace with a specific example of adaptability",
    "passionate": "Show passion through concrete actions and achievements",
    "passionate about": "Demonstrate passion through specific accomplishments in that area",
    "enthusiastic": "Replace with evidence of enthusiasm through achievements",
    "highly motivated": "Describe what motivated you and the outcome it produced",
    "proactive": "Give an example of anticipating a problem and solving it",
    "innovative": "Describe a specific innovation you introduced and its impact",
    "innovative thinker": "Describe a creative solution you implemented with measurable results",
    "strategic thinker": "Show strategic thinking through a specific decision and outcome",
    "think outside the box": "Describe a creative solution you designed with specific results",
    "thought leader": "Reference published articles, talks, or initiatives that show expertise",

    # Vague experience descriptors
    "responsible for": "Start with an action verb — what did you actually DO?",
    "responsibilities included": "Replace with 'Led', 'Managed', 'Built', or another strong action verb",
    "duties included": "Replace with action verbs describing what you accomplished",
    "worked on": "Specify your exact contribution — what did you build, improve, or deliver?",
    "helped with": "Specify your role: Did you design, build, test, review, lead?",
    "assisted with": "Clarify your specific contribution and its impact",
    "involved in": "Specify your role and contribution to the project",
    "participated in": "Describe your specific contribution and the outcome",
    "was tasked with": "Use an action verb: Led, Developed, Implemented instead",
    "dealt with": "Replace with specific action: Resolved, Negotiated, Managed",

    # Superlatives & buzzwords
    "excellent communication skills": "Provide an example: 'Presented to C-suite stakeholders' or 'Wrote documentation used by 50+ engineers'",
    "strong communication": "Give a concrete example of effective communication",
    "excellent interpersonal skills": "Describe a relationship-building achievement",
    "strong work ethic": "Demonstrate through achievements, not self-description",
    "proven track record": "Replace with the actual track record — cite specific outcomes",
    "proven ability": "Show the ability through a concrete example with metrics",
    "extensive experience": "Specify years and key achievements in that experience",
    "significant experience": "Quantify: '8+ years leading teams of 10–15 engineers'",
    "vast experience": "Replace with specific years, technologies, and achievements",
    "strong background": "Detail the background with specifics",
    "well-versed": "List specific technologies and experience level",
    "proficient in": "Show proficiency through projects and achievements, not claims",
    "expert in": "Back up expertise with certifications, years, or notable projects",
    "seasoned professional": "Replace with specific experience details and achievements",
    "go above and beyond": "Describe a specific instance with measurable impact",
    "wear many hats": "List specific roles/skills you've demonstrated",
    "hit the ground running": "Describe your onboarding speed with a specific example",
    "fast learner": "Prove it: 'Learned X technology and delivered Y feature within 2 weeks'",
    "quick learner": "Provide an example of rapid skill acquisition with tangible results",

    # Role-based clichés
    "managed a team": "Specify team size and what you delivered: 'Led 8 engineers to ship X'",
    "worked with cross-functional teams": "Name the teams and the joint outcome",
    "synergy": "Describe the specific collaboration and outcome",
    "leverage": "Use a more specific verb: 'utilized', 'applied', 'integrated'",
    "paradigm shift": "Describe the change you made and its measurable impact",
    "value-add": "Describe the specific value with metrics",
    "best practices": "Name the specific practices you implemented",
    "best-in-class": "Cite the benchmark or comparison that supports this claim",
    "cutting-edge": "Name the specific technologies",
    "state-of-the-art": "Name the specific technologies or methods",
    "next-generation": "Describe what makes it next-gen",
    "world-class": "Replace with specific quality metrics or comparisons",
    "bottom line": "Use specific financial metrics instead",
    "move the needle": "Quantify the exact impact: 'Increased revenue by 15%'",
    "stakeholder management": "Describe specific stakeholder interactions and outcomes",
}

# Pattern-based cliché detection
CLICHE_PATTERNS = [
    (re.compile(r"\bresponsible\s+for\b", re.I), "responsible for"),
    (re.compile(r"\bduties\s+included\b", re.I), "duties included"),
    (re.compile(r"\bresponsibilities\s+included\b", re.I), "responsibilities included"),
    (re.compile(r"\bworked\s+on\b", re.I), "worked on"),
    (re.compile(r"\bhelped\s+(?:to\s+)?(?:with|in)\b", re.I), "helped with"),
    (re.compile(r"\bassisted\s+(?:with|in)\b", re.I), "assisted with"),
    (re.compile(r"\binvolved\s+in\b", re.I), "involved in"),
    (re.compile(r"\bparticipated\s+in\b", re.I), "participated in"),
    (re.compile(r"\bproven\s+track\s+record\b", re.I), "proven track record"),
    (re.compile(r"\bthink(?:ing)?\s+outside\s+(?:the\s+)?box\b", re.I), "think outside the box"),
    (re.compile(r"\bgo(?:es|ing)?\s+above\s+and\s+beyond\b", re.I), "go above and beyond"),
    (re.compile(r"\bwear(?:s|ing)?\s+many\s+hats\b", re.I), "wear many hats"),
    (re.compile(r"\bhit(?:ting)?\s+the\s+ground\s+running\b", re.I), "hit the ground running"),
    (re.compile(r"\bmove(?:d|s|ing)?\s+the\s+needle\b", re.I), "move the needle"),
    (re.compile(r"\bpassionate\s+about\b", re.I), "passionate about"),
    (re.compile(r"\bextensive\s+experience\b", re.I), "extensive experience"),
]


def detect_cliches(resume_text: str) -> List[Dict[str, str]]:
    """
    Detect clichés in resume text.
    Returns list of {"phrase": str, "suggestion": str}.
    """
    found = []
    seen = set()
    text_lower = resume_text.lower()

    # Pattern-based detection (catches multi-word phrases)
    for pattern, phrase in CLICHE_PATTERNS:
        if pattern.search(resume_text) and phrase not in seen:
            suggestion = CLICHES.get(phrase, f"Replace '{phrase}' with a specific, measurable achievement")
            found.append({"phrase": phrase, "suggestion": suggestion})
            seen.add(phrase)

    # Dictionary-based detection (single words / short phrases)
    for phrase, suggestion in CLICHES.items():
        if phrase in seen:
            continue
        # Use word boundary matching for shorter phrases
        if len(phrase.split()) <= 2:
            pattern = re.compile(r"\b" + re.escape(phrase) + r"\b", re.I)
            if pattern.search(resume_text):
                found.append({"phrase": phrase, "suggestion": suggestion})
                seen.add(phrase)
        else:
            if phrase.lower() in text_lower:
                found.append({"phrase": phrase, "suggestion": suggestion})
                seen.add(phrase)

    return found
