const fs = require('fs').promises;
const { PRICING } = require('../constants'); // Import PRICING to get package details

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
                paymentHistory: [],
                package: null, // e.g., 'basic', 'pro', 'premium'
                quota: 0,
                packageExpiry: null, // ISO 8601 date
                state: null,
                waitingFor: null,
                description: null,
                backgroundColor: null,
                gender: null,
                image1: null,
                isPaid: false
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

    setPendingPayment(userId, paymentDetails) {
        const user = this.getUser(userId);
        user.pendingPayment = { ...paymentDetails, timestamp: Date.now() };
        this.save();
    }

    clearPendingPayment(userId) {
        const user = this.getUser(userId);
        if (user.pendingPayment) {
            const packageName = user.pendingPayment.package;
            if (packageName && PRICING[packageName]) {
                this.setPackage(userId, packageName);
            }
            user.paymentHistory.push(user.pendingPayment);
            user.pendingPayment = null;
            user.isPaid = true; // This might need to be re-evaluated.
                           // isPaid might mean they have an active package.
            this.save();
        }
    }

    setPackage(userId, packageName) {
        const user = this.getUser(userId);
        const packageDetails = PRICING[packageName];
        if (packageDetails) {
            user.package = packageName;
            user.quota = packageDetails.quota;
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            user.packageExpiry = expiryDate.toISOString();
            this.save();
        }
    }

    useQuota(userId) {
        const user = this.getUser(userId);
        if (user.quota > 0) {
            user.quota -= 1;
            this.save();
            return true;
        }
        return false;
    }

    hasQuota(userId) {
        const user = this.getUser(userId);
        // Also check for package expiry
        if (user.packageExpiry && new Date(user.packageExpiry) < new Date()) {
            return false; // Package expired
        }
        return user.quota > 0;
    }

    hasFeature(userId, feature) {
        const user = this.getUser(userId);
        if (this.hasTrialAvailable(userId)) {
            return true; // All features available during trial
        }
        if (user.package && PRICING[user.package]) {
            return PRICING[user.package].features.includes(feature);
        }
        return false;
    }

    // ... rest of the methods ...
    // State management methods
    setState(userId, state) {
        const user = this.getUser(userId);
        user.state = state;
        this.save();
    }

    setWaitingFor(userId, waitingFor) {
        const user = this.getUser(userId);
        user.waitingFor = waitingFor;
        this.save();
    }

    setDescription(userId, description) {
        const user = this.getUser(userId);
        user.description = description;
        this.save();
    }

    setImage1(userId, image1) {
        const user = this.getUser(userId);
        user.image1 = image1;
        this.save();
    }

    clearState(userId) {
        const user = this.getUser(userId);
        user.state = null;
        user.waitingFor = null;
        user.description = null;
        user.backgroundColor = null;
        user.gender = null;
        user.image1 = null;
        this.save();
    }

    // Payment status methods
    isPaid(userId) {
        const user = this.getUser(userId);
        return user.isPaid;
    }

    setPaid(userId, isPaid = true) {
        const user = this.getUser(userId);
        user.isPaid = isPaid;
        this.save();
    }

    // Get complete state
    getState(userId) {
        const user = this.getUser(userId);
        return {
            state: user.state,
            waitingFor: user.waitingFor,
            description: user.description,
            backgroundColor: user.backgroundColor,
            gender: user.gender,
            image1: user.image1,
            isPaid: user.isPaid
        };
    }
}

module.exports = UserDataManager;