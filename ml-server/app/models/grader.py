"""
Grader — assigns an overall letter grade based on all analysis dimensions.

Uses a trained model (when available) or weighted formula combining:
  - JD match score
  - ATS score
  - Section scores
  - Readability
  - Action verb quality
  - Quantification
  - Cliché count (penalty)
"""

from __future__ import annotations
import numpy as np
from typing import Dict, Optional
from pathlib import Path
import joblib

from app.config import MODELS_DIR, GRADE_MAP

_grade_model = None
_grade_scaler = None


def _load_grade_model():
    global _grade_model, _grade_scaler
    model_path = MODELS_DIR / "grade_model.joblib"
    scaler_path = MODELS_DIR / "grade_scaler.joblib"
    if model_path.exists() and scaler_path.exists():
        _grade_model = joblib.load(model_path)
        _grade_scaler = joblib.load(scaler_path)
        print("[ML] Grade model loaded ✓")


def compute_grade(
    jd_match: float,
    ats_score: float,
    section_scores: Dict[str, Dict],
    readability: float,
    verb_score: float,
    quant_score: float,
    cliche_count: int,
    keyword_density: float,
) -> Dict:
    """
    Compute overall grade and completeness score.

    Returns {"grade": str, "numeric_score": int, "section_completeness": int}
    """
    # Section completeness: how many of the 5 standard sections exist with score > 20
    standard = ["summary", "skills", "experience", "education", "projects"]
    sections_with_content = sum(
        1 for s in standard
        if s in section_scores and section_scores[s].get("score", 0) > 20
    )
    section_completeness = round(sections_with_content / len(standard) * 100)

    # Avg section score
    section_scores_list = [
        section_scores[s]["score"]
        for s in standard
        if s in section_scores
    ]
    avg_section_score = sum(section_scores_list) / max(len(section_scores_list), 1)

    # Feature vector for grading
    features = np.array([
        jd_match,            # 0
        ats_score,           # 1
        avg_section_score,   # 2
        readability,         # 3
        verb_score,          # 4
        quant_score,         # 5
        max(0, 100 - cliche_count * 8),  # 6: cliché penalty
        keyword_density * 100,  # 7
        section_completeness,   # 8
    ], dtype=np.float32)

    # Try ML model
    if _grade_model is not None and _grade_scaler is not None:
        scaled = _grade_scaler.transform(features.reshape(1, -1))
        numeric = float(_grade_model.predict(scaled)[0])
    else:
        # Weighted formula
        numeric = (
            jd_match * 0.20 +
            ats_score * 0.15 +
            avg_section_score * 0.20 +
            readability * 0.10 +
            verb_score * 0.10 +
            quant_score * 0.10 +
            max(0, 100 - cliche_count * 8) * 0.05 +
            keyword_density * 100 * 0.05 +
            section_completeness * 0.05
        )

    numeric = max(0, min(100, round(numeric)))

    # Map to letter grade
    grade = "F"
    for threshold, letter in GRADE_MAP:
        if numeric >= threshold:
            grade = letter
            break

    return {
        "grade": grade,
        "numeric_score": numeric,
        "section_completeness": section_completeness,
    }


def compute_recommended_roles(resume_text: str) -> list[str]:
    """
    Suggest roles based on resume content analysis.
    Uses keyword matching against a comprehensive role taxonomy.
    """
    text_lower = resume_text.lower()

    ROLE_KEYWORDS = {
        "Frontend Developer": ["react", "angular", "vue", "javascript", "typescript", "css", "html", "frontend", "ui"],
        "Backend Developer": ["node", "express", "django", "flask", "spring", "api", "backend", "server", "microservice"],
        "Full Stack Developer": ["full stack", "fullstack", "frontend", "backend", "react", "node"],
        "Python Developer": ["python", "django", "flask", "fastapi", "pandas", "numpy"],
        "Java Developer": ["java", "spring", "hibernate", "maven", "gradle", "jvm"],
        "React Developer": ["react", "redux", "next.js", "nextjs", "jsx", "react native"],
        "Node.js Developer": ["node.js", "nodejs", "express", "npm", "typescript"],
        "Data Scientist": ["data science", "machine learning", "pandas", "numpy", "matplotlib", "jupyter", "statistics"],
        "ML Engineer": ["machine learning", "deep learning", "tensorflow", "pytorch", "nlp", "computer vision", "ml ops"],
        "Data Engineer": ["data pipeline", "etl", "spark", "hadoop", "airflow", "data warehouse", "sql"],
        "Data Analyst": ["data analysis", "excel", "tableau", "power bi", "sql", "visualization", "analytics"],
        "DevOps Engineer": ["devops", "ci/cd", "docker", "kubernetes", "terraform", "ansible", "jenkins", "aws"],
        "Cloud Engineer": ["aws", "azure", "gcp", "cloud", "serverless", "lambda", "ec2", "s3"],
        "Site Reliability Engineer": ["sre", "reliability", "monitoring", "kubernetes", "incident", "on-call"],
        "iOS Developer": ["ios", "swift", "objective-c", "xcode", "swiftui", "cocoa"],
        "Android Developer": ["android", "kotlin", "java", "android studio", "gradle"],
        "Mobile Developer": ["mobile", "react native", "flutter", "ionic", "xamarin"],
        "UI/UX Designer": ["ui", "ux", "figma", "sketch", "design", "wireframe", "prototype", "user research"],
        "Product Manager": ["product management", "roadmap", "stakeholder", "agile", "user stories", "prd"],
        "Project Manager": ["project management", "pmp", "scrum master", "agile", "gantt", "jira"],
        "QA Engineer": ["testing", "qa", "test automation", "selenium", "cypress", "jest", "quality assurance"],
        "Security Engineer": ["security", "penetration testing", "vulnerability", "soc", "siem", "cybersecurity"],
        "Database Administrator": ["database", "dba", "postgresql", "mysql", "oracle", "mongodb", "sql server"],
        "Systems Administrator": ["system admin", "linux", "windows server", "active directory", "vmware"],
        "Technical Writer": ["technical writing", "documentation", "api docs", "user guide"],
        "Solutions Architect": ["architecture", "solutions architect", "system design", "enterprise", "cloud architect"],
        "Blockchain Developer": ["blockchain", "solidity", "ethereum", "smart contract", "web3", "defi"],
        "AI Engineer": ["artificial intelligence", "llm", "gpt", "transformer", "nlp", "computer vision"],
        "Embedded Systems Engineer": ["embedded", "firmware", "rtos", "c/c++", "microcontroller", "iot"],
    }

    role_scores: Dict[str, int] = {}
    for role, keywords in ROLE_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in text_lower)
        if matches >= 2:
            role_scores[role] = matches

    # Sort by match count, return top 5
    sorted_roles = sorted(role_scores.items(), key=lambda x: -x[1])
    roles = [role for role, _ in sorted_roles[:5]]

    if not roles:
        roles = ["Software Developer", "IT Professional"]

    return roles
