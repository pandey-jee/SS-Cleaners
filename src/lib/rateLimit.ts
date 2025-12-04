/**
 * Client-side rate limiting to prevent spam and brute force attacks
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if action is rate limited
 * @param key - Unique identifier for the action (e.g., 'contact-form', 'login-user@email.com')
 * @param config - Rate limit configuration
 * @returns Object with isBlocked status and remaining time
 */
export function checkRateLimit(key: string, config: RateLimitConfig): {
  isBlocked: boolean;
  remainingTime?: number;
  attemptsLeft?: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Check if currently blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      isBlocked: true,
      remainingTime: Math.ceil((entry.blockedUntil - now) / 1000)
    };
  }

  // Check if window has expired - reset if so
  if (entry && now - entry.firstAttempt > config.windowMs) {
    rateLimitStore.delete(key);
    return {
      isBlocked: false,
      attemptsLeft: config.maxAttempts
    };
  }

  // Check attempts within window
  if (entry) {
    const attemptsLeft = config.maxAttempts - entry.attempts;
    
    if (entry.attempts >= config.maxAttempts) {
      // Block the user
      const blockDuration = config.blockDurationMs || config.windowMs * 2;
      entry.blockedUntil = now + blockDuration;
      rateLimitStore.set(key, entry);
      
      return {
        isBlocked: true,
        remainingTime: Math.ceil(blockDuration / 1000)
      };
    }

    return {
      isBlocked: false,
      attemptsLeft
    };
  }

  return {
    isBlocked: false,
    attemptsLeft: config.maxAttempts
  };
}

/**
 * Record an attempt
 * @param key - Unique identifier for the action
 */
export function recordAttempt(key: string): void {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (entry) {
    entry.attempts++;
    rateLimitStore.set(key, entry);
  } else {
    rateLimitStore.set(key, {
      attempts: 1,
      firstAttempt: now
    });
  }
}

/**
 * Reset rate limit for a key (e.g., after successful action)
 * @param key - Unique identifier for the action
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Clean up old entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.firstAttempt > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up every hour
setInterval(cleanupRateLimits, 60 * 60 * 1000);

// Rate limit configurations
export const RATE_LIMITS = {
  CONTACT_FORM: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000 // 1 hour block
  },
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000 // 30 minutes block
  },
  CHAT_MESSAGE: {
    maxAttempts: 20,
    windowMs: 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000 // 5 minutes block
  }
};
