"""
Real-World Dataset Loader + Augmentation

Sources:
  1. Synthetic (generate_data.py) — 5000+ labeled samples
  2. Kaggle resume dataset integration — real resume text
  3. User feedback loop — learn from actual usage

Combines all sources into a unified training set.
"""

import json
import os
import csv
import random
from typing import List, Dict, Tuple
from pathlib import Path

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "training_data")


# ══════════════════════════════════════════════════════════════
# Source 1: Real Resume Corpus from CSV/JSON
# ══════════════════════════════════════════════════════════════

# Common Kaggle resume datasets come in CSV format with columns:
#   - "Resume" or "resume_str" or "Resume_str" (resume text)
#   - "Category" (job category like "IT", "HR", "Finance")
# Examples:
#   - "Resume Dataset" from Kaggle (7000+ resumes)
#   - "UpdatedResumeDataSet.csv" (2400+ resumes with categories)

RESUME_CSV_PATTERNS = [
    "resumes.csv",
    "UpdatedResumeDataSet.csv",
    "Resume.csv",
    "resume_dataset.csv",
]

# Column name candidates for resume text
TEXT_COLUMNS = ["Resume", "resume_str", "Resume_str", "resume_text", "text", "content"]
CATEGORY_COLUMNS = ["Category", "category", "label", "job_category"]


def load_kaggle_csv(filepath: str) -> List[Dict]:
    """
    Load resumes from a Kaggle CSV file.
    
    Download any of these datasets and place the CSV in training_data/:
      - https://www.kaggle.com/datasets/gauravduttakiit/resume-dataset
      - https://www.kaggle.com/datasets/jithinjagadeesh/resume-dataset
    
    Returns list of {"resume": str, "category": str}
    """
    resumes = []

    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames or []

            # Find text column
            text_col = None
            for col in TEXT_COLUMNS:
                if col in headers:
                    text_col = col
                    break

            # Find category column
            cat_col = None
            for col in CATEGORY_COLUMNS:
                if col in headers:
                    cat_col = col
                    break

            if not text_col:
                print(f"  [!] Could not find resume text column in {filepath}")
                print(f"      Available columns: {headers}")
                return []

            for row in reader:
                text = row.get(text_col, "").strip()
                category = row.get(cat_col, "unknown").strip() if cat_col else "unknown"

                if len(text) > 100:  # Skip very short entries
                    # Clean common CSV artifacts
                    text = text.replace("\\n", "\n").replace("\\t", "\t")
                    resumes.append({"resume": text, "category": category})

        print(f"  [✓] Loaded {len(resumes)} resumes from {os.path.basename(filepath)}")

    except FileNotFoundError:
        pass  # Silently skip missing files
    except Exception as e:
        print(f"  [!] Error loading {filepath}: {e}")

    return resumes


def discover_real_resumes() -> List[Dict]:
    """Auto-discover and load all CSV resume datasets in training_data/."""
    os.makedirs(DATA_DIR, exist_ok=True)
    all_resumes = []

    # Check for known CSV patterns
    for pattern in RESUME_CSV_PATTERNS:
        path = os.path.join(DATA_DIR, pattern)
        if os.path.exists(path):
            all_resumes.extend(load_kaggle_csv(path))

    # Also check any .csv file in the directory
    for f in os.listdir(DATA_DIR):
        if f.endswith(".csv") and f not in RESUME_CSV_PATTERNS:
            path = os.path.join(DATA_DIR, f)
            all_resumes.extend(load_kaggle_csv(path))

    if all_resumes:
        print(f"  Total real resumes loaded: {len(all_resumes)}")
    else:
        print("  No real resume CSVs found in training_data/")
        print("  → Download from Kaggle and place CSV in ml-server/training_data/")
        print("  → The system works fine without them (using synthetic data)")

    return all_resumes


# ══════════════════════════════════════════════════════════════
# Source 2: JD Templates for Real Resumes
# ══════════════════════════════════════════════════════════════

