require('dotenv').config();

// Constants for configuration
exports.CONFIG = {
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    IMGBB_API_KEY: process.env.IMGBB_API_KEY,
    IMGBB_API_ENDPOINT: process.env.IMGBB_API_ENDPOINT,
    AXIOS_TIMEOUT: 30000,
    SESSION_PATH: './whatsapp-session',
    ADMIN_NUMBER: process.env.ADMIN_NUMBER || '6281241000250@c.us',
    USER_DATA_PATH: './user_data.json',
    WATERMARK_TEXT: process.env.WATERMARK_TEXT || 'Design By Anak Morowali',
    DOKU_SNAP_URL: process.env.DOKU_SNAP_URL,
    DOKU_TOKEN_URL: process.env.DOKU_TOKEN_URL
};

// Pricing configuration
exports.PRICING = {
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
    MAIN: 'main',
    RESTORE: 'restore',
    CHARACTER: 'character',
    PROFESSIONAL: 'professional',
    REALISTIC: 'realistic',
    REMOVE_BACKGROUND: 'remove_background',
    TRANSFORM_IMAGE: 'transform_image',
    MULTI_IMAGE: 'multi_image',
    EDIT_IMAGE: 'edit_image',
    COLORIZE_IMAGE: 'colorize_image'
});

// Waiting states enum
exports.WAITING_STATES = Object.freeze({
    DESCRIPTION: 'description',
    COLOR: 'color',
    GENDER: 'gender',
    IMAGE: 'image',
    IMAGE_2: 'image_2'
});

// Message templates
exports.MESSAGES = Object.freeze({
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
    
    WELCOME_PAID: `Trial gratis Anda sudah habis. Silakan pilih paket berlangganan untuk melanjutkan:

🟢 Paket Basic
📸 Kuota: 100 gambar / bulan
✨ Fitur:
- Restore Image
- Remove Background
- Colorize Image
💰 Harga: Rp 75.000 / bulan
🎯 Cocok untuk: pengguna casual, coba-coba edit, hapus background, atau memulihkan foto lama.

🔵 Paket Pro
📸 Kuota: 300 gambar / bulan
✨ Fitur:
- Semua fitur Paket Basic
- Professional Headshot
- Transform Image
- Edit Image
💰 Harga: Rp 199.000 / bulan
🎯 Cocok untuk: pekerja kreatif, freelancer, desainer, hingga konten kreator yang butuh hasil lebih profesional.

🔴 Paket Premium
📸 Kuota: 500 gambar / bulan
✨ Fitur Lengkap:
- Semua fitur Basic & Pro
- Realistic Image (AI)
- Multi Image Combine
- Character Image (Ideogram AI)
💰 Harga: Rp 399.000 / bulan
🎯 Cocok untuk: bisnis, studio kreatif, agensi, atau user yang sering produksi konten dalam jumlah besar.

Ketik *basic*, *pro*, atau *premium* untuk memilih paket.`,
    
    INVALID_SELECTION: 'Mohon pilih angka sesuai menu yang tersedia bosku 🙏',
    PROCESSING: '⏳ Sedang memproses foto bosku, mohon tunggu...', 
    SUCCESS_SUFFIX: '\n\nKetik "bosku" untuk edit foto lainnya',
    PAYMENT_PROMPT: (price, paymentLink) => `Untuk melanjutkan, silakan lakukan pembayaran sebesar Rp ${price} melalui link pembayaran berikut:\n\n💳 Link Pembayaran: ${paymentLink}\n\nPembayaran akan diverifikasi secara otomatis setelah Anda menyelesaikan transaksi.`, 
    PAYMENT_SUCCESS: '✅ Pembayaran Anda telah berhasil! Silakan kirim foto yang ingin diproses.',
    PAYMENT_FAILED: '❌ Pembayaran tidak berhasil. Silakan coba lagi atau hubungi admin untuk bantuan.'
});