/**
 * Google Gemini AI integration for resume analysis.
 * Uses the REST API directly — no Python SDK needed.
 * Runs as a serverless function on Vercel.
 */

const ANALYSIS_PROMPT = `You are an advanced AI-powered ATS and resume evaluator with deep expertise in hiring.

Analyze the resume against the job description provided. Evaluate it critically and provide section-wise improvement suggestions.

Resume:
{resume_text}

Job Description:
{job_description}

You must respond with ONLY valid JSON (no markdown, no code blocks, no extra text). Use this exact structure:

{
  "jd_match": 75,
  "ats_score": 80,
  "missing_keywords": ["keyword1", "keyword2"],
  "found_keywords": ["keyword1", "keyword2"],
  "section_scores": {
    "summary": { "score": 70, "suggestion": "Improve summary by adding quantifiable achievements" },
    "skills": { "score": 80, "suggestion": "Add more relevant technical skills from JD" },
    "experience": { "score": 65, "suggestion": "Use action verbs and quantify results" },
    "education": { "score": 90, "suggestion": "Education section is strong" },
    "projects": { "score": 75, "suggestion": "Align project descriptions with JD requirements" }
  },
  "profile_summary": "Brief overall evaluation of the resume",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "action_items": ["action1", "action2", "action3"],
  "keyword_density": 0.15,
  "readability_score": 85,
  "formatting_feedback": "Feedback about resume formatting",
  "recommended_roles": ["role1", "role2", "role3"],
  "cliches": [
    { "phrase": "results-driven", "suggestion": "Replace with a specific achievement demonstrating results" },
    { "phrase": "team player", "suggestion": "Describe a specific team collaboration outcome" }
  ],
  "action_verb_analysis": {
    "score": 70,
    "weak_verbs": ["managed", "helped", "worked on"],
    "strong_verbs": ["spearheaded", "architected", "optimized"],
    "suggestions": ["Replace 'managed' with 'orchestrated' or 'led'"]
  },
  "quantification_analysis": {
    "score": 60,
    "quantified_bullets": 3,
    "total_bullets": 8,
    "suggestions": ["Add metrics to your achievement about project delivery"]
  },
  "content_improvements": [
    {
      "original": "Managed a team of developers",
      "improved": "Led a cross-functional team of 8 developers, delivering 3 major features ahead of schedule",
      "reason": "Added specifics, quantification, and outcome"
    }
  ],
  "section_completeness": 75,
  "overall_grade": "B+"
}`;

// Model candidates to try in order
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  error?: { message?: string; code?: number };
}

/**
 * Call Gemini REST API directly (no SDK needed).
 * Tries multiple model candidates until one works.
 */
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const errors: string[] = [];

  for (const model of MODEL_CANDIDATES) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        errors.push(`${model}: HTTP ${res.status} — ${errBody.slice(0, 200)}`);
        continue;
      }

      const data: GeminiResponse = await res.json();

      if (data.error) {
        errors.push(`${model}: ${data.error.message}`);
        continue;
      }

      const candidate = data.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const text = candidate?.content?.parts?.[0]?.text;
      
      // Check if response was truncated
      if (finishReason === "MAX_TOKENS" || finishReason === "STOP_TOKEN") {
        console.warn(`${model}: Response may be truncated (${finishReason})`);
      }
      
      if (text) return text;

      errors.push(`${model}: Empty response`);
    } catch (e: any) {
      errors.push(`${model}: ${e.message}`);
    }
  }

  throw new Error(
    `All Gemini models failed:\n${errors.join("\n")}`
  );
}

