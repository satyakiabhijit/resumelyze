"""
Local NLP Analyzer — works WITHOUT any API key.
Uses TF-IDF, cosine similarity, and regex-based extraction.
"""
import re
import math
from collections import Counter


# ── Common stop words ──
STOP_WORDS = set("""
a an and are as at be but by for from had has have he her his how i if in into
is it its just me more my no nor not of on or our out own per she so some than
that the their them then there these they this those through to too under up
very was we were what when where which while who whom why will with would you
your yours yourself yourselves am been being both can could did do does doing
done each few get gets got has have having here hers herself himself how'll
i'd i'll i'm i've if'll isn't it's itself let's me might must mustn't needn't
oughtn't shan't she'd she'll she's should shouldn't that's theirs themselves
there's they'd they'll they're they've wasn't we'd we'll we're we've weren't
what's when's where's who's why's won't wouldn't you'd you'll you're you've
""".split())

# ── Common tech keywords for extraction ──
TECH_KEYWORDS = set("""
python java javascript typescript react angular vue nextjs nodejs express
fastapi django flask spring sql nosql mongodb postgresql mysql redis docker
kubernetes aws azure gcp git github gitlab ci cd devops agile scrum kanban
html css sass tailwind bootstrap webpack vite graphql rest api microservices
machine learning deep learning nlp ai tensorflow pytorch pandas numpy scipy
sklearn data science analytics visualization tableau power bi excel
cloud computing serverless lambda s3 ec2 rds dynamodb terraform ansible
linux unix bash shell scripting automation testing jest pytest selenium
figma photoshop illustrator ux ui design wireframe prototype
project management leadership communication teamwork collaboration
problem solving critical thinking analytical attention to detail
""".split())


def tokenize(text: str) -> list[str]:
    """Tokenize text into lowercase words."""
    return re.findall(r'\b[a-z][a-z+#.]{1,30}\b', text.lower())


def extract_keywords(text: str, top_n: int = 50) -> list[str]:
    """Extract meaningful keywords from text."""
    tokens = tokenize(text)
    filtered = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
    counter = Counter(filtered)
    return [word for word, _ in counter.most_common(top_n)]


def extract_ngrams(text: str, n: int = 2) -> list[str]:
    """Extract n-grams from text."""
    tokens = tokenize(text)
    filtered = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]
    ngrams = []
    for i in range(len(filtered) - n + 1):
        ngrams.append(" ".join(filtered[i:i + n]))
    return ngrams


def compute_tfidf_similarity(text1: str, text2: str) -> float:
    """Compute cosine similarity between two texts using TF-IDF."""
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)
    filtered1 = [t for t in tokens1 if t not in STOP_WORDS]
    filtered2 = [t for t in tokens2 if t not in STOP_WORDS]

    all_words = set(filtered1 + filtered2)
    if not all_words:
        return 0.0

    tf1 = Counter(filtered1)
    tf2 = Counter(filtered2)

    # TF-IDF vectors
    vec1 = []
    vec2 = []
    for word in all_words:
        # TF
        t1 = tf1.get(word, 0) / max(len(filtered1), 1)
        t2 = tf2.get(word, 0) / max(len(filtered2), 1)
        # IDF (simplified: 2 documents)
        doc_count = (1 if word in tf1 else 0) + (1 if word in tf2 else 0)
        idf = math.log(2 / max(doc_count, 1)) + 1
        vec1.append(t1 * idf)
        vec2.append(t2 * idf)

    # Cosine similarity
    dot = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = math.sqrt(sum(a ** 2 for a in vec1))
    mag2 = math.sqrt(sum(b ** 2 for b in vec2))

    if mag1 == 0 or mag2 == 0:
        return 0.0

    return dot / (mag1 * mag2)


def detect_sections(text: str) -> dict[str, str]:
    """Detect resume sections using header patterns."""
    lines = text.split('\n')
    sections: dict[str, str] = {}
    current_section = "header"
    current_content: list[str] = []

    section_patterns = [
        r'^(?:professional\s+)?summary',
        r'^(?:career\s+)?objective',
        r'^(?:technical\s+)?skills',
        r'^(?:work\s+)?experience',
        r'^education',
        r'^projects?',
        r'^certifications?',
        r'^achievements?',
        r'^awards?',
        r'^publications?',
        r'^references?',
        r'^languages?',
        r'^interests?',
        r'^hobbies?',
        r'^volunteer',
    ]

    for line in lines:
        stripped = line.strip()
        is_header = False

        for pattern in section_patterns:
            if re.match(pattern, stripped.lower()):
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = re.sub(r'[^a-z\s]', '', stripped.lower()).strip()
                current_content = []
                is_header = True
                break

        if not is_header:
            current_content.append(line)

    if current_content:
        sections[current_section] = '\n'.join(current_content)

    return sections


