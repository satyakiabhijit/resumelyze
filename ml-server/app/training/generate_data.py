"""
Synthetic Training Data Generator for Resumelyze ML Models

Generates labeled (resume, job_description, scores) tuples.
Creates realistic variations to train scoring models to 95%+ accuracy.
"""

import random
import json
import os
from typing import Dict, List, Tuple

# ── Templates ──

SKILLS_BY_DOMAIN = {
    "software_engineering": {
        "hard": ["Python", "Java", "JavaScript", "TypeScript", "React", "Node.js",
                 "Docker", "Kubernetes", "AWS", "PostgreSQL", "MongoDB", "Redis",
                 "Git", "CI/CD", "REST APIs", "GraphQL", "Microservices",
                 "Agile", "TDD", "System Design"],
        "titles": ["Software Engineer", "Full Stack Developer", "Backend Developer",
                   "Frontend Developer", "Senior Software Engineer"],
        "verbs": ["Developed", "Architected", "Implemented", "Optimized", "Deployed",
                  "Designed", "Built", "Engineered", "Refactored", "Scaled"],
    },
    "data_science": {
        "hard": ["Python", "R", "SQL", "TensorFlow", "PyTorch", "Pandas", "NumPy",
                 "Scikit-learn", "Machine Learning", "Deep Learning", "NLP",
                 "Computer Vision", "Statistical Analysis", "A/B Testing",
                 "Spark", "Hadoop", "Tableau", "Power BI"],
        "titles": ["Data Scientist", "ML Engineer", "Data Analyst",
                   "AI Engineer", "Research Scientist"],
        "verbs": ["Analyzed", "Modeled", "Predicted", "Visualized", "Trained",
                  "Optimized", "Extracted", "Transformed", "Evaluated", "Deployed"],
    },
    "product_management": {
        "hard": ["Product Strategy", "Agile", "Scrum", "JIRA", "Roadmapping",
                 "User Research", "A/B Testing", "SQL", "Figma", "Analytics",
                 "Stakeholder Management", "OKRs", "KPIs", "Market Analysis"],
        "titles": ["Product Manager", "Senior PM", "Associate PM",
                   "Technical Product Manager", "Group PM"],
        "verbs": ["Led", "Launched", "Drove", "Defined", "Prioritized",
                  "Coordinated", "Authored", "Analyzed", "Communicated", "Evaluated"],
    },
    "devops": {
        "hard": ["Docker", "Kubernetes", "Terraform", "Ansible", "AWS", "Azure",
                 "GCP", "Linux", "Bash", "Python", "Jenkins", "GitHub Actions",
                 "Prometheus", "Grafana", "CI/CD", "Helm", "ELK Stack"],
        "titles": ["DevOps Engineer", "SRE", "Cloud Engineer",
                   "Platform Engineer", "Infrastructure Engineer"],
        "verbs": ["Automated", "Deployed", "Provisioned", "Monitored",
                  "Configured", "Orchestrated", "Migrated", "Optimized",
                  "Secured", "Streamlined"],
    },
    "marketing": {
        "hard": ["SEO", "SEM", "Google Analytics", "Content Strategy",
                 "Social Media Marketing", "Email Marketing", "HubSpot",
                 "Salesforce", "Copywriting", "Brand Strategy", "PPC",
                 "Marketing Automation", "CRM"],
        "titles": ["Marketing Manager", "Digital Marketing Specialist",
                   "Content Marketer", "Growth Manager", "Brand Manager"],
        "verbs": ["Increased", "Grew", "Launched", "Developed", "Executed",
                  "Managed", "Optimized", "Generated", "Created", "Drove"],
    },
}

CLICHES = [
    "results-driven", "team player", "self-starter", "go-getter",
    "think outside the box", "detail-oriented", "hard worker",
    "passionate about", "synergy", "proven track record",
]

WEAK_VERBS = ["managed", "helped", "worked on", "responsible for", "assisted with"]

EDUCATION_TEMPLATES = [
    "Bachelor of Science in Computer Science, {uni}, GPA: {gpa}",
    "Master of Science in {major}, {uni}",
    "Bachelor of Engineering in {major}, {uni}, {year}",
    "MBA, {uni}, {year}",
]

UNIVERSITIES = [
    "MIT", "Stanford University", "UC Berkeley", "Carnegie Mellon",
    "Georgia Tech", "University of Michigan", "UT Austin",
    "University of Washington", "Purdue University", "UIUC",
]

MAJORS = [
    "Computer Science", "Data Science", "Information Technology",
    "Electrical Engineering", "Business Administration", "Mathematics",
]

COMPANIES = [
    "Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix",
    "Uber", "Airbnb", "Stripe", "Coinbase", "A Software Company",
    "TechCorp", "InnovateTech", "DataDriven Inc.", "CloudFirst",
]


