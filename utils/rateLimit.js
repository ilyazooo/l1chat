const rateLimitWindowMs = 60 * 60 * 1000;
const maxAttempts = 5;

const rateLimitStorage = new Map();

async function checkRateLimit(ipAddress) {
    const entry = rateLimitStorage.get(ipAddress);
    if (!entry || Date.now() - entry.lastAttemptTime > rateLimitWindowMs) {
        return false; 
    }
    return entry.attempts >= maxAttempts;
}

async function incrementRateLimit(ipAddress) {
    const entry = rateLimitStorage.get(ipAddress) || { attempts: 0, lastAttemptTime: 0 };
    entry.attempts++;
    entry.lastAttemptTime = Date.now();
    rateLimitStorage.set(ipAddress, entry);
}

export { checkRateLimit, incrementRateLimit };
