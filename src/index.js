const express = require('express');
const WhatsAppWebBot = require('./bot/WhatsAppWebBot');
const logger = require('./utils/logger');
const path = require('path');

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
    timestamp: new Date().toISOString()
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

// Reset QR code endpoint
app.post('/api/qr-reset', (req, res) => {
  const qrCodePath = path.join(__dirname, '../public/qrcodes/whatsapp-qr.png');
  const fs = require('fs');
  
  try {
    if (fs.existsSync(qrCodePath)) {
      fs.unlinkSync(qrCodePath);
      logger.info('QR code file deleted manually');
    }
    
    // Restart WhatsApp client to generate new QR
    if (whatsappBot && whatsappBot.client) {
      whatsappBot.client.destroy().then(() => {
        setTimeout(() => {
          whatsappBot.start().catch(error => {
            logger.error('Failed to restart bot:', error);
          });
        }, 2000);
      });
    }
    
    res.json({
      status: 'success',
      message: 'QR code direset. Bot akan menghasilkan QR code baru.'
    });
  } catch (error) {
    logger.error('Failed to reset QR code:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mereset QR code'
    });
  }
});

// Initialize WhatsApp bot
const whatsappBot = new WhatsAppWebBot();

// Start Express server
app.listen(PORT, () => {
  logger.info(`HTTP server running on port ${PORT}`);
  console.log(`Server is running on port ${PORT}`);
  
  // Start WhatsApp bot after server is running
  whatsappBot.start()
    .then(() => {
      logger.info('WhatsApp Bot started successfully');
      console.log('WhatsApp Bot is running...');
    })
    .catch((error) => {
      logger.error('Failed to start WhatsApp Bot:', error);
      console.error('Error starting bot:', error);
      process.exit(1);
    });
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down WhatsApp Bot and server...');
  console.log('Shutting down...');
  try {
    // Gracefully destroy the client
    if (whatsappBot.client) {
      await whatsappBot.client.destroy();
    }
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});