def compute_keyword_density(resume_text: str, jd_keywords: list[str]) -> float:
    """Compute what percentage of JD keywords appear in the resume."""
    resume_lower = resume_text.lower()
    if not jd_keywords:
        return 0.0
    found = sum(1 for kw in jd_keywords if kw.lower() in resume_lower)
    return found / len(jd_keywords)


def compute_readability(text: str) -> int:
    """Compute a simplified readability score (0-100)."""
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    words = tokenize(text)

    if not sentences or not words:
        return 50

    avg_sentence_len = len(words) / len(sentences)
    long_words = sum(1 for w in words if len(w) > 6)
    long_word_pct = long_words / len(words)

    # Ideal: 15-20 words per sentence, < 30% long words
    sentence_score = max(0, 100 - abs(avg_sentence_len - 17) * 3)
    word_score = max(0, 100 - long_word_pct * 200)

    return min(100, int((sentence_score + word_score) / 2))


def score_section(section_text: str, jd_text: str, section_name: str) -> dict:
    """Score a single resume section against JD."""
    if not section_text or len(section_text.strip()) < 10:
        return {
            "score": 20,
            "suggestion": f"Your {section_name} section appears to be missing or very brief. Add detailed content relevant to the job description."
        }

    similarity = compute_tfidf_similarity(section_text, jd_text)
    jd_kw = extract_keywords(jd_text, 30)
    density = compute_keyword_density(section_text, jd_kw)

    score = int(min(100, (similarity * 60 + density * 40) * 100))
    score = max(10, score)

    suggestion = ""
    if score < 40:
        suggestion = f"Your {section_name} section needs significant improvement. Add more relevant keywords and align with the job requirements."
    elif score < 60:
        suggestion = f"Your {section_name} section is decent but could be stronger. Consider incorporating more specific terms from the job description."
    elif score < 80:
        suggestion = f"Your {section_name} section is good. Fine-tune it by adding quantifiable achievements and matching the JD's language more closely."
    else:
        suggestion = f"Your {section_name} section is excellent and well-aligned with the job description."

    return {"score": score, "suggestion": suggestion}


