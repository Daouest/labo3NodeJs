import HttpContext from './httpContext.js';
import * as serverVariables from "./serverVariables.js";
let repositoryCachesExpirationTime = serverVariables.get("main.repository.CacheExpirationTime");

export default class CachedRequestsManager {
    static cache = new Map();

    static startCachedRequestsCleaner() {
        setInterval(this.flushExpired, repositoryCachesExpirationTime * 1000);
    }

    static add(url, content, ETag = null) {
        if (!this.cache.has(url)) {
            console.log("Setting to cache...");
            const timestamp = Date.now();
            this?.cache.set(url, { "content": content, "etag": ETag, "timestamp": timestamp });
            console.log(this.cache);
        }

    }

    static find(url) {
        return this?.cache.get(url);
    }

    static clear(url) {
        console.log("Clearing from cache...");
        this?.cache.delete(url);
        console.log(`Cleared from cache: ${url}`);
    }

    static flushExpired() {
        const now = Date.now();
        for (const [url, { timestamp }] of this.cache.entries()) {
            if (now - timestamp >= repositoryCachesExpirationTime) { // 5 minutes
                this.cache.delete(url);
                console.log(`Flushed from cache: ${url}`);
            }
        }
    }

    static get(httpContext) {
        console.log("getting from cache...");
        const url = httpContext.req.url;
        const cacheEntry = this.find(url);
        if (cacheEntry) {
            console.log("cache entry found")
            const { content, ETag } = cacheEntry;
            httpContext.response.JSON(content, ETag, true);
            return true;
        } else {
            console.log("cache entry not found")
            return false;
        }
    }
}