const express = require('express');
const WhatsAppWebBot = require('./bot/WhatsAppWebBot');
const logger = require('./utils/logger');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

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
