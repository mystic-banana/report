// Rate limiting utilities for edge functions

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: Request) => string; // Custom key generator
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export class RateLimitExceeded extends Error {
  public retryAfter: number;

  constructor(retryAfter: number) {
    super("Rate limit exceeded");
    this.retryAfter = retryAfter;
    this.name = "RateLimitExceeded";
  }
}

// Default rate limit configurations
export const RATE_LIMITS = {
  // General API calls
  DEFAULT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
  },

  // AI-powered report generation (more expensive)
  AI_REPORTS: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 reports per hour for free users
  },

  // Premium AI reports
  AI_REPORTS_PREMIUM: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50, // 50 reports per hour for premium users
  },

  // Daily horoscopes
  HOROSCOPES: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 20, // 20 horoscope requests per day
  },

  // Chart generation
  CHARTS: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 charts per hour
  },
};

// Generate rate limit key from request
function generateKey(req: Request, customKey?: string): string {
  // Try to get user ID from JWT token
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      // Simple JWT decode (just for user ID, not verification)
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.sub) {
        return customKey
          ? `${customKey}:user:${payload.sub}`
          : `user:${payload.sub}`;
      }
    } catch (error) {
      console.warn("Failed to decode JWT for rate limiting:", error);
    }
  }

  // Fallback to IP address
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return customKey ? `${customKey}:ip:${ip}` : `ip:${ip}`;
}

// Check and update rate limit
export function checkRateLimit(
  req: Request,
  config: RateLimitConfig,
  customKey?: string,
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
} {
  const key = config.keyGenerator
    ? config.keyGenerator(req)
    : generateKey(req, customKey);
  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = rateLimitStore.get(key);

  // Clean up or initialize entry
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

// Middleware function for rate limiting
export function withRateLimit(config: RateLimitConfig, customKey?: string) {
  return (req: Request): Response | null => {
    const result = checkRateLimit(req, config, customKey);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `Too many requests. Try again in ${result.retryAfter} seconds.`,
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": result.retryAfter?.toString() || "60",
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
          },
        },
      );
    }

    // Add rate limit headers to successful responses
    return null; // Continue processing
  };
}

// Get rate limit status for a request
export function getRateLimitStatus(
  req: Request,
  config: RateLimitConfig,
  customKey?: string,
): { remaining: number; resetTime: number; limit: number } {
  const key = config.keyGenerator
    ? config.keyGenerator(req)
    : generateKey(req, customKey);
  const entry = rateLimitStore.get(key);
  const now = Date.now();

  if (!entry || now > entry.resetTime) {
    return {
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
      limit: config.maxRequests,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - entry.count),
    resetTime: entry.resetTime,
    limit: config.maxRequests,
  };
}

// Add rate limit headers to response
export function addRateLimitHeaders(
  response: Response,
  req: Request,
  config: RateLimitConfig,
  customKey?: string,
): Response {
  const status = getRateLimitStatus(req, config, customKey);

  const headers = new Headers(response.headers);
  headers.set("X-RateLimit-Limit", config.maxRequests.toString());
  headers.set("X-RateLimit-Remaining", status.remaining.toString());
  headers.set(
    "X-RateLimit-Reset",
    Math.ceil(status.resetTime / 1000).toString(),
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
