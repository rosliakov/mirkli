#!/bin/bash

# Скрипт первоначальной настройки VDS для Django проекта

echo "🔧 Setting up VDS server for Django..."

# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем необходимые пакеты
apt install -y \
    docker.io \
    docker-compose \
    git \
    curl \
    ufw \
    htop \
    nano

# Запускаем Docker
systemctl start docker
systemctl enable docker

# Добавляем пользователя в группу docker
usermod -aG docker $USER

# Настраиваем firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Клонируем проект
cd /opt
git clone https://github.com/rosliakov/mirkli.git
cd mirkli

# Делаем скрипт деплоя исполняемым
chmod +x deploy.sh

# Первый запуск
echo "🚀 Starting first deployment..."
docker-compose up -d

echo "✅ Server setup completed!"
echo ""
echo "🌐 Your site: http://$(curl -s ifconfig.me)"
echo "🔧 Admin panel: http://$(curl -s ifconfig.me)/admin/"
echo "📋 Login: admin / Password: admin123"
echo ""
echo "📁 Project location: /opt/mirkli"
echo "🔄 To update: cd /opt/mirkli && ./deploy.sh"