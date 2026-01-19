FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ghostscript \
    poppler-utils \
    imagemagick \
    tesseract-ocr \
    libmagic1 \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Create non-root user
RUN useradd --create-home --shell /bin/bash appuser

# Copy requirements and install Python dependencies
# Copy requirements (Universal Copy Trick)
# Handles both "root context" (backend/requirements.txt) and "backend context" (./requirements.txt)
COPY requirements.tx[t] backend/requirements.tx[t] ./
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; else echo "requirements.txt not found, checking subfolder" && mv backend/requirements.txt . && pip install --no-cache-dir -r requirements.txt; fi || pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .
# Final check to move files if they were copied into a nested backend/ folder
RUN if [ -d "backend" ]; then cp -rn backend/* . && rm -rf backend; fi

# Create temp directory
RUN mkdir -p /app/temp && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health/live')" || exit 1

# Run the application
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
