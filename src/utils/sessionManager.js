const { v4: uuidv4 } = require('uuid');

/**
 * Session Manager for WhatsApp Photo Restoration Bot
 * Manages user sessions, conversation states, and restoration progress
 */
class SessionManager {
    constructor() {
        // In-memory session storage (in production, use Redis or database)
        this.sessions = new Map();
        
        // Default session timeout (30 minutes)
        this.sessionTimeout = 30 * 60 * 1000;
        
        // Clean up expired sessions periodically
        this.startCleanupInterval();
    }

    /**
     * Create a new session for a user
     * @param {string} userId - User identifier (phone number)
     * @param {Object} initialData - Initial session data
     * @returns {string} Session ID
     */
    createSession(userId, initialData = {}) {
        const sessionId = uuidv4();
        const session = {
            id: sessionId,
            userId: userId,
            createdAt: new Date(),
            lastActivity: new Date(),
            state: 'initial',
            data: {
                currentStep: 'welcome',
                restorationType: null,
                imagePath: null,
                previewPath: null,
                finalPath: null,
                paymentStatus: 'pending',
                ...initialData
            },
            history: []
        };

        this.sessions.set(sessionId, session);
        console.log(`✅ Session created: ${sessionId} for user: ${userId}`);
        return sessionId;
    }

    /**
     * Get session by ID
     * @param {string} sessionId 
     * @returns {Object|null} Session object or null if not found/expired
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        
        if (!session) {
            return null;
        }

        // Check if session is expired
        if (this.isSessionExpired(session)) {
            this.deleteSession(sessionId);
            return null;
        }

        // Update last activity
        session.lastActivity = new Date();
        return session;
    }

    /**
     * Get session by user ID
     * @param {string} userId 
     * @returns {Object|null} Session object or null if not found
     */
    getSessionByUserId(userId) {
        for (const [sessionId, session] of this.sessions) {
            if (session.userId === userId && !this.isSessionExpired(session)) {
                session.lastActivity = new Date();
                return session;
            }
        }
        return null;
    }

    /**
     * Update session data
     * @param {string} sessionId 
     * @param {Object} updates 
     * @returns {boolean} Success status
     */
    updateSession(sessionId, updates) {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        // Merge updates with existing data
        session.data = { ...session.data, ...updates };
        session.lastActivity = new Date();
        
        // Add to history
        session.history.push({
            timestamp: new Date(),
            action: 'update',
            updates: updates
        });

        return true;
    }

    /**
     * Update session state
     * @param {string} sessionId 
     * @param {string} newState 
     * @param {string} message 
     * @returns {boolean} Success status
     */
    updateSessionState(sessionId, newState, message = '') {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        const oldState = session.state;
        session.state = newState;
        session.lastActivity = new Date();

        // Add state change to history
        session.history.push({
            timestamp: new Date(),
            action: 'state_change',
            from: oldState,
            to: newState,
            message: message
        });

        console.log(`🔄 Session ${sessionId} state changed: ${oldState} -> ${newState}`);
        return true;
    }

    /**
     * Get current session state
     * @param {string} sessionId 
     * @returns {string|null} Current state or null if session not found
     */
    getSessionState(sessionId) {
        const session = this.getSession(sessionId);
        return session ? session.state : null;
    }

    /**
     * Delete session
     * @param {string} sessionId 
     * @returns {boolean} Success status
     */
    deleteSession(sessionId) {
        const existed = this.sessions.has(sessionId);
        if (existed) {
            this.sessions.delete(sessionId);
            console.log(`🗑️ Session deleted: ${sessionId}`);
        }
        return existed;
    }

    /**
     * Check if session is expired
     * @param {Object} session 
     * @returns {boolean} True if expired
     */
    isSessionExpired(session) {
        const now = new Date();
        const lastActivity = new Date(session.lastActivity);
        return (now - lastActivity) > this.sessionTimeout;
    }

    /**
     * Get all active sessions (for monitoring)
     * @returns {Array} Array of active sessions
     */
    getActiveSessions() {
        const activeSessions = [];
        
        for (const [sessionId, session] of this.sessions) {
            if (!this.isSessionExpired(session)) {
                activeSessions.push({
                    id: sessionId,
                    userId: session.userId,
                    state: session.state,
                    createdAt: session.createdAt,
                    lastActivity: session.lastActivity,
                    data: session.data
                });
            }
        }

        return activeSessions;
    }

    /**
     * Clean up expired sessions
     */
    cleanupExpiredSessions() {
        let expiredCount = 0;
        
        for (const [sessionId, session] of this.sessions) {
            if (this.isSessionExpired(session)) {
                this.sessions.delete(sessionId);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            console.log(`🧹 Cleaned up ${expiredCount} expired sessions`);
        }
    }

    /**
     * Start periodic cleanup interval
     */
    startCleanupInterval() {
        // Clean up every 5 minutes
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000);

        console.log('✅ Session cleanup interval started');
    }

    /**
     * Get session statistics
     * @returns {Object} Session statistics
     */
    getStats() {
        const totalSessions = this.sessions.size;
        let activeSessions = 0;
        const states = {};

        for (const session of this.sessions.values()) {
            if (!this.isSessionExpired(session)) {
                activeSessions++;
                states[session.state] = (states[session.state] || 0) + 1;
            }
        }

        return {
            totalSessions,
            activeSessions,
            expiredSessions: totalSessions - activeSessions,
            states
        };
    }

    /**
     * Reset session (keep user ID but clear data)
     * @param {string} sessionId 
     * @returns {boolean} Success status
     */
    resetSession(sessionId) {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        // Keep user ID but reset everything else
        const userId = session.userId;
        this.deleteSession(sessionId);
        this.createSession(userId, {
            currentStep: 'welcome',
            restorationType: null,
            imagePath: null,
            previewPath: null,
            finalPath: null,
            paymentStatus: 'pending'
        });

        return true;
    }

    /**
     * Add message to session history
     * @param {string} sessionId 
     * @param {string} message 
     * @param {string} direction - 'incoming' or 'outgoing'
     * @returns {boolean} Success status
     */
    addMessageToHistory(sessionId, message, direction = 'incoming') {
        const session = this.getSession(sessionId);
        if (!session) {
            return false;
        }

        session.history.push({
            timestamp: new Date(),
            action: 'message',
            direction: direction,
            message: message
        });

        return true;
    }

    /**
     * Get conversation history
     * @param {string} sessionId 
     * @returns {Array} Message history
     */
    getMessageHistory(sessionId) {
        const session = this.getSession(sessionId);
        if (!session) {
            return [];
        }

        return session.history.filter(item => item.action === 'message');
    }
}

// Export singleton instance
module.exports = new SessionManager();
