"""
Hugging Face Spaces entry point — NOT used directly.
uvicorn runs app.main:app from the Dockerfile CMD.
This file is kept only for local convenience.
"""

# Entry point is: uvicorn app.main:app --host 0.0.0.0 --port 7860
# See Dockerfile CMD

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=7860)