def _random_metrics() -> str:
    """Generate a random quantified metric."""
    templates = [
        f"increased revenue by {random.randint(10, 200)}%",
        f"reduced latency by {random.randint(20, 80)}%",
        f"serving {random.randint(1, 50)}M+ users",
        f"saved ${random.randint(10, 500)}K annually",
        f"improved throughput by {random.randint(2, 10)}x",
        f"managed a team of {random.randint(3, 20)} engineers",
        f"delivered {random.randint(2, 15)} projects in {random.randint(6, 18)} months",
        f"processing {random.randint(1, 100)}K requests/second",
        f"achieved {random.randint(95, 99)}.{random.randint(0, 9)}% uptime",
        f"reduced costs by ${random.randint(50, 500)}K",
    ]
    return random.choice(templates)


def _generate_bullet(domain: str, strong: bool = True, quantified: bool = True) -> str:
    """Generate a resume bullet point."""
    d = SKILLS_BY_DOMAIN[domain]
    verb = random.choice(d["verbs"]) if strong else random.choice(WEAK_VERBS)
    skill = random.choice(d["hard"])
    metric = _random_metrics() if quantified else ""

    if strong and quantified:
        return f"• {verb} {skill}-based solution that {metric}"
    elif strong:
        return f"• {verb} {skill} systems for the engineering team"
    elif quantified:
        return f"• {verb.capitalize()} {skill} projects, {metric}"
    else:
        return f"• {verb.capitalize()} {skill} tasks for the team"


def _generate_experience(domain: str, quality: float) -> str:
    """Generate experience section. quality: 0.0 (bad) to 1.0 (excellent)"""
    num_jobs = random.randint(1, 3) if quality < 0.5 else random.randint(2, 4)
    exp = "EXPERIENCE\n"

    for i in range(num_jobs):
        company = random.choice(COMPANIES)
        title = random.choice(SKILLS_BY_DOMAIN[domain]["titles"])
        year_start = random.randint(2018, 2023)
        year_end = year_start + random.randint(1, 3)

        exp += f"\n{title} | {company} | {year_start} - {year_end}\n"

        num_bullets = random.randint(2, 5) if quality > 0.5 else random.randint(1, 3)
        for _ in range(num_bullets):
            strong = random.random() < quality
            quantified = random.random() < quality * 0.8
            exp += _generate_bullet(domain, strong, quantified) + "\n"

    return exp


def _generate_skills(domain: str, quality: float, jd_skills: List[str]) -> str:
    """Generate skills section with variable overlap with JD."""
    d = SKILLS_BY_DOMAIN[domain]
    n_matching = int(len(jd_skills) * quality * 0.9)  # Up to 90% overlap for quality=1
    matching = random.sample(jd_skills, min(n_matching, len(jd_skills)))
    extra = random.sample(d["hard"], min(5, len(d["hard"])))

    all_skills = list(dict.fromkeys(matching + extra))
    return "SKILLS\n" + ", ".join(all_skills[:15])


def _generate_summary(domain: str, quality: float) -> str:
    """Generate professional summary."""
    years = random.randint(2, 12)
    title = random.choice(SKILLS_BY_DOMAIN[domain]["titles"])

    if quality > 0.7:
        return f"SUMMARY\nResults-oriented {title} with {years}+ years of experience. Proven expertise in delivering scalable solutions. Skilled in cross-functional collaboration and technical leadership."
    elif quality > 0.4:
        return f"SUMMARY\nExperienced {title} with {years} years in the field. Looking for challenging opportunities."
    else:
        if random.random() < 0.5:
            cliche = random.choice(CLICHES)
            return f"SUMMARY\nA {cliche} {title.lower()} who is a team player and a hard worker."
        return ""  # Missing summary


def _generate_education(quality: float) -> str:
    """Generate education section."""
    uni = random.choice(UNIVERSITIES)
    major = random.choice(MAJORS)
    year = random.randint(2010, 2023)
    gpa = round(random.uniform(2.5, 4.0), 1) if quality > 0.5 else round(random.uniform(2.0, 3.5), 1)

    template = random.choice(EDUCATION_TEMPLATES)
    return "EDUCATION\n" + template.format(uni=uni, major=major, year=year, gpa=gpa)


def _generate_contact(quality: float) -> str:
    """Generate contact info."""
    name = random.choice(["John Doe", "Jane Smith", "Alex Johnson", "Sam Wilson", "Pat Taylor"])
    email = f"{name.lower().replace(' ', '.')}@email.com"

    parts = [name, email]
    if quality > 0.3 or random.random() < 0.7:
        parts.append(f"({random.randint(100, 999)}) {random.randint(100, 999)}-{random.randint(1000, 9999)}")
    if quality > 0.5 or random.random() < 0.5:
        parts.append(f"linkedin.com/in/{name.lower().replace(' ', '-')}")
    if quality > 0.7 and random.random() < 0.5:
        parts.append(f"github.com/{name.lower().replace(' ', '')}")

    return " | ".join(parts)


