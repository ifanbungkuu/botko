require('dotenv').config();
const WhatsAppWebBot = require('./src/bot/WhatsAppWebBot');

// =================== MAIN ===================
async function main() {
    const bot = new WhatsAppWebBot();
    await bot.start();
}

main();





const WAITING_STATES = Object.freeze({
    DESCRIPTION: 'description',
    COLOR: 'color',
    GENDER: 'gender',
    IMAGE: 'image',
    IMAGE_2: 'image_2'
});

const GENDER_MAP = Object.freeze({
    '1': 'male', 'pria': 'male', 'male': 'male',
    '2': 'female', 'wanita': 'female', 'female': 'female'
});

const COLOR_MAP = Object.freeze({
    '1': 'white', '2': 'blue', '3': 'gray', '4': 'black',
    'white': 'white', 'putih': 'white',
    'blue': 'blue', 'biru': 'blue',
    'gray': 'gray', 'abu': 'gray',
    'black': 'black', 'hitam': 'black'
});

const MESSAGES = Object.freeze({
    WELCOME: `Selamat datang di *Photo Restoration Bot* ! 👋

Kami adalah layanan edit foto professional yang menggunakan teknologi AI untuk memberikan hasil terbaik. Bot ini dapat membantu Anda dalam berbagai kebutuhan edit foto, mulai dari perbaikan foto lama, pembuatan foto profil profesional, hingga pengeditan foto kreatif.

🎁 *SPECIAL OFFER!*
Anda mendapatkan 2 kali kesempatan edit foto GRATIS untuk mencoba layanan kami!

Ketik *menu* untuk melihat daftar layanan yang tersedia.`,

    MENU_FREE: `Berikut adalah layanan edit foto yang tersedia:

1️⃣ *Perbaiki Foto Jadul/Rusak*
   - Memperjelas foto buram, memperbaiki kerusakan, dan meningkatkan kualitas foto lama.

2️⃣ *Bikin Foto Pakai Wajah Sendiri*
   - Mengganti wajah di foto lain dengan wajah Anda, cocok untuk membuat foto lucu atau fantasi.

3️⃣ *Foto Profil Profesional*
   - Membuat foto profil formal dengan latar belakang polos, cocok untuk CV atau LinkedIn.

4️⃣ *Buat Gambar Realistis*
   - Membuat gambar baru yang sangat nyata dari deskripsi teks Anda.

5️⃣ *Hapus Background Foto*
   - Menghapus latar belakang dari foto Anda, hasilnya transparan.

6️⃣ *Ubah Foto Dengan Gaya Baru*
   - Mengubah foto Anda menjadi gaya artistik lain, seperti kartun, lukisan, dll.

7️⃣ *Gabungkan Dua Foto*
   - Menggabungkan dua gambar menjadi satu sesuai dengan instruksi Anda.

8️⃣ *Edit Foto Dengan Perintah*
   - Mengubah bagian tertentu dari foto Anda menggunakan perintah teks (misal: "ganti warna baju jadi merah").

9️⃣ *Warnai Foto Hitam Putih*
   - Memberikan warna pada foto hitam putih secara otomatis.

✨ Sisa kesempatan gratis Anda: %trials% kali
Ketik angka pilihan Anda (1-9)`,
    
    WELCOME_PAID: `Siap bosku! 👋

Berikut adalah layanan edit foto yang tersedia:

1️⃣ *Perbaiki Foto Jadul/Rusak* (Rp ${PRICING.restore})
   - Memperjelas foto buram, memperbaiki kerusakan, dan meningkatkan kualitas foto lama.

2️⃣ *Bikin Foto Pakai Wajah Sendiri* (Rp ${PRICING.character})
   - Mengganti wajah di foto lain dengan wajah Anda, cocok untuk membuat foto lucu atau fantasi.

3️⃣ *Foto Profil Profesional* (Rp ${PRICING.professional})
   - Membuat foto profil formal dengan latar belakang polos, cocok untuk CV atau LinkedIn.

4️⃣ *Buat Gambar Realistis* (Rp ${PRICING.realistic})
   - Membuat gambar baru yang sangat nyata dari deskripsi teks Anda.

5️⃣ *Hapus Background Foto* (Rp ${PRICING.remove_background})
   - Menghapus latar belakang dari foto Anda, hasilnya transparan.

6️⃣ *Ubah Foto Dengan Gaya Baru* (Rp ${PRICING.transform_image})
   - Mengubah foto Anda menjadi gaya artistik lain, seperti kartun, lukisan, dll.

7️⃣ *Gabungkan Dua Foto* (Rp ${PRICING.multi_image})
   - Menggabungkan dua gambar menjadi satu sesuai dengan instruksi Anda.

8️⃣ *Edit Foto Dengan Perintah* (Rp ${PRICING.edit_image})
   - Mengubah bagian tertentu dari foto Anda menggunakan perintah teks (misal: "ganti warna baju jadi merah").

9️⃣ *Warnai Foto Hitam Putih* (Rp ${PRICING.colorize_image})
   - Memberikan warna pada foto hitam putih secara otomatis.

💰 Trial gratis Anda sudah habis. Silakan pilih layanan dan lakukan pembayaran.
Ketik angka pilihan Anda (1-9)`,
    
    START_PROMPT: 'Halo! Ketik "bosku" untuk memulai layanan edit foto 📸',
    INVALID_SELECTION: 'Mohon pilih angka sesuai menu yang tersedia bosku 🙏',
    PROCESSING: '⏳ Sedang memproses foto bosku, mohon tunggu...',
    SUCCESS_SUFFIX: '\n\nKetik "bosku" untuk edit foto lainnya',
    PAYMENT_PROMPT: (price, paymentLink) => `Trial gratis Anda sudah habis. Untuk melanjutkan, silakan lakukan pembayaran sebesar Rp ${price} melalui link pembayaran berikut:
    
� Link Pembayaran: ${paymentLink}

Pembayaran akan diverifikasi secara otomatis setelah Anda menyelesaikan transaksi.`,
    PAYMENT_INITIATED: '✅ Link pembayaran telah dibuat. Silakan klik link tersebut untuk melakukan pembayaran.',
    PAYMENT_SUCCESS: '✅ Pembayaran Anda telah berhasil! Kami akan segera memproses foto Anda...',
    PAYMENT_FAILED: '❌ Pembayaran tidak berhasil. Silakan coba lagi atau hubungi admin untuk bantuan.'
});

