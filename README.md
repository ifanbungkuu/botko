# WhatsApp Photo Editor Bot with QRIS Payment

## Features

- Photo restoration and enhancement
- Character image generation
- Professional headshot creation
- Realistic image generation
- Background removal
- Image transformation
- Multi-image combination
- Image editing with prompts
- Photo colorization
- Payment integration with DOKU QRIS
- Trial system with watermarking

## Recent Updates

1. **Improved Error Handling and Logging**
   - Structured logging with Winston
   - Error tracking with unique IDs
   - Better error messages for users
   - Log rotation and management

2. **Queue System Implementation**
   - Redis-based queue with Bull
   - Handles concurrent requests efficiently
   - Prevents timeout issues
   - Separate worker process for image processing

3. **Testing Infrastructure**
   - Jest test suite
   - Unit tests for core services
   - Mocked external dependencies
   - Test coverage reporting

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configurations.

3. Start Redis server (required for queue system)

4. Start the services:
```bash
# Start the main WhatsApp bot
npm start

# Start the worker process
npm run worker

# Start the payment server
npm run payment

# Start ngrok for payment webhooks
npm run ngrok
```

## Testing

Run the test suite:
```bash
npm test
```

For test coverage:
```bash
npm test -- --coverage
```

## Project Structure

```
.
├── src/
│   ├── bot/
│   │   └── WhatsAppWebBot.js
│   ├── config/
│   │   ├── config.js
│   │   └── messages.js
│   ├── controllers/
│   │   └── MessageHandler.js
│   ├── models/
│   │   ├── constants.js
│   │   └── UserState.js
│   ├── services/
│   │   ├── AIImageProcessor.js
│   │   ├── ImageStorageService.js
│   │   ├── UserDataManager.js
│   │   ├── dokuPaymentService.js
│   │   └── QueueService.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── Watermarker.js
│   ├── workers/
│   │   └── ImageProcessingWorker.js
│   ├── index.js
│   ├── worker.js
│   └── paymentServer.js
├── tests/
│   ├── unit/
│   │   ├── UserDataManager.test.js
│   │   └── ImageStorageService.test.js
│   ├── fixtures/
│   └── setup.js
├── logs/
├── uploads/
└── whatsapp-session/
```

## Contributing

1. Create a new branch for your feature
2. Write tests for new functionality
3. Ensure all tests pass
4. Submit a pull request

## License

MIT
