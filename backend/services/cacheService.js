// services/cacheService.js
const store = new Map();

function setCache(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function getCache(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
    }
    return entry.value;
}

function deleteCache(key) {
    store.delete(key);
}

function clearExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of store) {
        if (now > entry.expiresAt) store.delete(key);
    }
}

function getCacheStats() {
    return { size: store.size };
}

const interval = setInterval(clearExpiredCache, 5 * 60 * 1000);
if (interval.unref) interval.unref();

module.exports = { setCache, getCache, deleteCache, clearExpiredCache, getCacheStats };
