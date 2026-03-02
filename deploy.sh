#!/bin/bash

# Скрипт автоматического деплоя Django на VDS

echo "🚀 Starting deployment..."

# Обновляем код из GitHub
git pull origin main

# Пересобираем и запускаем контейнеры
docker-compose down
docker-compose build --no-cache
docker-compose up -d

echo "✅ Deployment completed!"
echo "🌐 Site: http://$(curl -s ifconfig.me)"
echo "🔧 Admin: http://$(curl -s ifconfig.me)/admin/ (admin/admin123)"

# Показываем статус
docker-compose ps