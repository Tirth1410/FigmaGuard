
FROM mcr.microsoft.com/playwright/python:v1.55.0-jammy


WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p temp

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:10000/health || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "--workers", "2", "--timeout", "300", "server:app"]
