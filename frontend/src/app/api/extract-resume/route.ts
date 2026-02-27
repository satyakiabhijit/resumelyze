import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { extractTextFromFile } from "@/lib/pdf-parser";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 },
          }),
        }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch {
      continue;
    }
  }
  throw new Error("All Gemini models failed");
}

/** NLP fallback: extract skills/education/experience via regex heuristics */
function localExtract(text: string) {
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  // Skills: look for a "Skills" section
  const skills: string[] = [];
  let inSkills = false;
  for (const line of lines) {
    if (/^(technical\s+)?skills?(\s+&\s+\w+)?:?$/i.test(line)) { inSkills = true; continue; }
    if (inSkills) {
      if (/^(experience|education|work|projects?|certifications?|summary|objective)/i.test(line)) break;
      skills.push(
        ...line.split(/[,;|•·\t]+/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 40)
      );
    }
  }

  // Experience: grab company/role lines
  const experience = [];
  let inExp = false;
  let current: any = null;
  for (const line of lines) {
    if (/^(work\s+)?experience:?$/i.test(line)) { inExp = true; continue; }
    if (inExp) {
      if (/^(education|skills?|projects?|certifications?)/i.test(line)) { inExp = false; if (current) experience.push(current); break; }
      // Detect date range → new job
      if (/\d{4}/.test(line) && line.split(" ").length < 8) {
        if (current) experience.push(current);
        current = { id: crypto.randomUUID(), company: "", role: line, duration: "", description: "" };
      } else if (current) {
        if (!current.company) current.company = line;
        else current.description += (current.description ? " " : "") + line;
      }
    }
  }
  if (current) experience.push(current);

  // Education
  const education = [];
  let inEdu = false;
  for (const line of lines) {
    if (/^education:?$/i.test(line)) { inEdu = true; continue; }
    if (inEdu) {
      if (/^(experience|skills?|projects?|certifications?|work)/i.test(line)) break;
      if (line.length > 5) {
        education.push({ id: crypto.randomUUID(), institution: line, degree: "", year: "" });
      }
    }
  }

  return {
    skills: [...new Set(skills)].slice(0, 40),
    experience: experience.slice(0, 10),
    projects: [],
    education: education.slice(0, 5),
    certifications: [],
    languages: [],
    summary: lines.slice(0, 3).join(" "),
  };
}

export async function POST(req: NextRequest) {
  try {
    let resume_text = "";
    let save_to_profile = false;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("resume_file") as File | null;
      save_to_profile = formData.get("save_to_profile") === "true";
      if (!file || file.size === 0) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      resume_text = await extractTextFromFile(buffer, file.name);
    } else {
      const body = await req.json();
      resume_text = body.resume_text ?? "";
      save_to_profile = body.save_to_profile ?? false;
    }

    if (!resume_text || resume_text.trim().length < 50) {
      return NextResponse.json({ error: "Resume text too short" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY || "";
    let resumeData: any;

    if (apiKey) {
      const prompt = `You are a precise resume parser. Extract structured data from the resume below and return ONLY valid JSON — no markdown fences, no explanation, no extra text.

JSON Schema:
{
  "full_name": "Candidate Full Name",
  "email": "email@example.com",
  "phone": "+1-234-567-8900",
  "location": "City, State/Country",
  "linkedin_url": "https://linkedin.com/in/username",
  "headline": "Senior Frontend Developer",
  "skills": ["skill1", "skill2"],
  "experience": [
    {"id": "abc12345", "company": "Company Name", "role": "Job Title", "duration": "Jan 2022 – Present", "description": "What you did"}
  ],
  "projects": [
    {"id": "def67890", "company": "Project Name", "role": "Tech Stack or Your Role", "duration": "Year", "description": "What the project does"}
  ],
  "education": [
    {"id": "ghi11111", "institution": "University Name", "degree": "Degree & Field", "year": "2024", "gpa": "3.8"}
  ],
  "certifications": ["Cert Name — Issuer (Year)"],
  "languages": ["English", "Spanish"],
  "summary": "2-3 sentence professional summary"
}

CRITICAL RULES — follow exactly:
1. "experience" = ONLY entries under headings like: Work Experience, Employment History, Professional Experience, Internships, Jobs. These are paid roles at real organisations.
2. "projects" = ONLY entries under headings like: Projects, Academic Projects, Personal Projects, Portfolio, Side Projects. These are things you built.
3. NEVER put a project in experience, and NEVER put a job in projects.
4. Each item must appear EXACTLY ONCE — no duplicates anywhere.
5. Each "company" field should be just the organisation or project name (no role, no date).
6. Each "role" field should be just the job title or tech stack (no date, no company).
7. "duration" should be the date range or year only (e.g. "Jun–Aug 2024" or "2025").
8. "description" should be the bullet points or description for that single entry only — do not mix in text from other entries.
9. skills: max 30 unique items, real technical/soft skills only.
10. All "id" fields: 8-char alphanumeric, unique.
11. If a section heading is not present, output an empty array [] for that field.
12. "full_name" should be the candidate's full name from the top of the resume.
13. "email", "phone", "location", "linkedin_url" should be extracted from contact info at the top. Use empty string "" if not found.
14. "headline" should be a short professional title (e.g. "Full Stack Developer") — derive from the resume's title/objective or most recent role.

RESUME TEXT:
${resume_text.slice(0, 8000)}`;

      try {
        const raw = await callGemini(apiKey, prompt);
        // Strip any accidental markdown fences
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        // Ensure all items have IDs
        const ensureId = (arr: any[]) =>
          arr.map((e: any) => ({ ...e, id: e.id || crypto.randomUUID().slice(0, 8) }));
        // Deduplicate by company+role key
        const dedup = (arr: any[]) => {
          const seen = new Set<string>();
          return arr.filter((e: any) => {
            const key = `${e.company}|${e.role}`.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        };
        resumeData = {
          full_name: parsed.full_name || "",
          email: parsed.email || "",
          phone: parsed.phone || "",
          location: parsed.location || "",
          linkedin_url: parsed.linkedin_url || "",
          headline: parsed.headline || "",
          skills: [...new Set(parsed.skills || [])],
          experience: dedup(ensureId(parsed.experience || [])),
          projects: dedup(ensureId(parsed.projects || [])),
          education: ensureId(parsed.education || []),
          certifications: [...new Set(parsed.certifications || [])],
          languages: [...new Set(parsed.languages || [])],
          summary: parsed.summary || "",
        };
      } catch {
        resumeData = localExtract(resume_text);
      }
    } else {
      resumeData = localExtract(resume_text);
    }

    // If user is logged in and wants to save, persist to their profile
    if (save_to_profile) {
      const supabase = createSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Separate contact fields from resume_data JSONB
        const { full_name, email, phone, location, linkedin_url, headline, ...resumeOnly } = resumeData;

        const profileUpdate: Record<string, unknown> = { resume_data: resumeOnly };
        if (full_name) profileUpdate.full_name = full_name;
        if (email) profileUpdate.email = email;
        if (phone) profileUpdate.phone = phone;
        if (location) profileUpdate.location = location;
        if (linkedin_url) profileUpdate.linkedin_url = linkedin_url;
        if (headline) profileUpdate.headline = headline;

        await supabase
          .from("profiles")
          .update(profileUpdate)
          .eq("id", user.id);
      }
    }

    return NextResponse.json(resumeData);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Extraction failed" }, { status: 500 });
  }
}
