"""
Resume Data Extractor — fully local NLP-based structured extraction.

Uses spaCy NER + regex patterns + section detection to extract:
  - Contact info (name, email, phone, linkedin, location)
  - Skills, Experience, Projects, Education, Certifications, Languages, Summary

Zero external API dependency — runs entirely on local models.
"""

from __future__ import annotations
import re
import uuid
from typing import Any, Dict, List, Optional

from app.models.nlp_engine import (
    detect_sections,
    extract_entities,
    EMAIL_PATTERN,
    PHONE_PATTERN,
    LINKEDIN_PATTERN,
)


# ── Contact Info Extraction ───────────────────────────────────

def _extract_email(text: str) -> str:
    m = EMAIL_PATTERN.search(text)
    return m.group(0) if m else ""


def _extract_phone(text: str) -> str:
    for m in PHONE_PATTERN.finditer(text):
        raw = m.group(0).strip()
        digits = re.sub(r"\D", "", raw)
        if 7 <= len(digits) <= 15:
            return raw
    return ""


def _extract_linkedin(text: str) -> str:
    m = LINKEDIN_PATTERN.search(text)
    if m:
        url = m.group(0)
        if not url.startswith("http"):
            url = "https://" + url
        return url
    return ""


_LOCATION_PATTERN = re.compile(
    r"""(?:
        [A-Z][a-zA-Z .'-]+,\s*[A-Z]{2}(?:\s+\d{5})?
      | [A-Z][a-zA-Z .'-]+,\s*[A-Z][a-z]{2,}
      | [A-Z][a-zA-Z .'-]+,\s*[A-Z][a-zA-Z .'-]+
    )""",
    re.VERBOSE,
)


def _extract_location(header: str) -> str:
    for m in _LOCATION_PATTERN.finditer(header):
        candidate = m.group(0).strip()
        if re.search(r"\d{4}|@|http|linkedin|github", candidate, re.I):
            continue
        if len(candidate) > 5:
            return candidate
    try:
        entities = extract_entities(header)
        gpes = entities.get("GPE", [])
        if gpes:
            return ", ".join(gpes[:2])
    except Exception:
        pass
    return ""


_TITLE_KEYWORDS = [
    "developer", "engineer", "manager", "analyst", "designer",
    "architect", "consultant", "specialist", "intern", "lead",
    "director", "scientist", "coordinator", "officer", "student",
    "professional", "freelance", "full stack", "front end",
    "back end", "full-stack", "front-end", "back-end", "devops",
    "administrator", "technician", "researcher", "professor",
]


def _extract_name(header: str) -> str:
    """Extract candidate name from the header section."""
    first_lines = [l.strip() for l in header.split("\n") if l.strip()][:4]
    for line in first_lines:
        if len(line) > 50:
            continue
        if re.search(r"@|http|linkedin|github|\d{5,}|[+]?\d[\d\s\-()]{6,}", line, re.I):
            continue
        if any(kw in line.lower() for kw in _TITLE_KEYWORDS):
            continue
        words = line.split()
        if 2 <= len(words) <= 5 and all(w[0].isupper() for w in words if w.isalpha()):
            return line

    try:
        entities = extract_entities(header[:500])
        persons = entities.get("PERSON", [])
        if persons:
            for p in persons:
                if len(p.split()) >= 2:
                    return p
            return persons[0]
    except Exception:
        pass
    return ""


def _extract_headline(header: str, experience_section: str) -> str:
    """Derive a professional headline from header or most recent role."""
    lines = header.split("\n")
    for line in lines[1:5]:
        line = line.strip()
        if not line or len(line) > 80:
            continue
        if re.search(r"@|http|linkedin|github|\d{5,}", line, re.I):
            continue
        if re.match(r"^[+\d\s\-()]+$", line):
            continue
        if _LOCATION_PATTERN.match(line):
            continue
        words = line.split()
        if 2 <= len(words) <= 10:
            return line

    if experience_section:
        for line in experience_section.split("\n")[:5]:
            line = line.strip()
            if line and len(line) < 60 and not re.search(r"\d{4}", line):
                return line
    return ""


