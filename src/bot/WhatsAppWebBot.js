// filename: src/bot/WhatsAppWebBot.js
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { CONFIG } = require('../constants');
const MessageHandler = require('./MessageHandler');
const UserDataManager = require('../models/UserDataManager');
const logger = require('../utils/logger');
const { botClient } = require('./BotClient');

class WhatsAppWebBot {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({ dataPath: CONFIG.SESSION_PATH }),
            puppeteer: { 
                headless: true, 
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            }
        });
        
        botClient.client = this.client;
        
        this.userDataManager = new UserDataManager(CONFIG.USER_DATA_PATH);
        // Hapus imageProcessor dari sini, karena sudah tidak digunakan di MessageHandler
        this.messageHandler = new MessageHandler(this.client, this.userDataManager);
        
        this._setupEventHandlers();
    }

    _setupEventHandlers() {
        this.client.on('qr', (qr) => {
            logger.info('QR Code received, please scan.');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('loading_screen', (percent, message) => {
            logger.info(`LOADING SCREEN ${percent}%: ${message}`);
        });

        this.client.on('ready', async () => {
            await this.userDataManager.load();
            logger.info('WhatsApp Web Bot is ready!');
        });

        this.client.on('message', async (message) => {
            if (message.from === 'status@broadcast') {
                return;
            }
            try {
                await this.messageHandler.handleMessage(message);
            } catch (error) {
                logger.error('Unhandled error in handleMessage:', {
                    message: error.message,
                    stack: error.stack
                });
            }
        });

        this.client.on('disconnected', (reason) => {
            logger.warn('Client was logged out', reason);
        });

        this.client.on('auth_failure', (error) => {
            logger.error('Authentication failure:', error);
        });
    }

    async start() {
        logger.info('Starting WhatsApp Web Bot...');
        await this.client.initialize();
    }
}

module.exports = WhatsAppWebBot;