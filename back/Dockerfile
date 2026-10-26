# syntax=docker/dockerfile:1

FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# gcc + libpq-dev нужны для сборки asyncpg, если нет wheel под платформу
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Зависимости — отдельным слоем, чтобы кэш работал при изменении кода
COPY requirements.txt .
RUN pip install -r requirements.txt

# Код
COPY . .

# Непривилегированный пользователь
RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

# Render по умолчанию передаёт PORT (обычно 10000),
# EXPOSE нужен только для документации / локального docker run -P
EXPOSE 8000

# exec — чтобы SIGTERM от Render доходил до uvicorn напрямую (graceful shutdown).
# ${PORT:-8000} — локально без PORT поднимется на 8000.
CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]