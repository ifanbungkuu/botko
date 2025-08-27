// filename: src/services/dokuPaymentService.js
require('dotenv').config();
const axios = require("axios");
const crypto = require("crypto");

// Load environment variables
const DOKU_API_URL = process.env.DOKU_API_URL;
const CLIENT_ID = process.env.DOKU_CLIENT_ID;
const SHARED_KEY = process.env.DOKU_SHARED_KEY; // biasanya dipakai validasi callback
const SECRET_KEY = process.env.DOKU_SECRET_KEY;

console.log('🔧 Loading DOKU configuration:');
console.log('DOKU_API_URL:', DOKU_API_URL);
console.log('CLIENT_ID:', CLIENT_ID);
console.log('SHARED_KEY:', SHARED_KEY ? '[SET]' : '[EMPTY]');
console.log('SECRET_KEY:', SECRET_KEY ? '[SET]' : '[EMPTY]');

// Generate Signature
function generateSignature(path, method, requestId, requestBody, requestTimestamp) {
  try {
    const bodyString = JSON.stringify(requestBody);
    const digest = crypto
      .createHash("sha256")
      .update(bodyString)
      .digest("base64");

    const component = 
      `Client-Id:${CLIENT_ID}\n` +
      `Request-Id:${requestId}\n` +
      `Request-Timestamp:${requestTimestamp}\n` +
      `Request-Target:${path}\n` +
      `Digest:${digest}`;

    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(component)
      .digest("base64");

    return signature;
  } catch (error) {
    console.error('❌ Error generating signature:', error);
    throw error;
  }
}

// Create Payment Link
async function createPaymentLink(orderId, amount, customer) {
  try {
    if (!DOKU_API_URL || !CLIENT_ID || !SECRET_KEY) {
      throw new Error('Konfigurasi DOKU belum lengkap. Periksa file .env');
    }

    if (!orderId || !amount || !customer) {
      throw new Error('Parameter tidak lengkap: orderId, amount, dan customer diperlukan');
    }

    if (!customer.name || !customer.email || !customer.phone) {
      throw new Error('Data customer tidak lengkap: name, email, dan phone diperlukan');
    }

    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const requestTimestamp = new Date().toISOString().split('.')[0] + "Z"; 

    const path = "/checkout/v1/payment";
    const url = `${DOKU_API_URL}${path}`;

    // Format amount jadi string tanpa desimal
    const formattedAmount = String(amount);

    // Body request sesuai dokumen DOKU
    const body = {
      order: {
        invoice_number: orderId,
        amount: formattedAmount
      },
      customer: {
        name: customer.name,
        email: customer.email || `${customer.phone}@whatsapp.user`,
        phone: customer.phone.replace(/\D/g, '')
      },
      payment: {
        payment_due_date: 60 // menit
      },
      callback_url: process.env.DOKU_CALLBACK_URL,
      return_url: process.env.DOKU_CALLBACK_URL
    };

    // Generate signature
    const signature = generateSignature(path, "POST", requestId, body, requestTimestamp);

    const headers = {
      "Client-Id": CLIENT_ID,
      "Request-Id": requestId,
      "Request-Timestamp": requestTimestamp,
      "Signature": `HMACSHA256=${signature}`,
      "Content-Type": "application/json"
    };

    console.log('🔄 Mengirim permintaan ke DOKU API...');
    console.log('URL:', url);
    console.log('Headers:', headers);
    console.log('Body:', JSON.stringify(body, null, 2));

    const response = await axios.post(url, body, { 
      headers,
      timeout: 30000,
      validateStatus: false 
    });

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));

    // Ambil link pembayaran dari berbagai kemungkinan field
    let paymentLink = null;

    if (response.data?.payment_url) {
      paymentLink = response.data.payment_url;
    } else if (response.data?.redirect_url) {
      paymentLink = response.data.redirect_url;
    } else if (response.data?.response?.payment?.url) {
      paymentLink = response.data.response.payment.url;
    }

    if (!paymentLink) {
      console.error("📦 Full response (debug):", JSON.stringify(response.data, null, 2));
      throw new Error('Response DOKU tidak valid: link pembayaran tidak ditemukan');
    }

    console.log('✅ Link pembayaran berhasil dibuat:', paymentLink);

    // return data + payment_link biar gampang dipakai
    return {
      ...response.data,
      payment_link: paymentLink
    };

  } catch (error) {
    console.error('❌ Error dalam membuat link pembayaran:', error.message);
    if (error.response) {
      console.error('Response error:', error.response.data);
    }
    throw error;
  }
}

module.exports = { createPaymentLink };
