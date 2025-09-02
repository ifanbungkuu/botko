const { MessageMedia } = require('whatsapp-web.js');
const { MESSAGES, CONFIG, MENU_OPTIONS, PRICING, WAITING_STATES } = require('../config');
const { createPaymentLink } = require('../services/dokuPaymentService');
const Watermarker = require('../services/Watermarker');
const UserState = require('../models/UserState');

class MessageHandler {
    constructor(client, userDataManager) {
        this.client = client;
        this.userDataManager = userDataManager;
        this.userStates = new Map();
    }

    async handleMessage(message) {
        const contact = await message.getContact();
        const chat = await message.getChat();
        const from = message.from;
        const messageText = message.body;
        const isImage = message.hasMedia && message.type === 'image';
        
        console.log(`📨 Message from ${contact.name || contact.pushname || from}: ${messageText}`);

        // Admin commands
        if (from === CONFIG.ADMIN_NUMBER && messageText.toUpperCase().startsWith('APPROVE')) {
            return this._handleAdminApproval(messageText);
        }
        
        if (messageText.toLowerCase().includes('bosku')) {
            return this._handleBoskuCommand(chat);
        }
        
        if (messageText.toLowerCase() === 'menu') {
            return this._handleMenuCommand(chat);
        }
        
        const userState = this.userStates.get(from);
        
        if (!userState) {
            return; // Do nothing if no active conversation and message is not "bosku"
        }
        
        if (userState.state === MENU_OPTIONS.MAIN) {
            return this._handleMainMenu(chat, messageText, from);
        }
        
        if (messageText && !isImage) {
            return this._handleTextInput(chat, messageText, userState, from);
        }
        
        if (isImage) {
            return this._handleImageInput(chat, message, userState, from);
        }
    }

    async _handleAdminApproval(messageText) {
        const parts = messageText.split(' ');
        if (parts.length < 2) return;
        const targetUser = parts[1].includes('@') ? parts[1] : `${parts[1]}@c.us`;
        
        const userData = this.userDataManager.getUser(targetUser);
        if (userData && userData.pendingPayment) {
            const pendingService = userData.pendingPayment.service;
            this.userDataManager.clearPendingPayment(targetUser);
            
            const userState = this.userStates.get(targetUser);
            if (userState) {
                userState.isPaid = true;
                this.userStates.set(targetUser, userState);
                await this.client.sendMessage(targetUser, MESSAGES.PROCESS_APPROVED);
                // Re-trigger image processing
                this._processImageBasedOnState(userState.lastImage, userState, false)
                    .then(async ({ resultUrl, caption }) => {
                        const resultMedia = await MessageMedia.fromUrl(resultUrl);
                        await this.client.sendMessage(targetUser, resultMedia, { caption: caption + MESSAGES.SUCCESS_SUFFIX });
                        this.userStates.delete(targetUser);
                    })
                    .catch(async (error) => {
                        await this._handleError({ sendMessage: (msg) => this.client.sendMessage(targetUser, msg) }, error, targetUser);
                    });
            }
        }
    }

    async _handleBoskuCommand(chat) {
        const from = chat.id._serialized;
        this.userStates.set(from, new UserState(MENU_OPTIONS.MAIN));
        await chat.sendMessage(MESSAGES.WELCOME);
    }

    async _handleMenuCommand(chat) {
        const from = chat.id._serialized;
        const remainingTrials = this.userDataManager.getRemainingTrials(from);
        
        if (remainingTrials > 0) {
            return chat.sendMessage(MESSAGES.MENU_FREE.replace('%trials%', remainingTrials));
        } else {
            return chat.sendMessage(MESSAGES.WELCOME_PAID);
        }
    }