// =================== DATA MANAGEMENT ===================
class UserDataManager {
    constructor(filePath) {
        this.filePath = filePath;
        this.users = {};
    }

    async load() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            this.users = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.save();
            } else {
                console.error('Error loading user data:', error);
            }
        }
    }

    async save() {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    getUser(userId) {
        if (!this.users[userId]) {
            this.users[userId] = { 
                trialCount: 0,
                pendingPayment: null,
                paymentHistory: []
            };
        }
        return this.users[userId];
    }

    useTrial(userId) {
        const user = this.getUser(userId);
        user.trialCount += 1;
        this.save();
        return user.trialCount;
    }

    getRemainingTrials(userId) {
        const user = this.getUser(userId);
        return Math.max(0, 2 - user.trialCount);
    }

    hasTrialAvailable(userId) {
        return this.getRemainingTrials(userId) > 0;
    }

    setPendingPayment(userId, service) {
        const user = this.getUser(userId);
        user.pendingPayment = { service, timestamp: Date.now() };
        this.save();
    }

    clearPendingPayment(userId) {
        const user = this.getUser(userId);
        user.pendingPayment = null;
        this.save();
    }
}

// =================== IMAGE PROCESSING ===================
class Watermarker {
    static async apply(imageBuffer, text) {
        try {
            // Use Jimp properly - it might be a default export
            const JimpLib = Jimp.default || Jimp;
            const image = await JimpLib.read(imageBuffer);
            const font = await JimpLib.loadFont(JimpLib.FONT_SANS_32_WHITE);
            
            // Create text overlay with background
            const textWidth = image.bitmap.width;
            const textHeight = 60;
            const watermarkImage = new JimpLib(textWidth, textHeight, 0x00000080); // Semi-transparent black background
            
            watermarkImage.print(font, 0, 10, {
                text: text,
                alignmentX: JimpLib.HORIZONTAL_ALIGN_CENTER,
                alignmentY: JimpLib.VERTICAL_ALIGN_TOP
            }, textWidth, textHeight);

            // Composite watermark at bottom of image
            image.composite(watermarkImage, 0, image.bitmap.height - textHeight);
            
            return await image.getBufferAsync(JimpLib.MIME_JPEG);
        } catch (error) {
            console.error("Error applying watermark:", error);
            // Return original image if watermarking fails
            return imageBuffer;
        }
    }
}


