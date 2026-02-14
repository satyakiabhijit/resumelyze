/**
 * Local NLP Analyzer — works WITHOUT any API key.
 * Uses TF-IDF, cosine similarity, and regex-based extraction.
 * Fully serverless — runs in Next.js API routes on Vercel.
 */

// ── Common stop words ──
const STOP_WORDS = new Set(`
a an and are as at be but by for from had has have he her his how i if in into
is it its just me more my no nor not of on or our out own per she so some than
that the their them then there these they this those through to too under up
very was we were what when where which while who whom why will with would you
your yours yourself yourselves am been being both can could did do does doing
done each few get gets got having here hers herself himself let may might must
ought shall should themselves until upon whom above after again all also another
any because before below between during further only other over same since
still such then until while about against along already among around
`.trim().split(/\s+/));

// ── Common tech keywords for extraction ──
const TECH_KEYWORDS = new Set(`
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
problem solving critical thinking analytical attention detail
`.trim().split(/\s+/));

/** Tokenize text into lowercase words. */
function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/\b[a-z][a-z+#.]{1,30}\b/g) || []);
}

/** Extract meaningful keywords from text. */
export function extractKeywords(text: string, topN = 50): string[] {
  const tokens = tokenize(text);
  const filtered = tokens.filter(t => !STOP_WORDS.has(t) && t.length > 2);
  const counter = new Map<string, number>();
  for (const t of filtered) {
    counter.set(t, (counter.get(t) || 0) + 1);
  }
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

/** Extract n-grams from text. */
function extractNgrams(text: string, n = 2): string[] {
  const tokens = tokenize(text);
  const filtered = tokens.filter(t => !STOP_WORDS.has(t) && t.length > 2);
  const ngrams: string[] = [];
  for (let i = 0; i <= filtered.length - n; i++) {
    ngrams.push(filtered.slice(i, i + n).join(" "));
  }
  return ngrams;
}

/** Compute cosine similarity between two texts using TF-IDF. */
function computeTfidfSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1).filter(t => !STOP_WORDS.has(t));
  const tokens2 = tokenize(text2).filter(t => !STOP_WORDS.has(t));

  const allWords = new Set([...tokens1, ...tokens2]);
  if (allWords.size === 0) return 0;

  const tf1 = new Map<string, number>();
  const tf2 = new Map<string, number>();
  for (const t of tokens1) tf1.set(t, (tf1.get(t) || 0) + 1);
  for (const t of tokens2) tf2.set(t, (tf2.get(t) || 0) + 1);

  const vec1: number[] = [];
  const vec2: number[] = [];

  for (const word of allWords) {
    const t1 = (tf1.get(word) || 0) / Math.max(tokens1.length, 1);
    const t2 = (tf2.get(word) || 0) / Math.max(tokens2.length, 1);
    const docCount = (tf1.has(word) ? 1 : 0) + (tf2.has(word) ? 1 : 0);
    const idf = Math.log(2 / Math.max(docCount, 1)) + 1;
    vec1.push(t1 * idf);
    vec2.push(t2 * idf);
  }

  const dot = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
  const mag1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
  const mag2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));

  if (mag1 === 0 || mag2 === 0) return 0;
  return dot / (mag1 * mag2);
}

/** Detect resume sections using header patterns. */
function detectSections(text: string): Record<string, string> {
  const lines = text.split("\n");
  const sections: Record<string, string> = {};
  let currentSection = "header";
  let currentContent: string[] = [];

  const sectionPatterns = [
    /^(?:professional\s+)?summary/i,
    /^(?:career\s+)?objective/i,
    /^(?:technical\s+)?skills/i,
    /^(?:work\s+)?experience/i,
    /^education/i,
    /^projects?/i,
    /^certifications?/i,
    /^achievements?/i,
    /^awards?/i,
    /^publications?/i,
    /^references?/i,
    /^languages?/i,
    /^interests?/i,
    /^hobbies?/i,
    /^volunteer/i,
  ];

  for (const line of lines) {
    const stripped = line.trim();
    let isHeader = false;

    for (const pattern of sectionPatterns) {
      if (pattern.test(stripped)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join("\n");
        }
        currentSection = stripped.toLowerCase().replace(/[^a-z\s]/g, "").trim();
        currentContent = [];
        isHeader = true;
        break;
      }
    }

    if (!isHeader) {
      currentContent.push(line);
    }
  }

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join("\n");
  }

  return sections;
}