# Map resume categories to realistic job descriptions
JD_TEMPLATES = {
    "Information Technology": """
Software Engineer - TechCorp
Requirements: 3+ years experience in software development.
Proficiency in Python, Java, or JavaScript. Experience with REST APIs,
databases (SQL/NoSQL), cloud platforms (AWS/Azure/GCP).
CI/CD pipelines, Git, Agile methodology. Bachelor's in CS or related field.
    """,
    "Data Science": """
Data Scientist - DataDriven Inc.
Requirements: MS in Statistics, CS, or related quantitative field.
Experience with Python, R, SQL, machine learning, deep learning.
Proficiency in TensorFlow/PyTorch, pandas, scikit-learn.
Experience with A/B testing, statistical modeling, data visualization.
    """,
    "HR": """
Human Resources Manager - Global Corp
Requirements: 5+ years HR experience. Knowledge of employment law,
benefits administration, talent acquisition. SHRM certification preferred.
Experience with HRIS systems, performance management, employee relations.
Strong interpersonal and communication skills.
    """,
    "Sales": """
Sales Manager - Revenue Corp
Requirements: 5+ years B2B sales experience. Proven track record of exceeding quotas.
CRM experience (Salesforce preferred). Territory management, pipeline development.
Strong negotiation and presentation skills. Bachelor's degree required.
    """,
    "Business Analyst": """
Senior Business Analyst - Consulting Group
Requirements: 3+ years as a Business Analyst. Expertise in requirements gathering,
stakeholder management, process improvement. SQL proficiency, Jira, Confluence.
Experience with Agile/Scrum methodology. Strong analytical and documentation skills.
    """,
    "Finance": """
Financial Analyst - Investment Corp
Requirements: CFA or MBA preferred. 3+ years in financial analysis.
Advanced Excel, financial modeling, Bloomberg Terminal. Experience with
P&L analysis, budgeting, forecasting. Knowledge of GAAP/IFRS standards.
    """,
    "Designer": """
Senior UX/UI Designer - Creative Agency
Requirements: 4+ years in product design. Proficiency in Figma, Sketch, Adobe XD.
User research, wireframing, prototyping, design systems. Portfolio required.
Experience with responsive and mobile-first design. HTML/CSS knowledge a plus.
    """,
    "Engineering": """
Mechanical/Civil/Electrical Engineer - Engineering Solutions
Requirements: PE license preferred. 3+ years engineering experience.
CAD software (AutoCAD, SolidWorks), project management. Experience with
technical specifications, compliance, and safety standards. BS in Engineering.
    """,
    "default": """
Professional Position - Growing Company
Requirements: 3+ years of relevant experience. Strong communication skills.
Project management, cross-functional collaboration. Analytical thinking,
problem solving. Bachelor's degree in a related field. Team leadership experience.
    """,
}


def get_jd_for_category(category: str) -> str:
    """Get a JD template matching the resume category."""
    # Try exact match first
    if category in JD_TEMPLATES:
        return JD_TEMPLATES[category].strip()

    # Fuzzy match
    cat_lower = category.lower()
    for key, jd in JD_TEMPLATES.items():
        if key.lower() in cat_lower or cat_lower in key.lower():
            return jd.strip()

    # Check keywords
    keyword_map = {
        "IT": "Information Technology",
        "software": "Information Technology",
        "developer": "Information Technology",
        "web": "Information Technology",
        "data": "Data Science",
        "machine learning": "Data Science",
        "analytics": "Data Science",
        "hr": "HR",
        "human": "HR",
        "sales": "Sales",
        "marketing": "Sales",
        "business": "Business Analyst",
        "analyst": "Business Analyst",
        "finance": "Finance",
        "accounting": "Finance",
        "design": "Designer",
        "ux": "Designer",
        "engineer": "Engineering",
        "mechanical": "Engineering",
    }

    for kw, template_key in keyword_map.items():
        if kw in cat_lower:
            return JD_TEMPLATES[template_key].strip()

    return JD_TEMPLATES["default"].strip()


# ══════════════════════════════════════════════════════════════
# Source 3: User Feedback Data
# ══════════════════════════════════════════════════════════════

FEEDBACK_FILE = os.path.join(DATA_DIR, "user_feedback.json")


def save_user_feedback(
    resume_text: str,
    job_description: str,
    predicted_scores: Dict,
    user_rating: int,  # 1-5 stars
    feedback_notes: str = "",
):
    """
    Save user feedback for continuous model improvement.
    Call this from the API when users rate their results.
    """
    os.makedirs(DATA_DIR, exist_ok=True)

    feedback = []
    if os.path.exists(FEEDBACK_FILE):
        with open(FEEDBACK_FILE, "r") as f:
            feedback = json.load(f)

    entry = {
        "resume": resume_text[:5000],  # Cap for storage
        "job_description": job_description[:2000],
        "predicted": predicted_scores,
        "user_rating": user_rating,
        "notes": feedback_notes,
    }
    feedback.append(entry)

    with open(FEEDBACK_FILE, "w") as f:
        json.dump(feedback, f, indent=2)


def load_user_feedback() -> List[Dict]:
    """Load accumulated user feedback."""
    if not os.path.exists(FEEDBACK_FILE):
        return []
    with open(FEEDBACK_FILE, "r") as f:
        return json.load(f)


# ══════════════════════════════════════════════════════════════
# Unified Dataset Builder
# ══════════════════════════════════════════════════════════════

