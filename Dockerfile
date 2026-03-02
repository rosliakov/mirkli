FROM python:3.12-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копирование requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование проекта
COPY backend/ .

# Создание статических файлов
RUN python manage.py collectstatic --noinput

# Создание пользователя для безопасности
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]