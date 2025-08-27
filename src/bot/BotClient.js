// filename: src/bot/BotClient.js

// Objek ini akan menyimpan instance client WhatsApp yang sudah diinisialisasi
// agar bisa diakses oleh worker.
const botClient = {
  client: null,
};

module.exports = { botClient };