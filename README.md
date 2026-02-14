<h1 align="center">Resumelyze v3.0 - AI-Powered Resume Analyzer</h1>
<h3 align="center">Fully serverless resume analysis with Next.js + Google Gemini AI + Local NLP — deploy on Vercel for free!</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
</p>

---

## What is New in v3.0

| Feature | v2.0 (FastAPI + Next.js) | v3.0 (Fully Serverless) |
|---------|--------------------------|--------------------------|
| Architecture | Separate Python backend + Next.js frontend | **Single Next.js app with API routes** |
| Deployment | Need 2 services (Fly.io + Vercel) | **Just Vercel (free!)** |
| Backend | FastAPI (Python) | **Next.js API Routes (TypeScript)** |
| Analysis | AI + Local NLP + Hybrid | **AI + Local NLP + Hybrid (same!)** |
| File Support | PDF, DOCX, TXT | **PDF, DOCX, TXT (same!)** |
| Cold Start | ~5s (separate backend) | **~1s (serverless functions)** |

## Project Structure

```
resumelyze/
  frontend/                      # Everything lives here!
    package.json
    next.config.js
    vercel.json                  # Vercel config
    tailwind.config.js
    tsconfig.json
    .env.local                   # API key (local dev)
    src/
      app/
        layout.tsx
        page.tsx                 # Main page
        globals.css
        api/
          analyze/route.ts       # 🔥 Analysis API (serverless)
          health/route.ts        # Health check API
          modes/route.ts         # Available modes API
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
        api.ts                   # Frontend API client
        analyzer.ts              # 🧠 Local NLP engine (TypeScript)
        gemini.ts                # 🤖 Gemini AI integration
        pdf-parser.ts            # 📄 PDF/DOCX text extraction
        utils.ts
      types/
        index.ts
  LICENSE
  README.md
```

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/satyakiabhijit/resumelyze.git
cd resumelyze/frontend
npm install
```

### 2. Add API Key (optional — local mode works without it)

```bash
# Create frontend/.env.local
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Run

```bash
npm run dev
```

Open **http://localhost:3000** — that's it! No separate backend needed.

## Deploy to Vercel (Free)

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Set **Root Directory** → `frontend`
4. Add **Environment Variable**: `GOOGLE_API_KEY` = `your_key_here`
5. Click **Deploy** 🚀

Your app will be live at `https://your-project.vercel.app`

## Analysis Modes

| Mode | Requires API Key | Description |
|------|-------------------|-------------|
| **Local** | No | TF-IDF cosine similarity, keyword extraction, section detection, readability scoring |
| **AI** | Yes | Full Google Gemini analysis with deep semantic understanding |
| **Hybrid** | Yes (falls back to local) | Best of both — merges NLP scores with AI insights |

## Technologies

**Runtime:** Next.js 14, TypeScript, Vercel Serverless Functions

**UI:** Tailwind CSS, Framer Motion, Recharts, Lucide Icons, React Dropzone, Sonner

**Analysis:** Local NLP (TF-IDF), Google Gemini AI (REST API), pdf-parse, mammoth

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
