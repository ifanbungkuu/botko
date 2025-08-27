// src/services/EventManager.js
const EventEmitter = require('events');

class PaymentEventEmitter extends EventEmitter {}

const paymentEvents = new PaymentEventEmitter();

module.exports = { paymentEvents };