def analyze_locally(resume_text: str, job_description: str) -> dict:
    """
    Full local analysis — no API key required.
    Returns the same structure as the AI analysis for consistency.
    """
    # Keywords
    jd_keywords = extract_keywords(job_description, 40)
    resume_keywords = extract_keywords(resume_text, 60)
    jd_bigrams = extract_ngrams(job_description, 2)

    # Found vs missing
    resume_lower = resume_text.lower()
    found = [kw for kw in jd_keywords if kw in resume_lower]
    missing = [kw for kw in jd_keywords if kw not in resume_lower]

    # Also check bigrams
    for bg in jd_bigrams[:20]:
        if bg in resume_lower and bg not in found:
            found.append(bg)
        elif bg not in resume_lower and bg not in missing:
            missing.append(bg)

    # Match percentage
    similarity = compute_tfidf_similarity(resume_text, job_description)
    keyword_density = compute_keyword_density(resume_text, jd_keywords)
    jd_match = int(min(100, (similarity * 50 + keyword_density * 50) * 100))
    jd_match = max(5, jd_match)

    # ATS score
    sections = detect_sections(resume_text)
    has_email = bool(re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', resume_text))
    has_phone = bool(re.search(r'[\+]?[\d\s\-().]{7,15}', resume_text))
    has_linkedin = bool(re.search(r'linkedin\.com', resume_text.lower()))

    contact_score = (has_email * 10 + has_phone * 10 + has_linkedin * 5)
    section_count = len([s for s in sections if s != "header"])
    section_score = min(30, section_count * 6)
    ats_score = int(min(100, jd_match * 0.4 + contact_score + section_score + keyword_density * 20))

    # Section scores
    section_map = {
        "summary": ["summary", "professional summary", "objective", "career objective"],
        "skills": ["skills", "technical skills"],
        "experience": ["experience", "work experience"],
        "education": ["education"],
        "projects": ["projects", "project"],
    }

    section_scores = {}
    for key, aliases in section_map.items():
        content = ""
        for alias in aliases:
            if alias in sections:
                content = sections[alias]
                break
        scored = score_section(content, job_description, key)
        section_scores[key] = scored

    # Readability
    readability = compute_readability(resume_text)

    # Strengths & weaknesses
    strengths = []
    weaknesses = []

    if jd_match > 60:
        strengths.append("Good keyword alignment with job description")
    else:
        weaknesses.append("Low keyword match — tailor your resume to the specific job")

    if has_email and has_phone:
        strengths.append("Contact information is present")
    else:
        weaknesses.append("Missing contact information (email or phone)")

    if section_count >= 4:
        strengths.append("Well-structured resume with clear sections")
    else:
        weaknesses.append("Resume needs more defined sections")

    if readability > 70:
        strengths.append("Good readability and clear writing")
    else:
        weaknesses.append("Consider improving sentence clarity and conciseness")

    for key, data in section_scores.items():
        if isinstance(data, dict) and data.get("score", 0) > 70:
            strengths.append(f"Strong {key} section")
        elif isinstance(data, dict) and data.get("score", 0) < 40:
            weaknesses.append(f"{key.title()} section needs improvement")

    # Tech keyword overlap
    tech_found = [kw for kw in TECH_KEYWORDS if kw in resume_lower and kw in job_description.lower()]
    tech_missing = [kw for kw in TECH_KEYWORDS if kw not in resume_lower and kw in job_description.lower()]

    missing = list(set(missing + tech_missing))[:20]
    found = list(set(found + tech_found))[:20]

    # Action items
    action_items = []
    if missing:
        action_items.append(f"Add these missing keywords: {', '.join(missing[:5])}")
    if readability < 70:
        action_items.append("Improve readability — use shorter sentences and bullet points")
    if not has_linkedin:
        action_items.append("Add your LinkedIn profile link")
    for key, data in section_scores.items():
        if isinstance(data, dict) and data.get("score", 0) < 50:
            action_items.append(f"Strengthen your {key} section with more relevant content")
    if ats_score < 60:
        action_items.append("Use standard section headers for better ATS parsing")

    # Recommended roles (based on found keywords)
    role_map = {
        "python": "Python Developer",
        "javascript": "Frontend Developer",
        "react": "React Developer",
        "nodejs": "Node.js Developer",
        "data science": "Data Scientist",
        "machine learning": "ML Engineer",
        "devops": "DevOps Engineer",
        "cloud": "Cloud Engineer",
        "design": "UI/UX Designer",
        "project management": "Project Manager",
    }
    recommended_roles = []
    for keyword, role in role_map.items():
        if keyword in resume_lower:
            recommended_roles.append(role)
    if not recommended_roles:
        recommended_roles = ["Software Developer", "IT Professional"]

    # Profile summary
    profile_summary = (
        f"The resume shows a {jd_match}% alignment with the job description. "
        f"{'Strong' if jd_match > 65 else 'Moderate' if jd_match > 40 else 'Weak'} keyword presence. "
        f"The resume has {section_count} identifiable sections. "
        f"{'Contact information is complete.' if has_email and has_phone else 'Contact information may be incomplete.'} "
        f"Readability score is {readability}/100. "
        f"{'Consider tailoring the resume more closely to the specific job requirements.' if jd_match < 60 else 'The resume is reasonably well-targeted for this role.'}"
    )

    return {
        "jd_match": jd_match,
        "ats_score": ats_score,
        "missing_keywords": missing[:15],
        "found_keywords": found[:15],
        "section_scores": section_scores,
        "profile_summary": profile_summary,
        "strengths": strengths[:6],
        "weaknesses": weaknesses[:6],
        "action_items": action_items[:6],
        "keyword_density": round(keyword_density, 3),
        "readability_score": readability,
        "formatting_feedback": (
            "Resume formatting looks good with clear sections."
            if section_count >= 4
            else "Consider using standard section headers (Summary, Skills, Experience, Education, Projects) for better ATS compatibility."
        ),
        "recommended_roles": recommended_roles[:5],
        "analysis_mode": "local",
    }
