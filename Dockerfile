FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expose port (Fly.io will use $PORT)
EXPOSE 8000

# Run the FastAPI server (bind to $PORT for Fly.io compatibility)
CMD sh -c "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"
