import { RATE_LIMIT } from "./constants";

// In-memory store for rate limiting
// In production, use Redis for distributed rate limiting
class RateLimitStore {
  constructor() {
    this.hits = new Map();
    this.resetTimes = new Map();
  }

  increment(key) {
    const now = Date.now();
    const resetTime = this.resetTimes.get(key) || now + RATE_LIMIT.LOGIN_WINDOW_MS;

    // Reset if window has passed
    if (now > resetTime) {
      this.hits.set(key, 1);
      this.resetTimes.set(key, now + RATE_LIMIT.LOGIN_WINDOW_MS);
      return { count: 1, resetTime: now + RATE_LIMIT.LOGIN_WINDOW_MS };
    }

    // Increment counter
    const count = (this.hits.get(key) || 0) + 1;
    this.hits.set(key, count);

    return { count, resetTime };
  }

  get(key) {
    const now = Date.now();
    const resetTime = this.resetTimes.get(key);

    // Reset if window has passed
    if (resetTime && now > resetTime) {
      this.hits.delete(key);
      this.resetTimes.delete(key);
      return { count: 0, resetTime: null };
    }

    return {
      count: this.hits.get(key) || 0,
      resetTime: resetTime || null,
    };
  }

  reset(key) {
    this.hits.delete(key);
    this.resetTimes.delete(key);
  }
}

const store = new RateLimitStore();

/**
 * Rate limit middleware for API routes
 * @param {Request} request - Next.js request object
 * @param {Object} options - Rate limit options
 * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(request, options = {}) {
  const {
    max = RATE_LIMIT.LOGIN_MAX_ATTEMPTS,
    windowMs = RATE_LIMIT.LOGIN_WINDOW_MS,
    keyGenerator = (req) => {
      // Use IP address as key
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
      return `ratelimit:${ip}`;
    },
  } = options;

  const key = keyGenerator(request);
  const { count, resetTime } = store.increment(key);

  const allowed = count <= max;
  const remaining = Math.max(0, max - count);

  return {
    allowed,
    remaining,
    resetTime,
    retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 0,
  };
}

/**
 * Reset rate limit for a specific key
 */
export function resetRateLimit(key) {
  store.reset(key);
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(request, options = {}) {
  const {
    max = RATE_LIMIT.LOGIN_MAX_ATTEMPTS,
    keyGenerator = (req) => {
      const forwarded = req.headers.get("x-forwarded-for");
      const ip = forwarded ? forwarded.split(",")[0] : req.headers.get("x-real-ip") || "unknown";
      return `ratelimit:${ip}`;
    },
  } = options;

  const key = keyGenerator(request);
  const { count, resetTime } = store.get(key);

  return {
    remaining: Math.max(0, max - count),
    resetTime,
    retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 0,
  };
}
