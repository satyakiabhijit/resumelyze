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
  "recommended_roles": ["role1", "role2", "role3"]
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
  };
}
