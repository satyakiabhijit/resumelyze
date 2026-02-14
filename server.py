"""
Resumelyze — FastAPI Backend Server
A powerful resume analysis API with AI + local NLP capabilities.
Designed for seamless integration with Next.js frontend.
"""
import json
import re
import io
import logging
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import PyPDF2 as pdf

from backend.config import (
    CORS_ORIGINS, GOOGLE_API_KEY, GEMINI_MODEL_CANDIDATES, ANALYSIS_PROMPT,
    MAX_FILE_SIZE_MB, ALLOWED_EXTENSIONS,
)
from backend.models import (
    AnalysisMode, AnalysisResult, HealthResponse, ErrorResponse,
)
from backend.analyzer import analyze_locally

# ── Setup ──
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resumelyze")

app = FastAPI(
    title="Resumelyze API",
    description="Powerful AI + NLP Resume Analyzer — works with or without API keys",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Gemini setup ──
gemini_available = False
_genai = None
_genai_errors = []
try:
    if GOOGLE_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=GOOGLE_API_KEY)
        _genai = genai
        gemini_available = True
        logger.info("✅ Gemini AI configured with API key (availability to be verified at request time)")
    else:
        logger.warning("⚠️ No GOOGLE_API_KEY — AI mode disabled, local NLP will be used")
except Exception as e:
    _genai_errors.append(str(e))
    logger.warning(f"⚠️ Gemini initial setup warning: {e} — local NLP will be used until resolved")


# ── Helpers ──

def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from PDF bytes."""
    try:
        reader = pdf.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")


def extract_docx_text(file_bytes: bytes) -> str:
    """Extract text from DOCX bytes."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    except ImportError:
        raise HTTPException(status_code=400, detail="DOCX support requires python-docx package")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse DOCX: {str(e)}")


def get_gemini_response(prompt: str) -> str:
    """Get response from Gemini AI.

    Tries multiple candidate model names (from config.GEMINI_MODEL_CANDIDATES).
    If all attempts fail, raises an HTTPException with collected diagnostics.
    """
    if not gemini_available or _genai is None:
        raise HTTPException(status_code=503, detail="Gemini AI is not configured (no API key or client initialization failed)")

    import backend.config as cfg

    last_errors = []
    # Try each candidate model name until one works
    for candidate in cfg.GEMINI_MODEL_CANDIDATES:
        if not candidate:
            continue
        try:
            # Attempt to instantiate and generate content
            model = _genai.GenerativeModel(candidate)
            response = model.generate_content(prompt)
            # If successful, return textual output
            return response.text
        except Exception as e:
            err_str = f"Model '{candidate}' failed: {e}"
            logger.warning(err_str)
            last_errors.append(err_str)

    # If none worked, provide diagnostic details in the error
    diagnostics = {
        "message": "None of the candidate Gemini/model names worked for generate_content.",
        "tried_models": cfg.GEMINI_MODEL_CANDIDATES,
        "errors": last_errors,
        "init_warnings": _genai_errors,
    }
    logger.error(f"Gemini generation failed for all candidates: {diagnostics}")
    # Return diagnostics in the response to help with troubleshooting (no secrets exposed)
    raise HTTPException(status_code=502, detail=diagnostics)


def parse_ai_response(response_text: str) -> dict:
    """Parse Gemini JSON response."""
    try:
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            return json.loads(json_match.group())
        return {}
    except json.JSONDecodeError:
        return {}


def ai_analyze(resume_text: str, job_description: str) -> dict:
    """Full AI-powered analysis using Gemini."""
    prompt = ANALYSIS_PROMPT.format(
        resume_text=resume_text,
        job_description=job_description,
    )
    raw = get_gemini_response(prompt)
    parsed = parse_ai_response(raw)

    if not parsed:
        raise HTTPException(status_code=502, detail="Failed to parse AI response")

    # Normalize section_scores
    raw_sections = parsed.get("section_scores", {})
    section_scores = {}
    for key, value in raw_sections.items():
        if isinstance(value, dict):
            section_scores[key] = {
                "score": value.get("score", 0),
                "suggestion": value.get("suggestion", ""),
            }

    return {
        "jd_match": parsed.get("jd_match", 0),
        "ats_score": parsed.get("ats_score", 0),
        "missing_keywords": parsed.get("missing_keywords", []),
        "found_keywords": parsed.get("found_keywords", []),
        "section_scores": section_scores,
        "profile_summary": parsed.get("profile_summary", ""),
        "strengths": parsed.get("strengths", []),
        "weaknesses": parsed.get("weaknesses", []),
        "action_items": parsed.get("action_items", []),
        "keyword_density": parsed.get("keyword_density", 0.0),
        "readability_score": parsed.get("readability_score", 0),
        "formatting_feedback": parsed.get("formatting_feedback", ""),
        "recommended_roles": parsed.get("recommended_roles", []),
        "analysis_mode": "ai",
    }


