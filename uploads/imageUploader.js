// imageUploader.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

class ImageUploader {
    constructor() {
        this.imgbbApiKey = process.env.IMGBB_API_KEY;
        this.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
        this.cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
        this.cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET;
    }

    /**
     * Upload image to ImgBB
     * @param {string} imagePath - Path to the image file
     * @returns {Promise<string>} - URL of the uploaded image
     */
    async uploadToImgBB(imagePath) {
        if (!this.imgbbApiKey) {
            throw new Error('ImgBB API key not configured');
        }

        try {
            const form = new FormData();
            form.append('image', fs.createReadStream(imagePath));

            const response = await axios.post(
              `https://api.imgbb.com/1/upload?key=${this.imgbbApiKey}`,
              form,
              {
                  headers: form.getHeaders()
              }
            );
            const publicUrl = response.data.data.url;

            if (response.data.success) {
                return publicUrl;
            } else {
                throw new Error('Failed to upload image to ImgBB');
            }
        } catch (error) {
            console.error('ImgBB upload error:', error.message);
            throw error;
        }
    }

    /**
     * Upload image to Cloudinary
     * @param {string} imagePath - Path to the image file
     * @returns {Promise<string>} - URL of the uploaded image
     */
    async uploadToCloudinary(imagePath) {
        if (!this.cloudinaryCloudName || !this.cloudinaryApiKey || !this.cloudinaryApiSecret) {
            throw new Error('Cloudinary credentials not configured');
        }

        try {
            const form = new FormData();
            form.append('file', fs.createReadStream(imagePath));
            form.append('upload_preset', 'ml_default'); // You may need to create this in Cloudinary dashboard

            const auth = Buffer.from(`${this.cloudinaryApiKey}:${this.cloudinaryApiSecret}`).toString('base64');

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/image/upload`,
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                        'Authorization': `Basic ${auth}`
                    }
                }
            );

            return response.data.secure_url;
        } catch (error) {
            console.error('Cloudinary upload error:', error.message);
            throw error;
        }
    }

    /**
     * Upload image to temporary file hosting service
     * @param {string} imagePath - Path to the image file
     * @returns {Promise<string>} - URL of the uploaded image
     */
    async uploadToTempStorage(imagePath) {
        // Try ImgBB first
        if (this.imgbbApiKey) {
            try {
                return await this.uploadToImgBB(imagePath);
            } catch (error) {
                console.log('ImgBB upload failed, trying alternative...');
            }
        }

        // Try Cloudinary as fallback
        if (this.cloudinaryCloudName) {
            try {
                return await this.uploadToCloudinary(imagePath);
            } catch (error) {
                console.log('Cloudinary upload failed');
            }
        }

        // If no service is configured, use file.io as last resort (temporary, expires in 14 days)
        try {
            return await this.uploadToFileIO(imagePath);
        } catch (error) {
            throw new Error('No image hosting service available. Please configure ImgBB or Cloudinary.');
        }
    }

    /**
     * Upload to file.io (temporary hosting, no API key required)
     * @param {string} imagePath - Path to the image file
     * @returns {Promise<string>} - URL of the uploaded image
     */
    async uploadToFileIO(imagePath) {
        try {
            const form = new FormData();
            form.append('file', fs.createReadStream(imagePath));

            const response = await axios.post(
                'https://file.io/?expires=1d',
                form,
                {
                    headers: form.getHeaders()
                }
            );

            if (response.data.success) {
                return response.data.link;
            } else {
                throw new Error('Failed to upload to file.io');
            }
        } catch (error) {
            console.error('file.io upload error:', error.message);
            throw error;
        }
    }

    /**
     * Upload image from Buffer
     * @param {Buffer} buffer - Image buffer
     * @param {string} filename - Filename for the image
     * @returns {Promise<string>} - URL of the uploaded image
     */
    async uploadFromBuffer(buffer, filename = 'image.jpg') {
        const tempPath = `/tmp/${Date.now()}_${filename}`;
        
        try {
            // Write buffer to temporary file
            await fs.promises.writeFile(tempPath, buffer);
            
            // Upload the file
            const url = await this.uploadToTempStorage(tempPath);
            
            // Clean up temp file
            await fs.promises.unlink(tempPath);
            
            return url;
        } catch (error) {
            // Try to clean up temp file if it exists
            try {
                await fs.promises.unlink(tempPath);
            } catch (e) {
                // Ignore cleanup errors
            }
            throw error;
        }
    }
}

module.exports = ImageUploader;