/** Compute what percentage of JD keywords appear in the resume. */
function computeKeywordDensity(resumeText: string, jdKeywords: string[]): number {
  const resumeLower = resumeText.toLowerCase();
  if (jdKeywords.length === 0) return 0;
  const found = jdKeywords.filter(kw => resumeLower.includes(kw.toLowerCase())).length;
  return found / jdKeywords.length;
}

/** Compute a simplified readability score (0-100). */
function computeReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = tokenize(text);

  if (sentences.length === 0 || words.length === 0) return 50;

  const avgSentenceLen = words.length / sentences.length;
  const longWords = words.filter(w => w.length > 6).length;
  const longWordPct = longWords / words.length;

  const sentenceScore = Math.max(0, 100 - Math.abs(avgSentenceLen - 17) * 3);
  const wordScore = Math.max(0, 100 - longWordPct * 200);

  return Math.min(100, Math.round((sentenceScore + wordScore) / 2));
}

/** Score a single resume section against JD. */
function scoreSection(
  sectionText: string,
  jdText: string,
  sectionName: string
): { score: number; suggestion: string } {
  if (!sectionText || sectionText.trim().length < 10) {
    return {
      score: 20,
      suggestion: `Your ${sectionName} section appears to be missing or very brief. Add detailed content relevant to the job description.`,
    };
  }

  const similarity = computeTfidfSimilarity(sectionText, jdText);
  const jdKw = extractKeywords(jdText, 30);
  const density = computeKeywordDensity(sectionText, jdKw);

  let score = Math.round(Math.min(100, (similarity * 60 + density * 40) * 100));
  score = Math.max(10, score);

  let suggestion = "";
  if (score < 40) {
    suggestion = `Your ${sectionName} section needs significant improvement. Add more relevant keywords and align with the job requirements.`;
  } else if (score < 60) {
    suggestion = `Your ${sectionName} section is decent but could be stronger. Consider incorporating more specific terms from the job description.`;
  } else if (score < 80) {
    suggestion = `Your ${sectionName} section is good. Fine-tune it by adding quantifiable achievements and matching the JD's language more closely.`;
  } else {
    suggestion = `Your ${sectionName} section is excellent and well-aligned with the job description.`;
  }

  return { score, suggestion };
}

export interface AnalysisResultData {
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

/**
 * Full local analysis — no API key required.
 * Returns the same structure as the AI analysis for consistency.
 */
export function analyzeLocally(resumeText: string, jobDescription: string): AnalysisResultData {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescription.toLowerCase();

  // Keywords
  const jdKeywords = extractKeywords(jobDescription, 40);
  const jdBigrams = extractNgrams(jobDescription, 2);

  // Found vs missing
  let found = jdKeywords.filter(kw => resumeLower.includes(kw));
  let missing = jdKeywords.filter(kw => !resumeLower.includes(kw));

  // Check bigrams
  for (const bg of jdBigrams.slice(0, 20)) {
    if (resumeLower.includes(bg) && !found.includes(bg)) {
      found.push(bg);
    } else if (!resumeLower.includes(bg) && !missing.includes(bg)) {
      missing.push(bg);
    }
  }

  // Match percentage
  const similarity = computeTfidfSimilarity(resumeText, jobDescription);
  const keywordDensity = computeKeywordDensity(resumeText, jdKeywords);
  let jdMatch = Math.round(Math.min(100, (similarity * 50 + keywordDensity * 50) * 100));
  jdMatch = Math.max(5, jdMatch);

  // ATS score
  const sections = detectSections(resumeText);
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(resumeText);
  const hasPhone = /[+]?[\d\s\-().]{7,15}/.test(resumeText);
  const hasLinkedin = /linkedin\.com/i.test(resumeText);

  const contactScore = (hasEmail ? 10 : 0) + (hasPhone ? 10 : 0) + (hasLinkedin ? 5 : 0);
  const sectionCount = Object.keys(sections).filter(s => s !== "header").length;
  const sectionScoreBonus = Math.min(30, sectionCount * 6);
  const atsScore = Math.min(100, Math.round(jdMatch * 0.4 + contactScore + sectionScoreBonus + keywordDensity * 20));

  // Section scores
  const sectionMap: Record<string, string[]> = {
    summary: ["summary", "professional summary", "objective", "career objective"],
    skills: ["skills", "technical skills"],
    experience: ["experience", "work experience"],
    education: ["education"],
    projects: ["projects", "project"],
  };

  const sectionScores: Record<string, { score: number; suggestion: string }> = {};
  for (const [key, aliases] of Object.entries(sectionMap)) {
    let content = "";
    for (const alias of aliases) {
      if (sections[alias]) {
        content = sections[alias];
        break;
      }
    }
    sectionScores[key] = scoreSection(content, jobDescription, key);
  }

  // Readability
  const readability = computeReadability(resumeText);

  // Strengths & weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (jdMatch > 60) {
    strengths.push("Good keyword alignment with job description");
  } else {
    weaknesses.push("Low keyword match — tailor your resume to the specific job");
  }

