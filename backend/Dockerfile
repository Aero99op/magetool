FROM python:3.11-slim as preparer

# This stage is responsible for finding requirements.txt
# regardless of the build context (root vs backend directory)
WORKDIR /preparer
COPY . .

# Logic to find requirements.txt
# 1. If in root of context (standard for backend context), use it.
# 2. If in backend/ subdirectory (standard for root context), use it.
# 3. Create empty if not found to prevent build failure (though it should exist).
RUN if [ -f "requirements.txt" ]; then \
    cp requirements.txt /requirements.txt; \
    elif [ -f "backend/requirements.txt" ]; then \
    cp backend/requirements.txt /requirements.txt; \
    else \
    echo "No requirements.txt found!" && exit 1; \
    fi

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

# Copy requirements from preparer stage
COPY --from=preparer /requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
# We copy everything, then fix directory structure if needed
COPY . .

# Fix for nested backend folder structure when building from root context
# If 'backend' directory exists, move its contents to root of /app
RUN if [ -d "backend" ]; then cp -rn backend/* . && rm -rf backend; fi

# Create temp directory
RUN mkdir -p /app/temp && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import os, httpx; port = os.environ.get('PORT', '8000'); httpx.get(f'http://localhost:{port}/health/live')" || exit 1

# Run the application
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
