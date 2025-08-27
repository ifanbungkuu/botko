const fs = require('fs').promises;

class UserDataManager {
    constructor(filePath) {
        this.filePath = filePath;
        this.users = {};
    }

    async load() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            this.users = JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.save();
            } else {
                console.error('Error loading user data:', error);
            }
        }
    }

    async save() {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(this.users, null, 2));
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    getUser(userId) {
        if (!this.users[userId]) {
            this.users[userId] = { 
                trialCount: 0,
                pendingPayment: null,
                paymentHistory: []
            };
        }
        return this.users[userId];
    }

    useTrial(userId) {
        const user = this.getUser(userId);
        user.trialCount += 1;
        this.save();
        return user.trialCount;
    }

    getRemainingTrials(userId) {
        const user = this.getUser(userId);
        return Math.max(0, 2 - user.trialCount);
    }

    hasTrialAvailable(userId) {
        return this.getRemainingTrials(userId) > 0;
    }

    setPendingPayment(userId, service) {
        const user = this.getUser(userId);
        user.pendingPayment = { service, timestamp: Date.now() };
        this.save();
    }

    clearPendingPayment(userId) {
        const user = this.getUser(userId);
        user.pendingPayment = null;
        this.save();
    }
}

module.exports = UserDataManager;
