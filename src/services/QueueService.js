const Queue = require('bull');
const { logger, logError } = require('../utils/logger');

// Create queues
const imageProcessingQueue = new Queue('image-processing', {
    redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || 'localhost',
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

// Add error handlers for the queue
imageProcessingQueue.on('error', error => {
    logError(error, { context: 'Queue Error' });
});

imageProcessingQueue.on('failed', (job, error) => {
    logError(error, { 
        context: 'Job Failed',
        jobId: job.id,
        data: job.data
    });
});

// Add success logging
imageProcessingQueue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`, {
        jobId: job.id,
        data: job.data
    });
});

// Add progress logging
imageProcessingQueue.on('progress', (job, progress) => {
    logger.info(`Job ${job.id} progress: ${progress}%`, {
        jobId: job.id,
        progress
    });
});

class QueueService {
    constructor() {
        this.imageProcessingQueue = imageProcessingQueue;
    }

    async addImageProcessingJob(data) {
        try {
            const job = await this.imageProcessingQueue.add(data);
            logger.info(`Added job ${job.id} to queue`, {
                jobId: job.id,
                data: job.data
            });
            return job;
        } catch (error) {
            const errorId = logError(error, {
                context: 'Adding Job to Queue',
                data
            });
            throw new Error(`Failed to add job to queue (Error ID: ${errorId})`);
        }
    }

    async getJobStatus(jobId) {
        try {
            const job = await this.imageProcessingQueue.getJob(jobId);
            if (!job) {
                return { status: 'not_found' };
            }
            
            const state = await job.getState();
            const progress = job._progress;
            
            return {
                id: job.id,
                status: state,
                progress,
                data: job.data,
                result: job.returnvalue,
                failedReason: job.failedReason
            };
        } catch (error) {
            const errorId = logError(error, {
                context: 'Getting Job Status',
                jobId
            });
            throw new Error(`Failed to get job status (Error ID: ${errorId})`);
        }
    }

    async cleanOldJobs() {
        try {
            // Clean completed jobs older than 1 hour
            await this.imageProcessingQueue.clean(3600000, 'completed');
            // Clean failed jobs older than 24 hours
            await this.imageProcessingQueue.clean(86400000, 'failed');
            logger.info('Cleaned old jobs from queue');
        } catch (error) {
            logError(error, { context: 'Cleaning Old Jobs' });
        }
    }
}

module.exports = new QueueService();
