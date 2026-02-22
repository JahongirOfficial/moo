#!/bin/bash
# Yangilanishlarni deploy qilish - 164.68.109.208
# Ishga tushirish: ssh root@164.68.109.208 'bash -s' < update-deploy-164.sh

set -e

echo "🔄 Yangilanishlarni deploy qilish: /var/www/mo"

cd /var/www/mo

# PM2 ni to'xtatish
echo "⏸️  Serverni to'xtatish..."
pm2 stop mo

# GitHub dan yangilanishlarni olish
echo "📥 GitHub dan yangilanishlarni olish..."
git pull origin main

# Dependencies yangilash
echo "📦 Dependencies yangilash..."
npm install

# Build qilish
echo "🔨 Build qilish..."
npm run build

# PM2 ni qayta ishga tushirish
echo "🚀 Serverni qayta ishga tushirish..."
pm2 restart mo

echo ""
echo "✅ Yangilanish muvaffaqiyatli o'rnatildi!"
echo "🌐 Sayt: http://164.68.109.208"
echo ""
echo "📊 Loglarni ko'rish: pm2 logs mo"