    async _handleMainMenu(chat, messageText, from) {
        const option = messageText.trim();
        const serviceMap = {
            '1': MENU_OPTIONS.RESTORE,
            '2': MENU_OPTIONS.CHARACTER,
            '3': MENU_OPTIONS.PROFESSIONAL,
            '4': MENU_OPTIONS.REALISTIC,
            '5': MENU_OPTIONS.REMOVE_BACKGROUND,
            '6': MENU_OPTIONS.TRANSFORM_IMAGE,
            '7': MENU_OPTIONS.MULTI_IMAGE,
            '8': MENU_OPTIONS.EDIT_IMAGE,
            '9': MENU_OPTIONS.COLORIZE_IMAGE
        };
        const selectedService = serviceMap[option];

        if (!selectedService) {
            return chat.sendMessage(MESSAGES.INVALID_SELECTION);
        }

        const userData = this.userDataManager.getUser(from);
        if (userData.trialUsed) {
            const price = PRICING[selectedService];
            const contact = await chat.getContact();
            
            try {
                const orderId = `ORDER_${Date.now()}_${from.split('@')[0]}`;
                const customer = {
                    name: contact.name || contact.pushname || from,
                    email: `${from.split('@')[0]}@whatsapp.user`,
                    phone: from.split('@')[0]
                };
                
                const paymentResponse = await createPaymentLink(orderId, price, customer);

                // Ambil link dari semua kemungkinan field
                const paymentLink =
                    paymentResponse?.payment_link ||
                    paymentResponse?.url ||
                    paymentResponse?.response?.payment?.url;

                if (paymentLink) {
                    this.userDataManager.setPendingPayment(from, {
                        service: selectedService,
                        orderId: orderId,
                        amount: price
                    });
                    
                    this.userStates.set(from, new UserState(selectedService));
                    return chat.sendMessage(MESSAGES.PAYMENT_PROMPT(price, paymentLink));
                } else {
                    console.error("❌ Response DOKU tidak berisi link:", paymentResponse);
                    throw new Error('Gagal membuat link pembayaran');
                }
            } catch (error) {
                console.error('Error creating payment link:', error);
                return chat.sendMessage('Maaf, terjadi kesalahan dalam membuat link pembayaran. Silakan coba lagi nanti.');
            }
        }

        // Proceed with trial
        const simpleFlows = [MENU_OPTIONS.RESTORE, MENU_OPTIONS.REMOVE_BACKGROUND, MENU_OPTIONS.COLORIZE_IMAGE];
        if (simpleFlows.includes(selectedService)) {
            this.userStates.set(from, new UserState(selectedService, WAITING_STATES.IMAGE));
            return chat.sendMessage(`Siap bosku! Upload foto untuk layanan "${selectedService}" 📷`);
        } else {
            this.userStates.set(from, new UserState(selectedService, WAITING_STATES.DESCRIPTION));
            return chat.sendMessage(`Siap bosku! Jelaskan dulu untuk layanan "${selectedService}"...`);
        }
    }

    async _handleTextInput(chat, messageText, userState, from) {
        if (userState.waitingFor === WAITING_STATES.DESCRIPTION) {
            userState.description = messageText;
            userState.waitingFor = WAITING_STATES.IMAGE;
            this.userStates.set(from, userState);
            const msg = userState.state === MENU_OPTIONS.MULTI_IMAGE ? 'Sekarang upload foto pertama! 1️⃣' : 'Sekarang upload fotonya! 📸';
            return chat.sendMessage(msg);
        }
    }

    async _handleImageInput(chat, message, userState, from) {
        const userData = this.userDataManager.getUser(from);
        if (userData.pendingPayment && !userState.isPaid) {
            await chat.sendMessage('Mohon selesaikan pembayaran terlebih dahulu sebelum mengirim foto.');
            return;
        }

        try {
            const media = await message.downloadMedia();
            const imageBase64 = media.data;
            const isTrial = !userData.trialUsed;

            if (userState.state === MENU_OPTIONS.MULTI_IMAGE) {
                if (userState.waitingFor === WAITING_STATES.IMAGE) {
                    userState.image1 = imageBase64;
                    userState.waitingFor = WAITING_STATES.IMAGE_2;
                    this.userStates.set(from, userState);
                    return chat.sendMessage('✅ Foto pertama diterima! Sekarang upload foto kedua! 2️⃣');
                }
            }

            await chat.sendMessage(MESSAGES.PROCESSING);
            
            const { resultUrl, caption } = await this._processImageBasedOnState(imageBase64, userState);
            
            await chat.sendMessage('✅ AI selesai memproses! Mengunduh hasil...');
            
            const resultMedia = await MessageMedia.fromUrl(resultUrl);
            let imageBuffer = Buffer.from(resultMedia.data, 'base64');

            if (isTrial) {
                imageBuffer = await Watermarker.apply(imageBuffer, CONFIG.WATERMARK_TEXT);
                this.userDataManager.useTrial(from);
            }
            
            const finalMedia = new MessageMedia('image/jpeg', Buffer.from(imageBuffer).toString('base64'), 'result.jpg');
            await chat.sendMessage(finalMedia, { caption: caption + MESSAGES.SUCCESS_SUFFIX });
            
            this.userStates.delete(from);
            console.log('✅ Process completed successfully');
            
        } catch (error) {
            await this._handleError(chat, error, from);
        }
    }

    async _processImageBasedOnState(imageBase64, userState) {
        // Placeholder: proses AI kamu taruh di sini
        return {
            resultUrl: "https://placehold.co/600x400",
            caption: "Ini hasilnya bosku! 🎉\n\n✨ (Demo result)"
        };
    }

    async _handleError(chat, error, from) {
        console.error('❌ Error processing:', error);
        await chat.sendMessage(`❌ Maaf bosku, terjadi kesalahan: ${error.message}\n\nSilakan coba lagi dengan mengetik "bosku"`);
        this.userStates.delete(from);
    }
}

module.exports = MessageHandler;
