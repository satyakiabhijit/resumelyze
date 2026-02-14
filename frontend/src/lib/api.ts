import axios from "axios";
import type {
  AnalysisResult,
  HealthResponse,
  ModesResponse,
} from "@/types";

// All API calls go to our own Next.js API routes — no external backend needed!
const api = axios.create({
  baseURL: "",
  timeout: 120000, // 2 min for AI analysis
});

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/api/health");
  return data;
}

export async function getAvailableModes(): Promise<ModesResponse> {
  const { data } = await api.get<ModesResponse>("/api/modes");
  return data;
}

export async function analyzeResume(
  jobDescription: string,
  resumeFile: File | null,
  resumeText: string | null,
  mode: string = "hybrid"
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("job_description", jobDescription);
  formData.append("mode", mode);

  if (resumeFile) {
    formData.append("resume_file", resumeFile);
  }
  if (resumeText) {
    formData.append("resume_text", resumeText);
  }

  const { data } = await api.post<AnalysisResult>("/api/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
