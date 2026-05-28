FROM python:3.11-slim

# System deps for psycopg2, pg_dump, Pillow, python-magic
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc postgresql-client libmagic1 libjpeg62-turbo-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Create directories
RUN mkdir -p uploads/avatars reports backups ml_models firmware

# Entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
