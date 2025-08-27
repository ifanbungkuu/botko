// filename: src/worker.js
require('dotenv').config();
const { MessageMedia } = require('whatsapp-web.js');
const imageProcessQueue = require('./queues/imageProcessQueue');
const AIImageProcessor = require('./services/AIImageProcessor');
const Watermarker = require('./utils/Watermarker');
const logger = require('./utils/logger');
const { botClient } = require('./bot/BotClient');
const { CONFIG, MESSAGES } = require('./constants');

const aiProcessor = new AIImageProcessor(CONFIG.REPLICATE_API_TOKEN);

imageProcessQueue.process(async (job) => {
  const { from, imageBase64, image1Base64, userState, isTrial, errorId } = job.data;
  
  try {
    logger.info(`Processing job ${job.id} for user ${from}`);
    
    // Siapkan data gambar untuk AI Processor
    const imageData = {
        image2: imageBase64, // Gambar kedua/utama
        image1: image1Base64, // Gambar pertama (untuk multi_image)
    };
    
    const { resultBase64, caption } = await aiProcessor.processImageBasedOnState(imageData, userState);
    
    if (!resultBase64) {
      throw new Error('AI processing returned no result.');
    }
    
    let imageBuffer = Buffer.from(resultBase64, 'base64');

    if (isTrial) {
      imageBuffer = await Watermarker.apply(imageBuffer, CONFIG.WATERMARK_TEXT);
    }
    
    const finalMedia = new MessageMedia('image/jpeg', Buffer.from(imageBuffer).toString('base64'), 'result.jpg');
    
    if (botClient.client) {
        await botClient.client.sendMessage(from, finalMedia, { caption: caption + MESSAGES.SUCCESS_SUFFIX });
        logger.info(`Successfully sent processed image to ${from}.`);
    } else {
        throw new Error("Bot client is not initialized.");
    }

  } catch (error) {
    logger.error(`Error processing job ${job.id} for ${from}:`, {
        message: error.message,
        stack: error.stack,
        errorId
    });
    if (botClient.client) {
      await botClient.client.sendMessage(from, `❌ Maaf bosku, terjadi kesalahan saat memproses foto Anda (Error ID: ${errorId}). Silakan coba lagi nanti atau hubungi admin.`);
    }
    throw error;
  }
});

logger.info("Image processing worker started and listening for jobs...");