// Authentication and authorization utilities for edge functions

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

export interface AuthUser {
  id: string;
  email?: string;
  isPremium: boolean;
  isAdmin: boolean;
  role: "free" | "premium" | "admin";
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}

// Initialize Supabase client for server-side operations
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase configuration");
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// Verify JWT token and extract user information
export async function verifyAuthToken(
  authHeader: string | null,
): Promise<AuthUser | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const supabase = getSupabaseClient();

    // Verify the JWT token
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.warn("JWT verification failed:", error?.message);
      return null;
    }

    // Fetch user profile to get premium status and role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_premium, is_admin")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.warn("Failed to fetch user profile:", profileError.message);
      // Continue with basic user info if profile fetch fails
    }

    const isPremium = profile?.is_premium || false;
    const isAdmin = profile?.is_admin || false;

    return {
      id: user.id,
      email: user.email,
      isPremium,
      isAdmin,
      role: isAdmin ? "admin" : isPremium ? "premium" : "free",
    };
  } catch (error) {
    console.error("Auth token verification error:", error);
    return null;
  }
}

// Middleware to require authentication
export function requireAuth() {
  return async (
    req: Request,
  ): Promise<{ user: AuthUser; continueProcessing: boolean }> => {
    const authHeader = req.headers.get("authorization");
    const user = await verifyAuthToken(authHeader);

    if (!user) {
      throw new AuthenticationError("Authentication required");
    }

    return { user, continueProcessing: true };
  };
}

// Middleware to require premium access
export function requirePremium() {
  return async (
    req: Request,
  ): Promise<{ user: AuthUser; continueProcessing: boolean }> => {
    const { user } = await requireAuth()(req);

    if (!user.isPremium && !user.isAdmin) {
      throw new AuthorizationError("Premium subscription required");
    }

    return { user, continueProcessing: true };
  };
}

// Middleware to require admin access
export function requireAdmin() {
  return async (
    req: Request,
  ): Promise<{ user: AuthUser; continueProcessing: boolean }> => {
    const { user } = await requireAuth()(req);

    if (!user.isAdmin) {
      throw new AuthorizationError("Admin access required");
    }

    return { user, continueProcessing: true };
  };
}

// Check if user has permission for specific action
export function hasPermission(
  user: AuthUser,
  action: string,
  resource?: string,
): boolean {
  // Admin has all permissions
  if (user.isAdmin) {
    return true;
  }

  // Define permission rules
  const permissions = {
    "create:birth_chart": true, // All authenticated users
    "create:basic_report": true, // All authenticated users
    "create:premium_report": user.isPremium, // Premium users only
    "create:vedic_report": user.isPremium, // Premium users only
    "create:compatibility_report": true, // All authenticated users
    "create:daily_horoscope": true, // All authenticated users
    "create:personalized_horoscope": user.isPremium, // Premium users only
    "export:pdf": user.isPremium, // Premium users only
    "access:advanced_features": user.isPremium, // Premium users only
  };

  return permissions[action] || false;
}

// Get user's rate limit configuration based on their role
export function getUserRateLimits(user: AuthUser): {
  [key: string]: { windowMs: number; maxRequests: number };
} {
  if (user.isAdmin) {
    return {
      reports: { windowMs: 60 * 60 * 1000, maxRequests: 1000 }, // 1000 per hour
      charts: { windowMs: 60 * 60 * 1000, maxRequests: 500 }, // 500 per hour
      horoscopes: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 200 }, // 200 per day
    };
  }

  if (user.isPremium) {
    return {
      reports: { windowMs: 60 * 60 * 1000, maxRequests: 50 }, // 50 per hour
      charts: { windowMs: 60 * 60 * 1000, maxRequests: 100 }, // 100 per hour
      horoscopes: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 50 }, // 50 per day
    };
  }

  // Free users
  return {
    reports: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour
    charts: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 per hour
    horoscopes: { windowMs: 24 * 60 * 60 * 1000, maxRequests: 20 }, // 20 per day
  };
}

// Validate user permissions for a specific action
export async function validatePermissions(
  req: Request,
  requiredAction: string,
  resource?: string,
): Promise<AuthUser> {
  const { user } = await requireAuth()(req);

  if (!hasPermission(user, requiredAction, resource)) {
    throw new AuthorizationError(
      `Insufficient permissions for action: ${requiredAction}`,
    );
  }

  return user;
}

// Create standardized auth error responses
export function createAuthErrorResponse(
  error: AuthenticationError | AuthorizationError,
): Response {
  const status = error instanceof AuthenticationError ? 401 : 403;

  return new Response(
    JSON.stringify({
      error: error.name,
      message: error.message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": status === 401 ? "Bearer" : undefined,
      },
    },
  );
}

// Wrapper function to handle auth errors consistently
export async function withAuth<T>(
  req: Request,
  handler: (req: Request, user: AuthUser) => Promise<T>,
  requiredAction?: string,
): Promise<T> {
  try {
    const user = requiredAction
      ? await validatePermissions(req, requiredAction)
      : (await requireAuth()(req)).user;

    return await handler(req, user);
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      throw error; // Re-throw auth errors to be handled by the caller
    }
    throw error; // Re-throw other errors
  }
}
