#!/bin/bash

echo "📦 Instalando dependencias..."
npm install

echo "🌐 Instalando Chromium para Puppeteer..."
npx puppeteer browsers install chrome