# ── Skills Extraction ─────────────────────────────────────────

_KNOWN_SKILLS = {
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "ruby",
    "go", "golang", "rust", "swift", "kotlin", "php", "scala", "perl",
    "r", "matlab", "dart", "lua", "haskell", "elixir", "clojure", "groovy",
    "objective-c", "assembly", "fortran", "visual basic", "vba",
    "html", "css", "sass", "scss", "less", "tailwind", "tailwindcss",
    "bootstrap", "react", "react.js", "reactjs", "angular", "angularjs",
    "vue", "vue.js", "vuejs", "svelte", "next.js", "nextjs", "nuxt.js",
    "gatsby", "jquery", "webpack", "vite", "babel", "redux", "zustand",
    "material ui", "material-ui", "chakra ui", "ant design", "shadcn",
    "node.js", "nodejs", "express", "express.js", "fastapi", "django",
    "flask", "spring", "spring boot", "rails", "ruby on rails", "laravel",
    "asp.net", ".net", "nestjs", "gin", "fiber", "actix",
    "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite",
    "oracle", "dynamodb", "cassandra", "couchdb", "neo4j", "elasticsearch",
    "mariadb", "firebase", "supabase", "firestore", "cockroachdb",
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd", "cicd",
    "nginx", "apache", "linux", "unix", "bash", "shell", "powershell",
    "heroku", "vercel", "netlify", "cloudflare",
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
    "jupyter", "spark", "hadoop", "airflow", "kafka", "data engineering",
    "data science", "data analysis", "data visualization", "tableau",
    "power bi", "looker", "snowflake", "databricks", "dbt",
    "llm", "langchain", "openai", "hugging face", "transformers",
    "react native", "flutter", "android", "ios", "swiftui", "jetpack compose",
    "ionic", "xamarin",
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "slack",
    "figma", "sketch", "adobe xd", "photoshop", "illustrator",
    "postman", "swagger", "graphql", "rest api", "restful", "grpc",
    "websocket", "oauth", "jwt",
    "jest", "mocha", "chai", "cypress", "selenium", "playwright",
    "pytest", "unittest", "junit", "testng", "rspec",
    "leadership", "communication", "teamwork", "problem solving",
    "problem-solving", "critical thinking", "project management",
    "agile", "scrum", "kanban", "time management", "mentoring",
}


def _extract_skills(skills_section: str, full_text: str) -> List[str]:
    found: List[str] = []

    if skills_section:
        for line in skills_section.split("\n"):
            line = line.strip()
            if not line:
                continue
            line = re.sub(r"^[A-Za-z\s&/]+:\s*", "", line)
            for chunk in re.split(r"[,;|•·\t]+", line):
                s = chunk.strip().strip("-").strip("*").strip()
                if 1 < len(s) < 50:
                    found.append(s)

    text_lower = full_text.lower()
    found_lower = {s.lower() for s in found}
    for skill in _KNOWN_SKILLS:
        if skill not in found_lower:
            # Always use word-boundary match to avoid false positives
            if re.search(r"\b" + re.escape(skill) + r"\b", text_lower):
                found.append(skill.upper() if len(skill) <= 3 else skill)

    seen = set()
    deduped = []
    for s in found:
        key = s.lower().strip()
        if key not in seen and len(key) > 1:
            seen.add(key)
            deduped.append(s)
    return deduped[:40]


# ── Experience / Projects / Education Parsing ─────────────────

_DATE_RANGE = re.compile(
    r"(?:"
    r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}"
    r"\s*[-\u2013\u2014]\s*"
    r"(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|[Pp]resent|[Cc]urrent)"
    r"|"
    r"\d{1,2}/\d{4}\s*[-\u2013\u2014]\s*(?:\d{1,2}/\d{4}|[Pp]resent|[Cc]urrent)"
    r"|"
    r"\d{4}\s*[-\u2013\u2014]\s*(?:\d{4}|[Pp]resent|[Cc]urrent)"
    r")",
    re.I,
)

