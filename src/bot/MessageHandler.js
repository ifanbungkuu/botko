// filename: src/bot/MessageHandler.js
const { v4: uuidv4 } = require('uuid');
const { createPaymentLink } = require('../services/dokuPaymentService');
const { CONFIG, MESSAGES, MENU_OPTIONS, WAITING_STATES, PRICING } = require('../config');
const UserState = require('../models/UserState');
const { paymentEvents } = require('../services/EventManager');
const imageProcessQueue = require('../queues/imageProcessQueue');
const logger = require('../utils/logger');

class MessageHandler {
    constructor(client, userDataManager) {
        this.client = client;
        this.userDataManager = userDataManager;
        this.userStates = new Map();
        
        // Panggil metode untuk setup listener
        this.initializeEventListeners();
    }
    
    // Metode baru untuk setup event listeners
    initializeEventListeners() {
        paymentEvents.on('payment.success', this._handlePaymentSuccess.bind(this));
        paymentEvents.on('payment.failed', this._handlePaymentFailed.bind(this));
    }

    async _handlePaymentSuccess(paymentData) {
        const orderId = paymentData.orderId;
        const phone = orderId.split('_')[2];
        const userId = `${phone}@c.us`;
        
        const userData = this.userDataManager.getUser(userId);
        if (userData && userData.pendingPayment) {
            const packageName = userData.pendingPayment.package;
            this.userDataManager.clearPendingPayment(userId); // This will now also set the package
            
            await this.client.sendMessage(userId, MESSAGES.PAYMENT_SUCCESS);
            logger.info(`Payment success for user ${userId} with order ID ${orderId}. Package: ${packageName}`);

            // After successful payment, the user can start using the features.
            // We can send them the main menu again.
            await this.client.sendMessage(userId, "Pembayaran Anda berhasil! Anda sekarang dapat menggunakan fitur yang termasuk dalam paket Anda. Ketik *menu* untuk melihat daftar layanan.");
        }
    }
    
    async _handlePaymentFailed(paymentData) {
        const orderId = paymentData.orderId;
        const phone = orderId.split('_')[2];
        const userId = `${phone}@c.us`;
        
        await this.client.sendMessage(userId, MESSAGES.PAYMENT_FAILED);
        logger.warn(`Payment failed for user ${userId} with order ID ${orderId}`);
    }

    async handleMessage(message) {
        try {
            const contact = await message.getContact();
            const from = message.from;
            const messageText = message.body;
            const isImage = message.hasMedia && message.type === 'image';

            logger.info(`📨 Message received from ${contact.pushname || from}: "${messageText}"`);
            console.log(`📨 Message received from ${contact.pushname || from}: "${messageText}"`);
            
            const chat = await message.getChat();

            // Check for bosku command
            if (messageText && messageText.toLowerCase().includes('bosku')) {
                logger.info(`🎯 Handling bosku command for ${from}`);
                console.log(`🎯 Handling bosku command for ${from}`);
                return this._handleBoskuCommand(chat, from);
            }
            
            // Check for menu command
            if (messageText && messageText.toLowerCase() === 'menu') {
                logger.info(`📋 Handling menu command for ${from}`);
                console.log(`📋 Handling menu command for ${from}`);
                return this._handleMenuCommand(chat, from);
            }
            
            const userState = this.userStates.get(from);
            logger.info(`👤 User state for ${from}: ${userState ? JSON.stringify(userState) : 'null'}`);
            
            if (!userState) {
                logger.info(`❌ No user state found for ${from}, ignoring message`);
                console.log(`❌ No user state found for ${from}, ignoring message`);
                return;
            }
            
            if (userState.state === MENU_OPTIONS.MAIN) {
                logger.info(`🔢 Handling main menu selection for ${from}: ${messageText}`);
                return this._handleMainMenu(chat, messageText, from);
            }
            
            if (messageText && !isImage) {
                logger.info(`💬 Handling text input for ${from}`);
                return this._handleTextInput(chat, messageText, userState, from);
            }
            
            if (isImage) {
                logger.info(`🖼️ Handling image input for ${from}`);
                return this._handleImageInput(message, userState);
            }
            
            logger.info(`⚠️ No handler matched for message from ${from}`);
            console.log(`⚠️ No handler matched for message from ${from}`);
            
        } catch (error) {
            logger.error(`💥 Error in handleMessage for ${message.from}:`, error);
            console.error(`💥 Error in handleMessage for ${message.from}:`, error);
        }
    }

