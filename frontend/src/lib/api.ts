import axios from "axios";
import type {
  AnalysisResult,
  HealthResponse,
  ModesResponse,
  ExtractTextResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for AI analysis
});

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/health");
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

export async function analyzeText(
  jobDescription: string,
  resumeText: string,
  mode: string = "hybrid"
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("job_description", jobDescription);
  formData.append("resume_text", resumeText);
  formData.append("mode", mode);

  const { data } = await api.post<AnalysisResult>("/api/analyze/text", formData);
  return data;
}

export async function extractText(file: File): Promise<ExtractTextResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ExtractTextResponse>("/api/extract-text", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