def build_unified_dataset(
    n_synthetic: int = 5000,
    include_real: bool = True,
    include_feedback: bool = True,
) -> List[Dict]:
    """
    Build a unified training dataset from all sources.

    Priority:
      1. User feedback (highest weight — real human corrections)
      2. Real resumes from Kaggle (real text, estimated labels)
      3. Synthetic data (controlled quality distribution)
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    combined = []
    idx = 0

    # ── Synthetic data ──
    print("\n[1] Generating synthetic training data...")
    from app.training.generate_data import generate_dataset
    synthetic = generate_dataset(n_synthetic)
    for s in synthetic:
        s["source"] = "synthetic"
        s["id"] = idx
        idx += 1
    combined.extend(synthetic)

    # ── Real resumes ──
    if include_real:
        print("\n[2] Loading real resume datasets...")
        real_resumes = discover_real_resumes()

        if real_resumes:
            for r in real_resumes:
                jd = get_jd_for_category(r["category"])

                # Estimate quality from resume characteristics
                quality = _estimate_resume_quality(r["resume"])

                noise = random.uniform(-5, 5)
                combined.append({
                    "id": idx,
                    "resume": r["resume"],
                    "job_description": jd,
                    "domain": r["category"],
                    "quality": round(quality, 3),
                    "expected_jd_match": min(100, max(0, int(quality * 80 + 15 + noise))),
                    "expected_ats_score": min(100, max(0, int(quality * 75 + 20 + noise))),
                    "sections_present": _count_sections(r["resume"]),
                    "cliches_count": 0,
                    "source": "real",
                })
                idx += 1

            print(f"  Added {len(real_resumes)} real resume samples")
    else:
        print("\n[2] Skipping real resume datasets")

    # ── User feedback ──
    if include_feedback:
        print("\n[3] Loading user feedback...")
        feedback = load_user_feedback()

        if feedback:
            for fb in feedback:
                # Convert 1-5 star rating to quality 0-1
                quality = (fb["user_rating"] - 1) / 4.0

                combined.append({
                    "id": idx,
                    "resume": fb["resume"],
                    "job_description": fb["job_description"],
                    "domain": "user_feedback",
                    "quality": round(quality, 3),
                    "expected_jd_match": fb["predicted"].get("jd_match", 50),
                    "expected_ats_score": fb["predicted"].get("ats_score", 50),
                    "sections_present": _count_sections(fb["resume"]),
                    "cliches_count": 0,
                    "source": "feedback",
                    "weight": 3.0,  # Higher weight for human-labeled data
                })
                idx += 1

            print(f"  Added {len(feedback)} user feedback samples (3x weight)")
        else:
            print("  No user feedback yet")
    else:
        print("\n[3] Skipping user feedback")

    # Save unified dataset
    output_path = os.path.join(DATA_DIR, "unified_dataset.json")
    with open(output_path, "w") as f:
        json.dump(combined, f, indent=2)

    source_counts = {}
    for s in combined:
        src = s.get("source", "unknown")
        source_counts[src] = source_counts.get(src, 0) + 1

    print(f"\n[✓] Unified dataset: {len(combined)} total samples")
    for src, count in source_counts.items():
        print(f"    {src}: {count}")
    print(f"  Saved to {output_path}")

    return combined


def _estimate_resume_quality(text: str) -> float:
    """
    Estimate quality of a real resume based on heuristics.
    Returns 0.0 to 1.0
    """
    score = 0.5  # Start neutral

    # Length (too short or too long is bad)
    words = len(text.split())
    if 200 <= words <= 800:
        score += 0.1
    elif words < 100:
        score -= 0.15

    # Has contact info
    import re
    if re.search(r'[\w.-]+@[\w.-]+\.\w+', text):
        score += 0.05
    if re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text):
        score += 0.05

    # Has standard sections
    section_keywords = ["experience", "education", "skills", "summary", "projects"]
    sections_found = sum(1 for s in section_keywords if s in text.lower())
    score += sections_found * 0.05

    # Has bullet points
    bullets = text.count("•") + text.count("- ") + text.count("* ")
    if bullets >= 5:
        score += 0.1
    elif bullets >= 2:
        score += 0.05

    # Has quantified achievements
    if re.search(r'\d+%|\$[\d,]+|\d+\+', text):
        score += 0.1

    # Penalize common clichés
    cliches = ["team player", "hard worker", "self-starter", "results-driven"]
    cliche_count = sum(1 for c in cliches if c in text.lower())
    score -= cliche_count * 0.03

    return min(1.0, max(0.0, score))


def _count_sections(text: str) -> int:
    """Quick section count for a resume."""
    section_keywords = ["experience", "education", "skills", "summary", "projects",
                       "objective", "work history", "certifications", "awards"]
    text_lower = text.lower()
    return sum(1 for s in section_keywords if s in text_lower)


if __name__ == "__main__":
    print("Building unified training dataset...")
    build_unified_dataset(5000)
