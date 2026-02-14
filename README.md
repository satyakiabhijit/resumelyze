<h1 align="center">Resumelyze v2.0 - AI-Powered Resume Analyzer</h1>
<h3 align="center">Full-stack resume analysis with FastAPI + Next.js + Google Gemini AI + Local NLP</h3>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
</p>

---

## What is New in v2.0

| Feature | v1.0 (Streamlit) | v2.0 (Full-Stack) |
|---------|-------------------|--------------------|
| Frontend | Streamlit | **Next.js + Tailwind + Framer Motion** |
| Backend | Embedded in app | **FastAPI REST API with CORS** |
| Analysis | AI-only (needs API key) | **AI + Local NLP + Hybrid mode** |
| File Support | PDF only | **PDF, DOCX, TXT** |
| Scoring | JD match only | **JD Match + ATS Score + Readability + Section Scores** |
| Insights | Basic keywords | **Strengths, Weaknesses, Action Items, Recommended Roles** |
| API | None | **Full REST API (connect any frontend!)** |

## Project Structure

```
resumelyze/
  server.py                  # FastAPI backend entry point
  backend/
    __init__.py
    config.py              # Configuration and prompts
    models.py              # Pydantic models
    analyzer.py            # Local NLP analyzer (no API needed)
  app.py                     # Legacy Streamlit UI (still works!)
  frontend/                  # Next.js frontend
    package.json
    next.config.js         # API proxy to backend
    tailwind.config.js
    tsconfig.json
    src/
      app/
        layout.tsx
        page.tsx           # Main page
        globals.css
      components/
        Header.tsx
        Footer.tsx
        FileUpload.tsx
        JobDescriptionInput.tsx
        ModeSelector.tsx
        LoadingAnimation.tsx
        ResultsDashboard.tsx
        ScoreCircle.tsx
      lib/
        api.ts             # API client
        utils.ts           # Helper functions
      types/
        index.ts           # TypeScript types
    .env.local
  requirements.txt
  README.md
```

## Quick Start

### 1. Clone and Setup Backend

```bash
git clone https://github.com/satyakiabhijit/resumelyze.git
cd resumelyze

# Install Python dependencies
pip install -r requirements.txt

# (Optional) Add your Google API key for AI mode
# Create a .env file:
echo GOOGLE_API_KEY=your_key_here > .env

# Start the FastAPI backend
uvicorn server:app --reload --port 8000
```

The API will be live at **http://localhost:8000** with docs at **http://localhost:8000/docs**

### 2. Setup and Run Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be live at **http://localhost:3000**

### 3. (Optional) Legacy Streamlit UI

```bash
streamlit run app.py
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check - shows AI and NLP availability |
| GET | /api/modes | Available analysis modes |
| POST | /api/analyze | Analyze resume (file upload + JD) |
| POST | /api/analyze/text | Analyze resume text (no file upload) |
| POST | /api/extract-text | Extract text from PDF/DOCX/TXT |

### Example: Analyze via cURL

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "job_description=Looking for a Python developer with FastAPI experience..." \
  -F "resume_file=@resume.pdf" \
  -F "mode=hybrid"
```

## Analysis Modes

| Mode | Requires API Key | Description |
|------|-------------------|-------------|
| **Local** | No | TF-IDF cosine similarity, keyword extraction, section detection, readability scoring |
| **AI** | Yes | Full Google Gemini analysis with deep semantic understanding |
| **Hybrid** | Yes (falls back to local) | Best of both - merges NLP scores with AI insights |

## Technologies

**Backend:** Python, FastAPI, Uvicorn, PyPDF2, python-docx, Google Generative AI, Pydantic

**Frontend:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons, Axios, React Dropzone, Sonner

## 🚀 Deployment

For production deployment, see [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step instructions on deploying to:
- **Backend**: Fly.io (free tier)
- **Frontend**: Vercel (free tier)

## Contributing

Contributions are welcome! Fork the repo and create a pull request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with love by <a href="https://github.com/satyakiabhijit">Satyaki Abhijit</a>
</p>

<p align="center">
  <a href="https://twitter.com/abhijitsatyaki"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=flat&logo=twitter&logoColor=white" /></a>
  <a href="https://linkedin.com/in/abhijitsatyaki"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white" /></a>
  <a href="https://www.buymeacoffee.com/satyakiabhijit"><img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=flat&logo=buymeacoffee&logoColor=black" /></a>
</p>