_YEAR_PATTERN = re.compile(r"\b((?:19|20)\d{2})\b")

_BULLET = re.compile(r"^[\s]*[•\-\*\u2022\u25CF\u25CB\u2023\u2043►▪▸‣]\s*")

_ROLE_KEYWORDS = [
    "engineer", "developer", "manager", "intern", "analyst",
    "designer", "lead", "architect", "consultant", "director",
    "specialist", "coordinator", "associate", "scientist", "officer",
    "administrator", "technician", "researcher", "assistant",
]


def _parse_entries(section_text: str) -> List[Dict[str, str]]:
    """Parse experience/projects into structured entries."""
    if not section_text:
        return []

    lines = section_text.split("\n")
    entries: List[Dict[str, str]] = []
    current: Optional[Dict[str, str]] = None
    pending: List[str] = []

    def _flush():
        nonlocal current
        if not pending:
            return
        if current is None:
            current = {"id": uuid.uuid4().hex[:8], "company": "", "role": "",
                        "duration": "", "description": ""}
        for pl in pending:
            dm = _DATE_RANGE.search(pl)
            if dm and not current["duration"]:
                current["duration"] = dm.group(0)
                rest = _DATE_RANGE.sub("", pl).strip(" |-\u2013\u2014,")
                if rest:
                    if not current["role"]:
                        current["role"] = rest
                    elif not current["company"]:
                        current["company"] = rest
            elif not current["role"]:
                current["role"] = pl
            elif not current["company"]:
                current["company"] = pl
        pending.clear()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        is_bullet = bool(_BULLET.match(line))
        has_date = bool(_DATE_RANGE.search(stripped))
        is_short = len(stripped) < 80 and not is_bullet

        if is_bullet:
            _flush()
            if current is not None:
                bullet_text = _BULLET.sub("", stripped)
                if current["description"]:
                    current["description"] += "; " + bullet_text
                else:
                    current["description"] = bullet_text
        elif has_date and is_short:
            # Date line belongs with the pending role/company lines
            pending.append(stripped)
            _flush()
        elif is_short:
            if current and current.get("description"):
                entries.append(current)
                current = None
                pending.clear()
            pending.append(stripped)
        else:
            _flush()
            if current is not None:
                if current["description"]:
                    current["description"] += " " + stripped
                else:
                    current["description"] = stripped

    _flush()
    if current:
        entries.append(current)

    for e in entries:
        comp = e.get("company", "").lower()
        role = e.get("role", "").lower()
        if any(kw in comp for kw in _ROLE_KEYWORDS) and not any(kw in role for kw in _ROLE_KEYWORDS):
            e["company"], e["role"] = e["role"], e["company"]

    return entries[:10]