def hybrid_analyze(resume_text: str, job_description: str) -> dict:
    """Hybrid analysis: local NLP + AI enhancement."""
    local_result = analyze_locally(resume_text, job_description)

    if gemini_available:
        try:
            ai_result = ai_analyze(resume_text, job_description)
            # Merge: prefer AI for text fields, average numeric scores
            merged = {**ai_result}
            merged["jd_match"] = (local_result["jd_match"] + ai_result["jd_match"]) // 2
            merged["ats_score"] = (local_result["ats_score"] + ai_result["ats_score"]) // 2
            merged["readability_score"] = (local_result["readability_score"] + ai_result.get("readability_score", local_result["readability_score"])) // 2

            # Merge keywords (union)
            merged["missing_keywords"] = list(set(local_result["missing_keywords"] + ai_result["missing_keywords"]))[:20]
            merged["found_keywords"] = list(set(local_result["found_keywords"] + ai_result["found_keywords"]))[:20]

            # Merge section scores (average)
            all_sections = set(list(local_result["section_scores"].keys()) + list(ai_result["section_scores"].keys()))
            for section in all_sections:
                local_sec = local_result["section_scores"].get(section, {"score": 0, "suggestion": ""})
                ai_sec = ai_result["section_scores"].get(section, {"score": 0, "suggestion": ""})
                merged["section_scores"][section] = {
                    "score": (local_sec["score"] + ai_sec["score"]) // 2,
                    "suggestion": ai_sec["suggestion"] if ai_sec["suggestion"] else local_sec["suggestion"],
                }

            merged["analysis_mode"] = "hybrid"
            return merged
        except Exception as e:
            logger.warning(f"AI analysis failed in hybrid mode, falling back to local: {e}")
            local_result["analysis_mode"] = "local (AI fallback)"
            return local_result
    else:
        local_result["analysis_mode"] = "local (no AI key)"
        return local_result


# ══════════════════════════════════════════════════════════
# ── API Routes ──
# ══════════════════════════════════════════════════════════

@app.get("/", response_model=HealthResponse, tags=["Health"])
async def root():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        version="2.0.0",
        ai_available=gemini_available,
        nlp_available=True,
    )


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health():
    """Health check endpoint."""
    return HealthResponse(
        status="ok",
        version="2.0.0",
        ai_available=gemini_available,
        nlp_available=True,
    )


