const path = require('path');
require('dotenv').config();

// Main configuration
exports.CONFIG = {
    SESSION_PATH: path.join(__dirname, '../../whatsapp-session/session'),
    USER_DATA_PATH: path.join(__dirname, '../../user_data.json'),
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    ADMIN_NUMBER: process.env.ADMIN_NUMBER || '6281241000250@c.us',
    WATERMARK_TEXT: process.env.WATERMARK_TEXT || 'Design By Anak Morowali',
    DOKU_CLIENT_ID: process.env.DOKU_CLIENT_ID,
    DOKU_SECRET_KEY: process.env.DOKU_SECRET_KEY,
    DOKU_SNAP_URL: process.env.DOKU_SNAP_URL,
    DOKU_TOKEN_URL: process.env.DOKU_TOKEN_URL,
    IMGBB_API_KEY: process.env.IMGBB_API_KEY,
    IMGBB_API_ENDPOINT: process.env.IMGBB_API_ENDPOINT,
    AXIOS_TIMEOUT: 30000
};

// Pricing configuration
exports.PRICING = {
    restore: process.env.PRICE_RESTORE ? parseInt(process.env.PRICE_RESTORE) : 15000,
    character: process.env.PRICE_CHARACTER ? parseInt(process.env.PRICE_CHARACTER) : 20000,
    professional: process.env.PRICE_PROFESSIONAL ? parseInt(process.env.PRICE_PROFESSIONAL) : 20000,
    realistic: process.env.PRICE_REALISTIC ? parseInt(process.env.PRICE_REALISTIC) : 25000,
    remove_background: process.env.PRICE_REMOVE_BACKGROUND ? parseInt(process.env.PRICE_REMOVE_BACKGROUND) : 15000,
    transform_image: process.env.PRICE_TRANSFORM_IMAGE ? parseInt(process.env.PRICE_TRANSFORM_IMAGE) : 20000,
    multi_image: process.env.PRICE_MULTI_IMAGE ? parseInt(process.env.PRICE_MULTI_IMAGE) : 25000,
    edit_image: process.env.PRICE_EDIT_IMAGE ? parseInt(process.env.PRICE_EDIT_IMAGE) : 20000,
    colorize_image: process.env.PRICE_COLORIZE_IMAGE ? parseInt(process.env.PRICE_COLORIZE_IMAGE) : 15000,

    // Subscription packages
    basic: {
        price: 75000,
        quota: 100,
        features: ['restore', 'remove_background', 'colorize_image']
    },
    pro: {
        price: 199000,
        quota: 300,
        features: ['restore', 'remove_background', 'colorize_image', 'professional', 'transform_image', 'edit_image']
    },
    premium: {
        price: 399000,
        quota: 500,
        features: ['restore', 'remove_background', 'colorize_image', 'professional', 'transform_image', 'edit_image', 'realistic', 'multi_image', 'character']
    }
};

// Menu options enum
exports.MENU_OPTIONS = Object.freeze({
    MAIN: 'MAIN',
    RESTORE: 'RESTORE',
    CHARACTER: 'CHARACTER',
    PROFESSIONAL: 'PROFESSIONAL',
    REALISTIC: 'REALISTIC',
    REMOVE_BACKGROUND: 'REMOVE_BACKGROUND',
    TRANSFORM_IMAGE: 'TRANSFORM_IMAGE',
    MULTI_IMAGE: 'MULTI_IMAGE',
    EDIT_IMAGE: 'EDIT_IMAGE',
    COLORIZE_IMAGE: 'COLORIZE_IMAGE'
});

// Waiting states enum
exports.WAITING_STATES = Object.freeze({
    DESCRIPTION: 'description',
    COLOR: 'color',
    GENDER: 'gender',
    IMAGE: 'image',
    IMAGE_2: 'image_2'
});

// Export messages
exports.MESSAGES = require('./messages');