  if (hasEmail && hasPhone) {
    strengths.push("Contact information is present");
  } else {
    weaknesses.push("Missing contact information (email or phone)");
  }

  if (sectionCount >= 4) {
    strengths.push("Well-structured resume with clear sections");
  } else {
    weaknesses.push("Resume needs more defined sections");
  }

  if (readability > 70) {
    strengths.push("Good readability and clear writing");
  } else {
    weaknesses.push("Consider improving sentence clarity and conciseness");
  }

  for (const [key, data] of Object.entries(sectionScores)) {
    if (data.score > 70) {
      strengths.push(`Strong ${key} section`);
    } else if (data.score < 40) {
      weaknesses.push(`${key.charAt(0).toUpperCase() + key.slice(1)} section needs improvement`);
    }
  }

  // Tech keyword overlap
  const techFound = [...TECH_KEYWORDS].filter(kw => resumeLower.includes(kw) && jdLower.includes(kw));
  const techMissing = [...TECH_KEYWORDS].filter(kw => !resumeLower.includes(kw) && jdLower.includes(kw));

  missing = [...new Set([...missing, ...techMissing])].slice(0, 20);
  found = [...new Set([...found, ...techFound])].slice(0, 20);

  // Action items
  const actionItems: string[] = [];
  if (missing.length > 0) {
    actionItems.push(`Add these missing keywords: ${missing.slice(0, 5).join(", ")}`);
  }
  if (readability < 70) {
    actionItems.push("Improve readability — use shorter sentences and bullet points");
  }
  if (!hasLinkedin) {
    actionItems.push("Add your LinkedIn profile link");
  }
  for (const [key, data] of Object.entries(sectionScores)) {
    if (data.score < 50) {
      actionItems.push(`Strengthen your ${key} section with more relevant content`);
    }
  }
  if (atsScore < 60) {
    actionItems.push("Use standard section headers for better ATS parsing");
  }

  // Recommended roles
  const roleMap: Record<string, string> = {
    python: "Python Developer",
    javascript: "Frontend Developer",
    react: "React Developer",
    nodejs: "Node.js Developer",
    "data science": "Data Scientist",
    "machine learning": "ML Engineer",
    devops: "DevOps Engineer",
    cloud: "Cloud Engineer",
    design: "UI/UX Designer",
    "project management": "Project Manager",
  };

  const recommendedRoles: string[] = [];
  for (const [keyword, role] of Object.entries(roleMap)) {
    if (resumeLower.includes(keyword)) {
      recommendedRoles.push(role);
    }
  }
  if (recommendedRoles.length === 0) {
    recommendedRoles.push("Software Developer", "IT Professional");
  }

  // Profile summary
  const profileSummary =
    `The resume shows a ${jdMatch}% alignment with the job description. ` +
    `${jdMatch > 65 ? "Strong" : jdMatch > 40 ? "Moderate" : "Weak"} keyword presence. ` +
    `The resume has ${sectionCount} identifiable sections. ` +
    `${hasEmail && hasPhone ? "Contact information is complete." : "Contact information may be incomplete."} ` +
    `Readability score is ${readability}/100. ` +
    `${jdMatch < 60 ? "Consider tailoring the resume more closely to the specific job requirements." : "The resume is reasonably well-targeted for this role."}`;

  return {
    jd_match: jdMatch,
    ats_score: atsScore,
    missing_keywords: missing.slice(0, 15),
    found_keywords: found.slice(0, 15),
    section_scores: sectionScores,
    profile_summary: profileSummary,
    strengths: strengths.slice(0, 6),
    weaknesses: weaknesses.slice(0, 6),
    action_items: actionItems.slice(0, 6),
    keyword_density: Math.round(keywordDensity * 1000) / 1000,
    readability_score: readability,
    formatting_feedback:
      sectionCount >= 4
        ? "Resume formatting looks good with clear sections."
        : "Consider using standard section headers (Summary, Skills, Experience, Education, Projects) for better ATS compatibility.",
    recommended_roles: recommendedRoles.slice(0, 5),
    analysis_mode: "local",
  };
}
