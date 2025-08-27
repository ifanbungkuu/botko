// filename: src/queues/imageProcessQueue.js
const Queue = require('bull');
const logger = require('../utils/logger');

// Gunakan koneksi Redis dari environment variables jika ada
const redisConfig = process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
};

const imageProcessQueue = new Queue('image-processing', {
  redis: redisConfig,
});

imageProcessQueue.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully.`);
});

imageProcessQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err);
});

module.exports = imageProcessQueue;