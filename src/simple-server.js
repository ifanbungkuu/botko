const express = require('express');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve QR code images
app.use('/qrcodes', express.static(path.join(__dirname, '../public/qrcodes')));

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'WhatsApp Photo Editor Bot is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'whatsapp-photo-editor-bot',
    time: new Date().toISOString()
  });
});

// QR code display endpoint
app.get('/qrcode', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/qrcode.html'));
});

// QR code status API endpoint
app.get('/api/qr-status', (req, res) => {
  const qrCodePath = path.join(__dirname, '../public/qrcodes/whatsapp-qr.png');
  const fs = require('fs');
  
  if (fs.existsSync(qrCodePath)) {
    const stats = fs.statSync(qrCodePath);
    res.json({
      status: 'available',
      lastUpdated: stats.mtime,
      message: 'QR code tersedia untuk di-scan'
    });
  } else {
    res.json({
      status: 'unavailable',
      message: 'QR code belum tersedia. Bot sedang memulai...'
    });
  }
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Server started successfully!');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  process.exit(0);
});