def _generate_job_description(domain: str) -> Tuple[str, List[str]]:
    """Generate a job description and return (jd_text, key_skills)."""
    d = SKILLS_BY_DOMAIN[domain]
    title = random.choice(d["titles"])
    company = random.choice(COMPANIES)
    years = random.randint(2, 8)

    req_skills = random.sample(d["hard"], min(random.randint(5, 10), len(d["hard"])))

    jd = f"""
{title} - {company}

We are looking for an experienced {title} to join our growing team.

Requirements:
- {years}+ years of professional experience
- Strong proficiency in {', '.join(req_skills[:3])}
- Experience with {', '.join(req_skills[3:6])}
- Excellent communication and collaboration skills
- Bachelor's degree in a related field

Nice to have:
- Experience with {', '.join(req_skills[6:])}
- Leadership or mentoring experience
- Contributions to open source projects

Responsibilities:
- Design and implement scalable solutions using {req_skills[0]} and {req_skills[1]}
- Collaborate with cross-functional teams to deliver features
- Mentor junior engineers and contribute to technical decisions
- Participate in code reviews and maintain high engineering standards
""".strip()

    return jd, req_skills


def generate_resume(domain: str, quality: float) -> Tuple[str, Dict]:
    """
    Generate a synthetic resume with known quality level.

    Args:
        domain: Skill domain key
        quality: 0.0 to 1.0 where 1.0 is a perfect resume

    Returns:
        (resume_text, metadata) where metadata contains labels
    """
    jd, jd_skills = _generate_job_description(domain)

    contact = _generate_contact(quality)
    summary = _generate_summary(domain, quality)
    skills = _generate_skills(domain, quality, jd_skills)
    experience = _generate_experience(domain, quality)
    education = _generate_education(quality)

    # Optionally add projects section for higher quality
    projects = ""
    if quality > 0.6 and random.random() < quality:
        projects = "PROJECTS\n"
        for _ in range(random.randint(1, 3)):
            projects += f"• {random.choice(SKILLS_BY_DOMAIN[domain]['verbs'])} a {random.choice(jd_skills)} project — {_random_metrics()}\n"

    # Add clichés for lower quality
    cliches_added = 0
    if quality < 0.5 and random.random() < 0.7:
        n = random.randint(2, 5)
        cliche_text = "\n" + " ".join(random.sample(CLICHES, min(n, len(CLICHES))))
        cliches_added = n
    else:
        cliche_text = ""

    parts = [contact, summary, skills, experience, education, projects, cliche_text]
    resume = "\n\n".join([p for p in parts if p.strip()])

    # Compute labels
    sections_present = sum([
        bool(summary), True,  # skills always present
        True,  # experience always present
        True,  # education always present
        bool(projects),
    ])

    # Noise for realism
    noise = random.uniform(-5, 5)

    metadata = {
        "domain": domain,
        "quality": quality,
        "jd": jd,
        "jd_skills": jd_skills,
        "expected_jd_match": min(100, max(0, int(quality * 85 + noise + 10))),
        "expected_ats_score": min(100, max(0, int(quality * 80 + noise + 15))),
        "sections_present": sections_present,
        "cliches_added": cliches_added,
        "has_email": True,
        "has_phone": quality > 0.3 or random.random() < 0.7,
    }

    return resume, metadata


def generate_dataset(n_samples: int = 5000, output_dir: str = None) -> List[Dict]:
    """Generate a full labeled dataset."""
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(__file__), "..", "..", "training_data")

    os.makedirs(output_dir, exist_ok=True)

    data = []
    domains = list(SKILLS_BY_DOMAIN.keys())

    for i in range(n_samples):
        domain = random.choice(domains)
        # Sample quality from beta distribution for realistic spread
        quality = random.betavariate(2.5, 2.5)  # Peak around 0.5, spread to 0-1

        resume, metadata = generate_resume(domain, quality)

        sample = {
            "id": i,
            "resume": resume,
            "job_description": metadata["jd"],
            "domain": metadata["domain"],
            "quality": round(metadata["quality"], 3),
            "expected_jd_match": metadata["expected_jd_match"],
            "expected_ats_score": metadata["expected_ats_score"],
            "sections_present": metadata["sections_present"],
            "cliches_count": metadata["cliches_added"],
        }
        data.append(sample)

        if (i + 1) % 500 == 0:
            print(f"  Generated {i + 1}/{n_samples} samples...")

    # Save dataset
    output_path = os.path.join(output_dir, "training_data.json")
    with open(output_path, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\n[✓] Saved {len(data)} samples to {output_path}")
    return data


if __name__ == "__main__":
    print("Generating synthetic training data...")
    generate_dataset(5000)
