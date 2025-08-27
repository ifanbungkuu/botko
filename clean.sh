#!/bin/bash

# Hapus file-file yang tidak digunakan
rm -rf auth_info_baileys
rm -f src/index.js test-kirim.js

# Buat struktur folder yang diperlukan
mkdir -p uploads/original
mkdir -p uploads/processed
mkdir -p uploads/thumbnails
mkdir -p whatsapp-session

# Hapus file cache dan temporary
rm -rf whatsapp-session/*

# Bersihkan node_modules dan install ulang dependensi
rm -rf node_modules
rm -f package-lock.json
npm install

echo "Pembersihan proyek selesai!"
