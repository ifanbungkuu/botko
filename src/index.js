const WhatsAppWebBot = require('./bot/WhatsAppWebBot');
const logger = require('./utils/logger');

// Initialize WhatsApp bot
const whatsappBot = new WhatsAppWebBot();

// Start the bot
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

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down WhatsApp Bot...');
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