@app.post("/api/analyze", tags=["Analysis"])
async def analyze_resume(
    job_description: str = Form(...),
    mode: str = Form("ai"),
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
):
    """
    Analyze a resume against a job description.

    - Upload a PDF/DOCX file OR provide resume_text directly.
    - Modes: 'ai' (Gemini only), 'local' (NLP only), 'hybrid' (both).
    """
    # Extract resume text
    text = ""
    if resume_file:
        # Validate file
        ext = "." + resume_file.filename.split(".")[-1].lower() if "." in resume_file.filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

        file_bytes = await resume_file.read()
        if len(file_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB")

        if ext == ".pdf":
            text = extract_pdf_text(file_bytes)
        elif ext == ".docx":
            text = extract_docx_text(file_bytes)
        elif ext == ".txt":
            text = file_bytes.decode("utf-8", errors="ignore")
    elif resume_text:
        text = resume_text
    else:
        raise HTTPException(status_code=400, detail="Provide resume_file or resume_text")

    if not text or len(text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short or empty")

    if not job_description or len(job_description.strip()) < 10:
        raise HTTPException(status_code=400, detail="Job description is too short")

    # Run analysis
    logger.info(f"Running analysis in '{mode}' mode | Resume: {len(text)} chars | JD: {len(job_description)} chars")

    if mode == "ai":
        if not gemini_available:
            raise HTTPException(status_code=503, detail="AI mode requires a valid GOOGLE_API_KEY")
        result = ai_analyze(text, job_description)
    elif mode == "local":
        result = analyze_locally(text, job_description)
    else:  # hybrid
        result = hybrid_analyze(text, job_description)

    return JSONResponse(content=result)


@app.post("/api/analyze/text", tags=["Analysis"])
async def analyze_text(
    job_description: str = Form(...),
    resume_text: str = Form(...),
    mode: str = Form("ai"),
):
    """
    Analyze resume text (no file upload needed).
    Great for testing and for Next.js text-input mode.
    """
    if not resume_text or len(resume_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short")

    if mode == "ai":
        if not gemini_available:
            raise HTTPException(status_code=503, detail="AI mode requires a valid GOOGLE_API_KEY")
        result = ai_analyze(resume_text, job_description)
    elif mode == "local":
        result = analyze_locally(resume_text, job_description)
    else:
        result = hybrid_analyze(resume_text, job_description)

    return JSONResponse(content=result)


@app.post("/api/extract-text", tags=["Utilities"])
async def extract_text(file: UploadFile = File(...)):
    """Extract text from an uploaded PDF/DOCX/TXT file."""
    ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    file_bytes = await file.read()

    if ext == ".pdf":
        text = extract_pdf_text(file_bytes)
    elif ext == ".docx":
        text = extract_docx_text(file_bytes)
    elif ext == ".txt":
        text = file_bytes.decode("utf-8", errors="ignore")
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

    return {"text": text, "char_count": len(text), "filename": file.filename}


@app.get("/api/modes", tags=["Configuration"])
async def available_modes():
    """Return available analysis modes based on configuration."""
    modes = [
        {"id": "local", "name": "Local NLP", "available": True, "description": "Keyword matching & NLP analysis — no API key needed"},
    ]
    if gemini_available:
        modes.append({"id": "ai", "name": "AI (Gemini)", "available": True, "description": "Full AI-powered analysis using Google Gemini"})
        modes.append({"id": "hybrid", "name": "Hybrid", "available": True, "description": "Best of both — local NLP + AI enhancement"})
    else:
        modes.append({"id": "ai", "name": "AI (Gemini)", "available": False, "description": "Requires GOOGLE_API_KEY"})
        modes.append({"id": "hybrid", "name": "Hybrid", "available": False, "description": "Requires GOOGLE_API_KEY"})

    return {"modes": modes, "default": "ai" if gemini_available else "local"}


@app.get("/api/list-models", tags=["Diagnostics"])
async def list_models():
    """Attempt to list available generative models from the Gemini client.

    This endpoint is helpful to discover which model identifiers are available
    for your API key / account. If listing is not supported by the installed
    client, an error message will be returned.
    """
    if not gemini_available or _genai is None:
        raise HTTPException(status_code=503, detail={"message": "Gemini AI is not configured (missing API key or client init failed)."})

    # Try common listing methods depending on client version
    tried = []
    results = None
    errors = []
    try:
        # Preferred: genai.list_models()
        if hasattr(_genai, "list_models"):
            tried.append("list_models()")
            results = _genai.list_models()
        elif hasattr(_genai, "models") and hasattr(_genai.models, "list"):
            tried.append("models.list()")
            results = _genai.models.list()
        else:
            raise RuntimeError("No known list-models method on google.generativeai client")

        # Normalize result if it has 'models' attribute
        if isinstance(results, dict) and "models" in results:
            model_list = results.get("models")
        else:
            model_list = results

        return {"available": True, "method": tried, "models": model_list}
    except Exception as e:
        errors.append(str(e))
        logger.warning(f"Model listing failed: {errors}")
        raise HTTPException(status_code=502, detail={"message": "Failed to list models", "tried": tried, "errors": errors})


# ── Error handlers ──

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Endpoint not found", "error_code": "NOT_FOUND"})


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error", "error_code": "INTERNAL_ERROR"})


# ── Run ──
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