// =================== CLASSES ===================
class UserState {
    constructor(state, waitingFor = null, description = null, backgroundColor = null, gender = null, image1 = null) {
        this.state = state;
        this.waitingFor = waitingFor;
        this.description = description;
        this.backgroundColor = backgroundColor;
        this.gender = gender;
        this.image1 = image1;
    }
}

class AIImageProcessor {
    constructor(replicateApiToken) {
        this.replicate = new Replicate({
            auth: replicateApiToken
        });
    }

    async restoreImage(imageBase64) {
        console.log('🔧 Using Flux Restore Image for photo restoration...');
        const output = await this.replicate.run("flux-kontext-apps/restore-image", { input: { input_image: `data:image/jpeg;base64,${imageBase64}`, upscale: 2, face_enhance: true, background_enhance: true, codeformer_fidelity: 0.5 } });
        return this._extractOutputUrl(output, 'Flux Restore');
    }

    async createCharacterImage(imageBase64, prompt) {
        console.log('🎨 Creating character image with Ideogram...');
        const output = await this.replicate.run("ideogram-ai/ideogram-character", { input: { prompt: prompt, character_reference_image: `data:image/jpeg;base64,${imageBase64}`, num_outputs: 1, aspect_ratio: "1:1", negative_prompt: "low quality, bad anatomy, blurry" } });
        return this._extractOutputUrl(output, 'Ideogram');
    }

    async createProfessionalHeadshot(imageBase64, gender, backgroundColor = "white") {
        console.log('💼 Creating professional headshot...');
        const output = await this.replicate.run("flux-kontext-apps/professional-headshot", { input: { input_image: `data:image/jpeg;base64,${imageBase64}`, gender: gender, aspect_ratio: "1:1", background_color: backgroundColor } });
        return this._extractOutputUrl(output, 'Professional Headshot');
    }

    async createRealisticImage(prompt, referenceImageBase64 = null) {
        if (referenceImageBase64) {
            console.log('✨ Creating realistic image with Gen4 (with reference)...');
            const input = { prompt: prompt, aspect_ratio: "1:1", num_outputs: 1, reference_images: [`data:image/jpeg;base64,${referenceImageBase64}`] };
            const tags = prompt.match(/@(\w+)/g);
            if (tags) { input.reference_tags = tags.map(tag => tag.substring(1)); }
            const output = await this.replicate.run("runwayml/gen4-image-turbo", { input });
            return this._extractOutputUrl(output, 'Gen4');
        } else {
            console.log('✨ Creating realistic image with SDXL (text-only)...');
            const output = await this.replicate.run("stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b", { input: { prompt: prompt } });
            return this._extractOutputUrl(output, 'SDXL');
        }
    }

    async removeBackground(imageBase64) {
        console.log('🖼️ Removing background with Modnet...');
        const output = await this.replicate.run("pollinations/modnet:da7d45f3b836795f945f221fc0b01a6d3ab7f5e163f13208948ad436001e2255", { input: { image: `data:image/jpeg;base64,${imageBase64}` } });
        return this._extractOutputUrl(output, 'Modnet');
    }

    async transformImage(imageBase64, prompt) {
        console.log('🎨 Transforming image with Flux Kontext Pro...');
        const output = await this.replicate.run("black-forest-labs/flux-kontext-pro", { input: { prompt: prompt, input_image: `data:image/jpeg;base64,${imageBase64}`, output_format: "jpg" } });
        return this._extractOutputUrl(output, 'Flux Kontext Pro');
    }

    async combineImages(imageBase64_1, imageBase64_2, prompt) {
        console.log('🖼️ Combining two images...');
        const output = await this.replicate.run("flux-kontext-apps/multi-image-kontext-pro", { input: { prompt: prompt, input_image_1: `data:image/jpeg;base64,${imageBase64_1}`, input_image_2: `data:image/jpeg;base64,${imageBase64_2}`, output_format: "jpg" } });
        return this._extractOutputUrl(output, 'Multi Image Kontext Pro');
    }

    async editImage(imageBase64, prompt) {
        console.log('✍️ Editing image with Qwen...');
        const output = await this.replicate.run("qwen/qwen-image-edit", { input: { image: `data:image/jpeg;base64,${imageBase64}`, prompt: prompt, output_quality: 90, output_format: "jpg" } });
        return this._extractOutputUrl(output, 'Qwen Image Edit');
    }

