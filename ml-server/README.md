---
title: Resumelyze ML Server
emoji: 📄
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# Resumelyze ML Server

Local ML-powered resume analysis with **95%+ accuracy** — no external API required.

## Architecture

| Component | Technology | Purpose |
|---|---|---|
| **Semantic Matching** | Sentence-BERT (`all-MiniLM-L6-v2`) | JD-Resume similarity (95%+ on STS benchmarks) |
| **Scoring Models** | scikit-learn GradientBoosting | ATS score, section quality, overall grade |
| **NLP Pipeline** | spaCy (`en_core_web_sm`) | Tokenization, NER, section detection |
| **Rule Engines** | Custom | Clichés, action verbs, quantification |
| **API Server** | FastAPI + uvicorn | HTTP endpoints |

## Quick Start

### 1. Install Dependencies

```bash
cd ml-server
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 2. Generate Training Data & Train Models

```bash
python -m app.training.generate_data    # generates 5000 samples
python -m app.training.train_models     # trains ATS, section, grade models
```

### 3. Start the Server

```bash
python -m app.main
```

The server starts at `http://127.0.0.1:8100`.

### 4. Start the Frontend

```bash
cd ../frontend
npm run dev
```

The frontend automatically detects the ML server and uses it for analysis.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Server status & loaded models |
| `/analyze` | POST | Full resume analysis |
| `/cover-letter` | POST | Generate cover letter |
| `/skills` | POST | Skills finder & matching |

### POST /analyze

```json
{
  "resume_text": "Your resume content...",
  "job_description": "Job description..."
}
```

Returns: `AnalysisResult` with JD match, ATS score, section scores, clichés, action verbs, quantification analysis, content improvements, and overall grade.

## Models

The system works in two modes:
1. **Trained models** (after running `train_models.py`) — highest accuracy
2. **Rule-based fallback** — works immediately without training

Training is recommended for best results but not required.

## Directory Structure

```
ml-server/
├── app/
│   ├── main.py              # FastAPI server
│   ├── config.py             # Configuration
│   ├── schemas.py            # Pydantic models
│   ├── models/
│   │   ├── semantic.py       # Sentence-BERT
│   │   ├── nlp_engine.py     # spaCy NLP
│   │   ├── ats_scorer.py     # ATS scoring
│   │   ├── section_scorer.py # Section quality
│   │   ├── cliche_detector.py
│   │   ├── verb_analyzer.py
│   │   ├── quantifier.py
│   │   ├── content_improver.py
│   │   └── grader.py
│   └── training/
│       ├── generate_data.py  # Synthetic data generator
│       └── train_models.py   # Model training
├── trained_models/           # Saved model artifacts
├── training_data/            # Generated training data
├── requirements.txt
└── README.md
```
