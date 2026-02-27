"""
Hugging Face Spaces entry point for Resumelyze ML Server.
This file is required by HF Spaces to launch the FastAPI app.
"""

from app.main import app

# Hugging Face Spaces will automatically run this with uvicorn
# No need for manual uvicorn.run() — just import the app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