    // ... (Fungsi _handleBoskuCommand, _handleMenuCommand, _handleMainMenu, _handleTextInput tetap sama) ...
    // Pastikan fungsi-fungsi ini ada di sini

    async _handleBoskuCommand(chat, from) {
        this.userStates.set(from, new UserState(MENU_OPTIONS.MAIN));
        await chat.sendMessage(MESSAGES.WELCOME);
        
        // Send menu after welcome message
        const remainingTrials = this.userDataManager.getRemainingTrials(from);
        
        if (remainingTrials > 0) {
            await chat.sendMessage(MESSAGES.MENU_FREE.replace('%trials%', remainingTrials));
        } else {
            await chat.sendMessage(MESSAGES.WELCOME_PAID);
        }
    }

    async _handleMenuCommand(chat, from) {
        const remainingTrials = this.userDataManager.getRemainingTrials(from);
        
        if (remainingTrials > 0) {
            return chat.sendMessage(MESSAGES.MENU_FREE.replace('%trials%', remainingTrials));
        } else {
            return chat.sendMessage(MESSAGES.WELCOME_PAID);
        }
    }

    async _handleMainMenu(chat, messageText, from) {
        const option = messageText.trim().toLowerCase(); // to handle basic, pro, premium

        // Handle package selection
        if (PRICING[option]) {
            const selectedPackage = PRICING[option];
            const price = selectedPackage.price;
            
            // Check if DOKU payment is configured
            if (!process.env.DOKU_CLIENT_ID || !process.env.DOKU_SECRET_KEY) {
                return chat.sendMessage(`📦 Paket ${option.toUpperCase()} - Rp ${price.toLocaleString('id-ID')}

⚠️ Sistem pembayaran sedang dalam maintenance. 

Untuk sementara, silakan hubungi admin untuk melakukan pembayaran manual:
📱 WhatsApp: ${CONFIG.ADMIN_NUMBER}

Setelah pembayaran dikonfirmasi, Anda akan mendapatkan akses ke semua fitur paket ${option}.`);
            }

            const contact = await chat.getContact();

            try {
                const orderId = `ORDER_${Date.now()}_${from.split('@')[0]}`;
                const customer = {
                    name: contact.name || contact.pushname || from,
                    email: `${from.split('@')[0]}@whatsapp.user`,
                    phone: from.split('@')[0]
                };

                const paymentResponse = await createPaymentLink(orderId, price, customer);
                const paymentLink =
                    paymentResponse?.payment_link ||
                    paymentResponse?.url ||
                    paymentResponse?.response?.payment?.url;

                if (paymentLink) {
                    this.userDataManager.setPendingPayment(from, {
                        package: option,
                        orderId: orderId,
                        amount: price
                    });

                    return chat.sendMessage(MESSAGES.PAYMENT_PROMPT(price, paymentLink));
                } else {
                    logger.error("❌ Response DOKU tidak berisi link:", paymentResponse);
                    throw new Error('Gagal membuat link pembayaran');
                }
            } catch (error) {
                logger.error('Error creating payment link:', error);
                return chat.sendMessage(`📦 Paket ${option.toUpperCase()} - Rp ${price.toLocaleString('id-ID')}

⚠️ Sistem pembayaran otomatis sedang bermasalah.

Silakan hubungi admin untuk pembayaran manual:
📱 WhatsApp: ${CONFIG.ADMIN_NUMBER}

Sebutkan kode order: ORDER_${Date.now()}_${from.split('@')[0]}`);
            }
        }

        const serviceMap = {
            '1': MENU_OPTIONS.RESTORE, '2': MENU_OPTIONS.CHARACTER, '3': MENU_OPTIONS.PROFESSIONAL,
            '4': MENU_OPTIONS.REALISTIC, '5': MENU_OPTIONS.REMOVE_BACKGROUND, '6': MENU_OPTIONS.TRANSFORM_IMAGE,
            '7': MENU_OPTIONS.MULTI_IMAGE, '8': MENU_OPTIONS.EDIT_IMAGE, '9': MENU_OPTIONS.COLORIZE_IMAGE
        };
        const selectedService = serviceMap[option];

        if (!selectedService) {
            return chat.sendMessage(MESSAGES.INVALID_SELECTION);
        }

        if (this.userDataManager.hasTrialAvailable(from)) {
            const simpleFlows = [MENU_OPTIONS.RESTORE, MENU_OPTIONS.REMOVE_BACKGROUND, MENU_OPTIONS.COLORIZE_IMAGE];
            if (simpleFlows.includes(selectedService)) {
                this.userStates.set(from, new UserState(selectedService, WAITING_STATES.IMAGE));
                return chat.sendMessage(`Siap bosku! Upload foto untuk layanan "${selectedService}" 📷`);
            } else {
                this.userStates.set(from, new UserState(selectedService, WAITING_STATES.DESCRIPTION));
                return chat.sendMessage(`Siap bosku! Jelaskan dulu untuk layanan "${selectedService}"...`);
            }
        } else {
            return chat.sendMessage(MESSAGES.WELCOME_PAID);
        }
    }

