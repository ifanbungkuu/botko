// src/constants/messages.js
const { PRICING } = require('./');

const MENU_FREE = `Berikut adalah layanan edit foto yang tersedia:

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
Ketik angka pilihan Anda (1-9)`;

const WELCOME_PAID = `Siap bosku! 👋

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
Ketik angka pilihan Anda (1-9)`;

module.exports = {
    MENU_FREE,
    WELCOME_PAID
};