/** Parse Gemini JSON response. */
function parseAiResponse(responseText: string): Record<string, any> | null {
  let cleaned = responseText.trim();
  
  try {
    // Remove various wrapping patterns Gemini uses
    // Pattern 1: ```json ... ``` or ``` ... ```
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, "").replace(/\s*```\s*$/i, "");
    
    // Pattern 2: 'json { ... } or "json { ... }
    cleaned = cleaned.replace(/^['"]json\s*/i, "").replace(/['"]$/g, "");
    
    // Pattern 3: Just quotes around JSON
    cleaned = cleaned.replace(/^['"]/, "").replace(/['"]$/, "");
    
    // Pattern 4: Extract JSON object with proper nesting (greedy match from first { to last })
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    // Check if JSON appears truncated
    const openBraces = (cleaned.match(/\{/g) || []).length;
    const closeBraces = (cleaned.match(/\}/g) || []).length;
    const openBrackets = (cleaned.match(/\[/g) || []).length;
    const closeBrackets = (cleaned.match(/\]/g) || []).length;
    
    if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
      console.warn(`JSON appears truncated: ${openBraces} open { vs ${closeBraces} close }, ${openBrackets} open [ vs ${closeBrackets} close ]`);
      console.warn("Response length:", responseText.length);
      console.warn("Cleaned length:", cleaned.length);
      return null;
    }
    
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parse error:", e);
    console.error("Raw response (first 1000 chars):", responseText.slice(0, 1000));
    console.error("Cleaned response (first 1000 chars):", cleaned.slice(0, 1000));
    console.error("Response ends with:", responseText.slice(-200));
    return null;
  }
}

export interface AiAnalysisResult {
  jd_match: number;
  ats_score: number;
  missing_keywords: string[];
  found_keywords: string[];
  section_scores: Record<string, { score: number; suggestion: string }>;
  profile_summary: string;
  strengths: string[];
  weaknesses: string[];
  action_items: string[];
  keyword_density: number;
  readability_score: number;
  formatting_feedback: string;
  recommended_roles: string[];
  analysis_mode: string;
  cliches?: { phrase: string; suggestion: string }[];
  action_verb_analysis?: {
    score: number;
    weak_verbs: string[];
    strong_verbs: string[];
    suggestions: string[];
  };
  quantification_analysis?: {
    score: number;
    quantified_bullets: number;
    total_bullets: number;
    suggestions: string[];
  };
  ats_detailed?: any;
  content_improvements?: {
    original: string;
    improved: string;
    reason: string;
  }[];
  section_completeness?: number;
  overall_grade?: string;
}

/** Full AI-powered analysis using Gemini. */
export async function aiAnalyze(
  resumeText: string,
  jobDescription: string,
  apiKey: string
): Promise<AiAnalysisResult> {
  const prompt = ANALYSIS_PROMPT
    .replace("{resume_text}", resumeText)
    .replace("{job_description}", jobDescription);

  const raw = await callGemini(prompt, apiKey);
  const parsed = parseAiResponse(raw);

  if (!parsed) {
    console.error("Failed to parse Gemini response. Raw output:", raw.slice(0, 1000));
    throw new Error(`Failed to parse AI response as JSON. Response preview: ${raw.slice(0, 200)}...`);
  }

  // Normalize section_scores
  const rawSections = parsed.section_scores || {};
  const sectionScores: Record<string, { score: number; suggestion: string }> = {};
  for (const [key, value] of Object.entries(rawSections)) {
    if (typeof value === "object" && value !== null) {
      const v = value as any;
      sectionScores[key] = {
        score: v.score || 0,
        suggestion: v.suggestion || "",
      };
    }
  }

  return {
    jd_match: parsed.jd_match || 0,
    ats_score: parsed.ats_score || 0,
    missing_keywords: parsed.missing_keywords || [],
    found_keywords: parsed.found_keywords || [],
    section_scores: sectionScores,
    profile_summary: parsed.profile_summary || "",
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    action_items: parsed.action_items || [],
    keyword_density: parsed.keyword_density || 0,
    readability_score: parsed.readability_score || 0,
    formatting_feedback: parsed.formatting_feedback || "",
    recommended_roles: parsed.recommended_roles || [],
    analysis_mode: "ai",
    cliches: parsed.cliches || [],
    action_verb_analysis: parsed.action_verb_analysis || undefined,
    quantification_analysis: parsed.quantification_analysis || undefined,
    ats_detailed: parsed.ats_detailed || undefined,
    content_improvements: parsed.content_improvements || [],
    section_completeness: parsed.section_completeness || 0,
    overall_grade: parsed.overall_grade || "",
  };
}

// ── Cover Letter Generation ──

const COVER_LETTER_PROMPT = `You are an expert career coach and cover letter writer.

Generate a compelling, personalized cover letter based on the candidate's resume and the target job description.

Resume:
{resume_text}

Job Description:
{job_description}

Tone: {tone}
Company: {company_name}
Role: {role_title}

You must respond with ONLY valid JSON (no markdown, no code blocks). Use this exact structure:

{
  "cover_letter": "The full cover letter text with proper paragraphs separated by \\n\\n",
  "tone": "professional",
  "word_count": 250
}

Guidelines:
- Open with a strong hook, not "I am writing to apply"
- Reference specific requirements from the JD
- Highlight 2-3 key achievements from the resume that match the role
- Keep it under 350 words
- End with a clear call to action
- Make it feel human, not generic`;

export async function aiGenerateCoverLetter(
  resumeText: string,
  jobDescription: string,
  tone: string,
  companyName: string,
  roleTitle: string,
  apiKey: string
): Promise<{ cover_letter: string; tone: string; word_count: number }> {
  const prompt = COVER_LETTER_PROMPT
    .replace("{resume_text}", resumeText)
    .replace("{job_description}", jobDescription)
    .replace("{tone}", tone)
    .replace("{company_name}", companyName || "the company")
    .replace("{role_title}", roleTitle || "the role");

  const raw = await callGemini(prompt, apiKey);
  const parsed = parseAiResponse(raw);

  if (!parsed) {
    throw new Error("Failed to parse cover letter response");
  }

  const letter = parsed.cover_letter || "";
  return {
    cover_letter: letter,
    tone: parsed.tone || tone,
    word_count: letter.split(/\s+/).filter(Boolean).length,
  };
}

// ── Skills Finder ──

const SKILLS_PROMPT = `You are an expert career advisor and ATS specialist.

Analyze the job description and identify all relevant skills a candidate should have. If a resume is provided, compare it against the required skills.

Job Description:
{job_description}

Resume (may be empty):
{resume_text}

Target Role: {role_title}

You must respond with ONLY valid JSON (no markdown, no code blocks). Use this exact structure:

{
  "role": "Software Engineer",
  "hard_skills": [
    { "category": "Programming Languages", "skills": ["Python", "JavaScript", "TypeScript"] },
    { "category": "Frameworks", "skills": ["React", "Next.js", "Node.js"] },
    { "category": "Tools & Platforms", "skills": ["Docker", "AWS", "Git"] }
  ],
  "soft_skills": ["Communication", "Problem Solving", "Team Leadership"],
  "missing_from_resume": ["Kubernetes", "GraphQL"],
  "matching_in_resume": ["Python", "React", "AWS"]
}

Be comprehensive. Include 15-30 hard skills across categories and 5-10 soft skills.`;

export async function aiFindSkills(
  jobDescription: string,
  resumeText: string,
  roleTitle: string,
  apiKey: string
): Promise<{
  role: string;
  hard_skills: { category: string; skills: string[] }[];
  soft_skills: string[];
  missing_from_resume: string[];
  matching_in_resume: string[];
}> {
  const prompt = SKILLS_PROMPT
    .replace("{job_description}", jobDescription)
    .replace("{resume_text}", resumeText || "Not provided")
    .replace("{role_title}", roleTitle || "Not specified");

  const raw = await callGemini(prompt, apiKey);
  const parsed = parseAiResponse(raw);

  if (!parsed) {
    throw new Error("Failed to parse skills response");
  }

  return {
    role: parsed.role || roleTitle || "Unknown",
    hard_skills: parsed.hard_skills || [],
    soft_skills: parsed.soft_skills || [],
    missing_from_resume: parsed.missing_from_resume || [],
    matching_in_resume: parsed.matching_in_resume || [],
  };
}
