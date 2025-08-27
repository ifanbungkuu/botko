const path = require('path');

const CONFIG = {
    SESSION_PATH: path.join(__dirname, '../../whatsapp-session/session'),
    USER_DATA_PATH: path.join(__dirname, '../../user_data.json'),
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    ADMIN_NUMBER: process.env.ADMIN_NUMBER,
    WATERMARK_TEXT: "Trial - Bot Restorasi Foto",
    DOKU_CLIENT_ID: process.env.DOKU_CLIENT_ID,
    DOKU_SECRET_KEY: process.env.DOKU_SECRET_KEY
};

const PRICING = {
    restore: 15000,
    character: 20000,
    professional: 20000,
    realistic: 25000,
    remove_background: 15000,
    transform_image: 20000,
    multi_image: 25000,
    edit_image: 20000,
    colorize_image: 15000
};

const MENU_OPTIONS = {
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
};

module.exports = { CONFIG, PRICING, MENU_OPTIONS };
