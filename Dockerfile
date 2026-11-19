# ClauseLens backend — container image (tuned for Render's free tier)
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# System libraries used by docling / poppler parsers
RUN apt-get update && apt-get install -y --no-install-recommends \
        libglib2.0-0 \
        poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
# Note: on the target (ARM) host this resolves to CPU-only torch wheels,
# keeping the image lean; no CUDA build is pulled on aarch64.
RUN pip install -r backend/requirements.txt

# App source + prebuilt indices (no re-ingestion needed on cold start)
COPY backend/src ./backend/src
COPY backend/data/indices ./backend/data/indices

EXPOSE 8000
CMD ["sh", "-c", "uvicorn backend.src.api.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
