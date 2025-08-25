# Use official Playwright image (Python + browsers + deps included)
FROM mcr.microsoft.com/playwright/python:v1.54.0-jammy

# Set working directory
WORKDIR /app

# Copy Python dependencies first (to leverage Docker cache)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code (everything in backend/ since Dockerfile is here)
COPY . .

# Create temp directory (already exists, but ensure it’s there)
RUN mkdir -p temp

# Expose the port your app listens on
EXPOSE 10000

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

# Start your backend with Gunicorn (server.py → app)
CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "2", "--timeout", "300", "server:app"]
