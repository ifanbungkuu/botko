// filename: src/services/AIImageProcessor.js
const Replicate = require('replicate');
const logger = require('../utils/logger');

class AIImageProcessor {
    constructor(replicateApiToken) {
        this.replicate = new Replicate({
            auth: replicateApiToken,
        });
    }

    // Fungsi helper untuk mengekstrak URL dari output Replicate
    _extractOutputUrl(output, serviceName) {
        if (!output) {
            throw new Error(`No output from ${serviceName}`);
        }
        const url = Array.isArray(output) ? output[0] : output;
        if (typeof url !== 'string') {
            throw new Error(`Unexpected output format from ${serviceName}: ${JSON.stringify(output)}`);
        }
        return url;
    }

    // Fungsi untuk memanggil Replicate dan mengembalikan hasilnya sebagai Base64
    async _runModelAndGetBase64(model, input, serviceName) {
        logger.info(`Running AI model: ${serviceName}`);
        
        // Mengirim gambar sebagai data URI base64
        const output = await this.replicate.run(model, { input });
        const resultUrl = this._extractOutputUrl(output, serviceName);
        
        // Replicate tidak menyediakan hasil dalam base64 secara langsung,
        // jadi kita tetap perlu mengunduhnya. Namun, kita tidak perlu perantara ImgBB.
        const axios = require('axios');
        const response = await axios.get(resultUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data, 'binary').toString('base64');
    }

    async processImageBasedOnState(imageBase64, userState) {
        const state = userState.state;
        let resultBase64, caption;

        const dataUri = `data:image/jpeg;base64,${imageBase64}`;
        
        switch (state) {
            case 'restore':
                resultBase64 = await this._runModelAndGetBase64("microsoft/bringing-old-photos-back-to-life:c75db81db6cbd809d216a824832e40327cb376d32349c849d543ea23c467a165", { image: dataUri, realesrgan_model: 'RealESRGAN_x2plus', realesrgan_disable_scratch: false }, 'Restore');
                caption = 'Ini hasilnya bosku! 🎉\n\n✨ Foto berhasil diperbaiki!';
                break;
            // ... (kasus lainnya disesuaikan untuk mengirim dataUri)
            case 'remove_background':
                resultBase64 = await this._runModelAndGetBase64("cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003", { image: dataUri }, 'Remove Background');
                caption = 'Ini hasilnya bosku! 🎉\n\n🖼️ Background berhasil dihapus!';
                break;
            // Tambahkan case lain sesuai kebutuhan
            default:
                throw new Error(`Invalid state: ${state}`);
        }
        
        return { resultBase64, caption };
    }
}

module.exports = AIImageProcessor;