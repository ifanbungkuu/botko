// src/services/ImageStorageService.js
const axios = require('axios');
const FormData = require('form-data');

class ImageStorageService {
    constructor(apiKey, apiEndpoint) {
        this.apiKey = apiKey;
        this.apiEndpoint = apiEndpoint;
        this.uploadedImages = new Map(); // Simpan ID gambar untuk dihapus nanti
    }

    async uploadImage(base64Image, expiration = 600) { // Default 10 menit
        try {
            const formData = new FormData();
            formData.append('key', this.apiKey);
            formData.append('image', base64Image);
            formData.append('expiration', expiration); // Dalam detik

            const response = await axios.post(this.apiEndpoint, formData, {
                headers: formData.getHeaders()
            });

            if (response.data.success) {
                const imageData = response.data.data;
                // Simpan ID gambar untuk dihapus nanti
                this.uploadedImages.set(imageData.url, {
                    delete_url: imageData.delete_url,
                    timestamp: Date.now()
                });
                return imageData.url;
            } else {
                throw new Error('Failed to upload image to IMGBB');
            }
        } catch (error) {
            console.error('Error uploading image to IMGBB:', error);
            throw error;
        }
    }

    async deleteImage(imageUrl) {
        try {
            const imageData = this.uploadedImages.get(imageUrl);
            if (imageData && imageData.delete_url) {
                // ImgBB menyediakan delete_url yang bisa langsung diakses untuk menghapus gambar
                await axios.get(imageData.delete_url);
                this.uploadedImages.delete(imageUrl);
                console.log('✅ Image deleted from IMGBB:', imageUrl);
            }
        } catch (error) {
            console.error('Error deleting image from IMGBB:', error);
        }
    }

    // Bersihkan gambar yang sudah expired (lebih dari expiration time)
    async cleanup() {
        const now = Date.now();
        for (const [url, data] of this.uploadedImages.entries()) {
            if (now - data.timestamp > data.expiration * 1000) {
                await this.deleteImage(url);
            }
        }
    }

    // Jalankan cleanup secara periodik (setiap 5 menit)
    startCleanupInterval() {
        setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
}

module.exports = ImageStorageService;
