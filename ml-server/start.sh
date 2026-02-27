#!/bin/bash

# Quick start script for local ML server testing

echo "🚀 Resumelyze ML Server - Quick Start"
echo "======================================"
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate venv
echo "🔧 Activating virtual environment..."
source venv/bin/activate || . venv/Scripts/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Download spaCy model
echo "📚 Downloading spaCy model..."
python -m spacy download en_core_web_sm

echo ""
echo "✅ Setup complete!"
echo ""
echo "🏃 Starting ML server on http://127.0.0.1:8100..."
echo ""

# Start server
python -m app.main
