const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const { paymentEvents } = require('./services/EventManager');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Verifikasi signature dari DOKU
function verifySignature(requestBody, signature) {
    const digest = crypto
        .createHash('sha256')
        .update(JSON.stringify(requestBody))
        .digest('base64');
        
    const expectedSignature = crypto
        .createHmac('sha256', process.env.DOKU_SHARED_KEY)
        .update(digest)
        .digest('base64');
        
    return signature === `HMACSHA256=${expectedSignature}`;
}

// Handler untuk notifikasi pembayaran dari DOKU
app.post('/api/payment/doku/notify', (req, res) => {
    try {
        const signature = req.headers['signature'];
        
        // Verifikasi signature
        if (!verifySignature(req.body, signature)) {
            console.error('Invalid signature');
            return res.status(400).json({ status: 'error', message: 'Invalid signature' });
        }

        const { order: { invoice_number }, transaction: { status } } = req.body;

        console.log(`Payment notification received for order ${invoice_number}: ${status}`);

        // Emit payment event
        if (status === 'SUCCESS' || status === 'PAID') {
            paymentEvents.emit('payment.success', {
                orderId: invoice_number,
                status: status,
                data: req.body
            });
        } else if (status === 'FAILED' || status === 'EXPIRED') {
            paymentEvents.emit('payment.failed', {
                orderId: invoice_number,
                status: status,
                data: req.body
            });
        }

        return res.json({ status: 'success' });
    } catch (error) {
        console.error('Error processing payment notification:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Handler untuk redirect setelah pembayaran
app.get('/api/payment/doku/callback', (req, res) => {
    const { order_id, status } = req.query;
    
    // Redirect ke halaman sukses atau gagal
    if (status === 'success') {
        res.send(`
            <html>
                <body>
                    <h1>Pembayaran Berhasil</h1>
                    <p>Order ID: ${order_id}</p>
                    <p>Silakan kembali ke WhatsApp untuk melanjutkan proses.</p>
                </body>
            </html>
        `);
    } else {
        res.send(`
            <html>
                <body>
                    <h1>Pembayaran Gagal</h1>
                    <p>Order ID: ${order_id}</p>
                    <p>Silakan coba lagi atau hubungi admin untuk bantuan.</p>
                </body>
            </html>
        `);
    }
});

const PORT = process.env.PAYMENT_PORT || 3002; // Changed port to 3002
app.listen(PORT, () => {
    console.log(`Payment server listening on port ${PORT}`);
});
