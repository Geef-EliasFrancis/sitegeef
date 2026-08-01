#!/bin/bash

# GEEF Site Deploy Script
# Executa no servidor VPS para fazer deploy da nova versão.

set -e

echo "🚀 Starting deployment..."
echo "📍 Working directory: $(pwd)"

echo "⬇️  Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main

echo "⚙️  Validating environment..."
if [ ! -f ".env.local" ]; then
  echo "❌ .env.local not found. Provision deployment secrets outside Git before deploying."
  exit 1
fi

for required_var in NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY SUPABASE_SERVICE_ROLE_KEY; do
  if ! grep -q "^${required_var}=" .env.local; then
    echo "❌ Missing ${required_var} in .env.local"
    exit 1
  fi
done
echo "✅ Environment variables are provisioned"

echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit

echo "🔨 Building the application..."
npm run build
if [ ! -d ".next/standalone" ]; then
  echo "❌ Build failed: .next/standalone not found"
  exit 1
fi
echo "✅ Build successful"

echo "🛑 Stopping current application..."
pm2 stop sitegeef || true
sleep 2

echo "▶️  Starting application with PM2..."
pm2 delete sitegeef || true
pm2 start npm --name "sitegeef" -- run start:standalone
sleep 3

echo "📊 PM2 Status:"
pm2 status

echo "🔄 Configuring PM2 auto-startup..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true
pm2 save

echo ""
echo "🏥 Health Check:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3500 | grep -q "200\|301\|302"; then
  echo "✅ Server is running and responding on port 3500"
else
  echo "⚠️  Server not responding yet (may still be starting)"
fi

echo ""
echo "🎉 Deployment successful!"
echo "📝 Application logs: pm2 logs sitegeef"
echo "📊 Monitor: pm2 monit"