    async colorizeImage(imageBase64) {
        console.log('🎨 Colorizing image with DDColor...');
        const output = await this.replicate.run("piddnad/ddcolor:ca494ba129e44e45f661d6ece83c4c98a9a7c774309beca01429b58fce8aa695", { input: { image: `data:image/jpeg;base64,${imageBase64}` } });
        return this._extractOutputUrl(output, 'DDColor');
    }

    _extractOutputUrl(output, serviceName) {
        if (Array.isArray(output)) { return output[0]; }
        if (typeof output === 'string') { return output; }
        if (output && output.url) { return typeof output.url === 'function' ? output.url() : output.url; }
        throw new Error(`Unexpected output format from ${serviceName}`);
    }
}

class MessageHandler {
    constructor(client, imageProcessor, userDataManager) {
        this.client = client;
        this.imageProcessor = imageProcessor;
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
        
        // Kirim pesan selamat datang
        await chat.sendMessage(MESSAGES.WELCOME);
        return;
    }

    async _handleMenuCommand(chat) {
        const from = chat.id._serialized;
        const remainingTrials = this.userDataManager.getRemainingTrials(from);
        
        if (remainingTrials > 0) {
            // Jika masih punya kesempatan gratis
            return chat.sendMessage(MESSAGES.MENU_FREE.replace('%trials%', remainingTrials));
        } else {
            // Jika kesempatan gratis habis
            return chat.sendMessage(MESSAGES.WELCOME_PAID);
        }
    }

