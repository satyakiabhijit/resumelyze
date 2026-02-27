@echo off
REM Quick start script for local ML server testing (Windows)

echo.
echo 🚀 Resumelyze ML Server - Quick Start
echo ======================================
echo.

REM Check if venv exists
if not exist "venv\" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate venv
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Download spaCy model
echo 📚 Downloading spaCy model...
python -m spacy download en_core_web_sm

echo.
echo ✅ Setup complete!
echo.
echo 🏃 Starting ML server on http://127.0.0.1:8100...
echo.

REM Start server
python -m app.main
