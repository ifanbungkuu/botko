const Queue = require('bull');
const AIImageProcessor = require('../services/AIImageProcessor');
const { CONFIG } = require('../config/config');
const { logger, logError } = require('../utils/logger');

class ImageProcessingWorker {
    constructor() {
        this.imageProcessor = new AIImageProcessor(
            CONFIG.REPLICATE_API_TOKEN,
            CONFIG.IMGBB_API_KEY,
            CONFIG.IMGBB_API_ENDPOINT
        );

        this.queue = new Queue('image-processing', {
            redis: {
                port: process.env.REDIS_PORT || 6379,
                host: process.env.REDIS_HOST || 'localhost',
            }
        });

        this._setupQueueHandlers();
    }

    _setupQueueHandlers() {
        this.queue.process(async (job) => {
            const { type, data } = job.data;
            logger.info(`Processing job ${job.id}`, { type, jobId: job.id });

            try {
                let result;
                job.progress(10);

                switch (type) {
                    case 'restore':
                        result = await this.imageProcessor.restoreImage(data.imageBase64);
                        break;
                    case 'character':
                        result = await this.imageProcessor.createCharacterImage(data.imageBase64, data.description);
                        break;
                    case 'professional':
                        result = await this.imageProcessor.createProfessionalHeadshot(
                            data.imageBase64,
                            data.gender,
                            data.backgroundColor
                        );
                        break;
                    case 'realistic':
                        result = await this.imageProcessor.createRealisticImage(data.description, data.imageBase64);
                        break;
                    case 'remove_background':
                        result = await this.imageProcessor.removeBackground(data.imageBase64);
                        break;
                    case 'transform':
                        result = await this.imageProcessor.transformImage(data.imageBase64, data.description);
                        break;
                    case 'combine':
                        result = await this.imageProcessor.combineImages(
                            data.imageBase64_1,
                            data.imageBase64_2,
                            data.description
                        );
                        break;
                    case 'edit':
                        result = await this.imageProcessor.editImage(data.imageBase64, data.description);
                        break;
                    case 'colorize':
                        result = await this.imageProcessor.colorizeImage(data.imageBase64);
                        break;
                    default:
                        throw new Error(`Unknown job type: ${type}`);
                }

                job.progress(100);
                logger.info(`Job ${job.id} completed successfully`);
                return result;

            } catch (error) {
                const errorId = logError(error, {
                    context: 'Processing Image Job',
                    jobId: job.id,
                    type
                });
                throw new Error(`Failed to process image (Error ID: ${errorId})`);
            }
        });
    }

    async start() {
        logger.info('Image processing worker started');
        // Add any initialization logic here
    }
}

// Start the worker if this file is run directly
if (require.main === module) {
    const worker = new ImageProcessingWorker();
    worker.start().catch(error => {
        logError(error, { context: 'Worker Startup' });
        process.exit(1);
    });
}

module.exports = ImageProcessingWorker;