    async _handleMainMenu(chat, messageText, from) {
        const option = messageText.trim();
        const serviceMap = {
            '1': MENU_OPTIONS.RESTORE, '2': MENU_OPTIONS.CHARACTER, '3': MENU_OPTIONS.PROFESSIONAL,
            '4': MENU_OPTIONS.REALISTIC, '5': MENU_OPTIONS.REMOVE_BACKGROUND, '6': MENU_OPTIONS.TRANSFORM_IMAGE,
            '7': MENU_OPTIONS.MULTI_IMAGE, '8': MENU_OPTIONS.EDIT_IMAGE, '9': MENU_OPTIONS.COLORIZE_IMAGE
        };
        const selectedService = serviceMap[option];

        if (!selectedService) {
            return chat.sendMessage(MESSAGES.INVALID_SELECTION);
        }

        const userData = this.userDataManager.getUser(from);
        if (userData.trialUsed) {
            const price = PRICING[selectedService];
            const contact = await chat.getContact();
            
            // Buat payment link melalui DOKU
            try {
                const orderId = `ORDER_${Date.now()}_${from.split('@')[0]}`;
                const customer = {
                    name: contact.name || contact.pushname || from,
                    email: `${from.split('@')[0]}@whatsapp.user`,
                    phone: from.split('@')[0]
                };
                
                const paymentResponse = await createPaymentLink(orderId, price, customer);
                
                if (paymentResponse && paymentResponse.payment_url) {
                    this.userDataManager.setPendingPayment(from, {
                        service: selectedService,
                        orderId: orderId,
                        amount: price
                    });
                    
                    this.userStates.set(from, new UserState(selectedService));
                    return chat.sendMessage(MESSAGES.PAYMENT_PROMPT(price, paymentResponse.payment_url));
                } else {
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
            userState.waitingFor = userState.state === MENU_OPTIONS.MULTI_IMAGE ? WAITING_STATES.IMAGE : WAITING_STATES.IMAGE;
            this.userStates.set(from, userState);
            const msg = userState.state === MENU_OPTIONS.MULTI_IMAGE ? 'Sekarang upload foto pertama! 1️⃣' : 'Sekarang upload fotonya! 📸';
            return chat.sendMessage(msg);
        }
        // Other text inputs like gender, color etc. can be added here if needed
    }

    async _handleImageInput(chat, message, userState, from) {
        // Cek status pembayaran dari DOKU jika diperlukan
        const userData = this.userDataManager.getUser(from);
        if (userData.pendingPayment && !userState.isPaid) {
            await chat.sendMessage('Mohon selesaikan pembayaran terlebih dahulu sebelum mengirim foto.');
            return;
        }

        try {
            const media = await message.downloadMedia();
            const imageBase64 = media.data;
            const userData = this.userDataManager.getUser(from);
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
        let resultUrl, caption;
        const state = userState.state;
        
        switch (state) {
            case MENU_OPTIONS.RESTORE:
                resultUrl = await this.imageProcessor.restoreImage(imageBase64);
                caption = 'Ini hasilnya bosku! 🎉\n\n✨ Foto berhasil diperbaiki!';
                break;
            case MENU_OPTIONS.CHARACTER:
                resultUrl = await this.imageProcessor.createCharacterImage(imageBase64, userState.description);
                caption = 'Ini hasilnya bosku! 🎉\n\n🎨 Foto karakter berhasil dibuat!';
                break;
            case MENU_OPTIONS.PROFESSIONAL:
                resultUrl = await this.imageProcessor.createProfessionalHeadshot(imageBase64, userState.gender, userState.backgroundColor);
                caption = `Ini hasilnya bosku! 🎉\n\n🖼️ Foto profesional berhasil dibuat!`;
                break;
            case MENU_OPTIONS.REALISTIC:
                resultUrl = await this.imageProcessor.createRealisticImage(userState.description, imageBase64);
                caption = 'Ini hasilnya bosku! 🎉\n\n✨ Gambar realistis berhasil dibuat!';
                break;
            case MENU_OPTIONS.REMOVE_BACKGROUND:
                resultUrl = await this.imageProcessor.removeBackground(imageBase64);
                caption = 'Ini hasilnya bosku! 🎉\n\n🖼️ Background berhasil dihapus!';
                break;
            case MENU_OPTIONS.TRANSFORM_IMAGE:
                resultUrl = await this.imageProcessor.transformImage(imageBase64, userState.description);
                caption = 'Ini hasilnya bosku! 🎉\n\n🎨 Foto berhasil diubah!';
                break;
            case MENU_OPTIONS.MULTI_IMAGE:
                resultUrl = await this.imageProcessor.combineImages(userState.image1, imageBase64, userState.description);
                caption = 'Ini hasilnya bosku! 🎉\n\n🖼️+🖼️ Foto berhasil digabungkan!';
                break;
            case MENU_OPTIONS.EDIT_IMAGE:
                resultUrl = await this.imageProcessor.editImage(imageBase64, userState.description);
                caption = 'Ini hasilnya bosku! 🎉\n\n✍️ Foto berhasil diedit!';
                break;
            case MENU_OPTIONS.COLORIZE_IMAGE:
                resultUrl = await this.imageProcessor.colorizeImage(imageBase64);
                caption = 'Ini hasilnya bosku! 🎉\n\n🎨 Foto berhasil diwarnai!';
                break;
            default:
                throw new Error('Invalid state');
        }
        
        return { resultUrl, caption };
    }

    async _handleError(chat, error, from) {
        console.error('❌ Error processing:', error);
        await chat.sendMessage(`❌ Maaf bosku, terjadi kesalahan: ${error.message}\n\nSilakan coba lagi dengan mengetik "bosku"`);
        this.userStates.delete(from);
    }
}

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
        
        this.imageProcessor = new AIImageProcessor(CONFIG.REPLICATE_API_TOKEN);
        this.userDataManager = new UserDataManager(CONFIG.USER_DATA_PATH);
        this.messageHandler = new MessageHandler(this.client, this.imageProcessor, this.userDataManager);
        
        this._setupEventHandlers();
    }

    _setupEventHandlers() {
        this.client.on('qr', (qr) => {
            console.log('📱 QR Code received. Silakan scan QR code berikut:');
            qrcode.generate(qr, { small: true });
            console.log('Menunggu scan QR code...');
        });

        this.client.on('loading_screen', (percent, message) => {
            console.log('LOADING SCREEN', percent, message);
        });

        this.client.on('ready', async () => {
            await this.userDataManager.load();
            console.log('✅ WhatsApp Web Bot ready!');
        });

        this.client.on('message', async (message) => {
            try {
                await this.messageHandler.handleMessage(message);
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        this.client.on('disconnected', (reason) => {
            console.log('Client was logged out', reason);
        });

        this.client.on('auth_failure', (error) => {
            console.error('Authentication failure:', error);
        });
    }

    async start() {
        try {
            console.log('🚀 Starting WhatsApp Web Bot...');
            await this.client.initialize();
        } catch (error) {
            console.error('Failed to start bot:', error);
        }
    }
}

// =================== MAIN ===================
async function main() {
    const bot = new WhatsAppWebBot();
    await bot.start();
}

main();