    async _handleTextInput(chat, messageText, userState, from) {
        if (userState.waitingFor === WAITING_STATES.DESCRIPTION) {
            userState.description = messageText;
            userState.waitingFor = userState.state === MENU_OPTIONS.MULTI_IMAGE ? WAITING_STATES.IMAGE : WAITING_STATES.IMAGE;
            this.userStates.set(from, userState);
            const msg = userState.state === MENU_OPTIONS.MULTI_IMAGE ? 'Sekarang upload foto pertama! 1️⃣' : 'Sekarang upload fotonya! 📸';
            return chat.sendMessage(msg);
        }
    }


    async _handleImageInput(message, userState) {
        const from = message.from;
        const service = userState.state;

        // Check for trial, feature access and quota
        const isTrial = this.userDataManager.hasTrialAvailable(from);
        if (!isTrial) {
            if (!this.userDataManager.hasQuota(from)) {
                await this.client.sendMessage(from, 'Kuota Anda sudah habis. Silakan beli paket baru untuk melanjutkan.');
                return this.client.sendMessage(from, MESSAGES.WELCOME_PAID);
            }
            if (!this.userDataManager.hasFeature(from, service)) {
                await this.client.sendMessage(from, `Fitur "${service}" tidak termasuk dalam paket Anda. Silakan upgrade paket Anda untuk menggunakan fitur ini.`);
                return this.client.sendMessage(from, MESSAGES.WELCOME_PAID);
            }
        }

        const errorId = uuidv4();

        try {
            const media = await message.downloadMedia();
            
            if (userState.state === MENU_OPTIONS.MULTI_IMAGE && userState.waitingFor === WAITING_STATES.IMAGE) {
                userState.image1 = media.data;
                userState.waitingFor = WAITING_STATES.IMAGE_2;
                this.userStates.set(from, userState);
                return message.reply('✅ Foto pertama diterima! Sekarang upload foto kedua! 2️⃣');
            }

            await imageProcessQueue.add({
                from,
                imageBase64: media.data,
                image1Base64: userState.image1 || null,
                userState,
                isTrial,
                errorId
            });

            await message.reply('✅ Foto Anda telah diterima dan dimasukkan ke dalam antrian untuk diproses. Mohon tunggu sebentar ya bosku...');
            
            if (isTrial) {
                this.userDataManager.useTrial(from);
            } else {
                this.userDataManager.useQuota(from);
            }

            this.userStates.delete(from);

        } catch (error) {
            logger.error(`Error adding job to queue for ${from} (Error ID: ${errorId}):`, error);
            await this.client.sendMessage(from, `❌ Maaf bosku, terjadi kesalahan saat menambahkan foto Anda ke antrian (Error ID: ${errorId}).`);
            this.userStates.delete(from);
        }
    }
}

module.exports = MessageHandler;