def _parse_education(section_text: str) -> List[Dict[str, str]]:
    if not section_text:
        return []

    lines = [l.strip() for l in section_text.split("\n") if l.strip()]
    entries: List[Dict[str, str]] = []
    current: Optional[Dict[str, str]] = None

    degree_kws = [
        "bachelor", "master", "phd", "ph.d", "doctor", "associate",
        "diploma", "b.s.", "b.a.", "m.s.", "m.a.", "b.tech", "m.tech",
        "b.e.", "m.e.", "bsc", "msc", "mba", "bba", "b.com", "m.com",
        "degree", "certification", "honours", "honors",
    ]

    for line in lines:
        if _BULLET.match(line):
            continue

        has_degree = any(kw in line.lower() for kw in degree_kws)
        years = _YEAR_PATTERN.findall(line)
        gpa_match = re.search(
            r"(?:GPA|CGPA|gpa)[:\s]*(\d+\.?\d*)\s*/?\s*(\d+\.?\d*)?", line, re.I
        )
        is_year_or_gpa_only = (
            not has_degree
            and (years or gpa_match)
            and len(line) < 40
        )

        if has_degree:
            if current is not None and current["degree"]:
                entries.append(current)
                current = None
            if current is None:
                current = {"id": uuid.uuid4().hex[:8], "institution": "",
                            "degree": "", "year": "", "gpa": ""}
            current["degree"] = line
            if years:
                current["year"] = years[-1]
            if gpa_match:
                current["gpa"] = gpa_match.group(1)
        elif current and is_year_or_gpa_only:
            # Merge year/GPA lines into the current entry
            if years and not current["year"]:
                current["year"] = years[-1]
            if gpa_match and not current["gpa"]:
                current["gpa"] = gpa_match.group(1)
        elif current and not current["institution"]:
            current["institution"] = line
            if years and not current["year"]:
                current["year"] = years[-1]
            if gpa_match and not current["gpa"]:
                current["gpa"] = gpa_match.group(1)
        elif current is None:
            current = {
                "id": uuid.uuid4().hex[:8],
                "institution": line,
                "degree": "",
                "year": years[-1] if years else "",
                "gpa": gpa_match.group(1) if gpa_match else "",
            }
        else:
            entries.append(current)
            current = {
                "id": uuid.uuid4().hex[:8],
                "institution": line if not has_degree else "",
                "degree": line if has_degree else "",
                "year": years[-1] if years else "",
                "gpa": gpa_match.group(1) if gpa_match else "",
            }

    if current:
        entries.append(current)
    return entries[:5]


def _extract_certifications(section_text: str) -> List[str]:
    if not section_text:
        return []
    certs = []
    for line in section_text.split("\n"):
        line = _BULLET.sub("", line).strip()
        if line and len(line) > 3:
            certs.append(line)
    return list(dict.fromkeys(certs))[:10]


def _extract_languages(section_text: str) -> List[str]:
    if not section_text:
        return []
    langs = []
    for line in section_text.split("\n"):
        line = _BULLET.sub("", line).strip()
        if not line:
            continue
        for chunk in re.split(r"[,;|\u2022\u00b7\t]+", line):
            s = chunk.strip()
            s = re.sub(r"\s*[(\-\u2013:].{0,20}$", "", s).strip()
            if s and len(s) > 1 and len(s) < 30:
                langs.append(s)
    return list(dict.fromkeys(langs))[:10]


def _build_summary(sections: Dict[str, str], name: str, headline: str) -> str:
    summary_text = sections.get("summary", "")
    if summary_text:
        sentences = re.split(r"(?<=[.!?])\s+", summary_text)
        return " ".join(sentences[:3]).strip()

    parts = []
    if name:
        parts.append(name)
    if headline:
        parts.append(f"is a {headline}")
    exp = sections.get("experience", "")
    if exp:
        exp_lines = [l.strip() for l in exp.split("\n") if l.strip()]
        if exp_lines:
            parts.append(f"with experience including {exp_lines[0]}")
    return " ".join(parts).strip() if parts else ""


# ── Main Entry Point ──────────────────────────────────────────

def extract_resume_data(resume_text: str) -> Dict[str, Any]:
    """Extract all structured data from resume text."""
    sections = detect_sections(resume_text)
    header = sections.get("header", "")

    full_name = _extract_name(header)
    email = _extract_email(resume_text[:2000])
    phone = _extract_phone(header)
    linkedin_url = _extract_linkedin(resume_text[:2000])
    location = _extract_location(header)
    headline = _extract_headline(header, sections.get("experience", ""))
    skills = _extract_skills(sections.get("skills", ""), resume_text)
    experience = _parse_entries(sections.get("experience", ""))
    projects = _parse_entries(sections.get("projects", ""))
    education = _parse_education(sections.get("education", ""))
    certifications = _extract_certifications(sections.get("certifications", ""))
    languages = _extract_languages(sections.get("languages", ""))
    summary = _build_summary(sections, full_name, headline)

    return {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "location": location,
        "linkedin_url": linkedin_url,
        "headline": headline,
        "skills": skills,
        "experience": experience,
        "projects": projects,
        "education": education,
        "certifications": certifications,
        "languages": languages,
        "summary": summary,
    }
