/**
 * Centralized cookie configuration for authentication.
 * 
 * IMPORTANT NOTES FOR PRODUCTION:
 * 
 * 1. If frontend and backend are on DIFFERENT domains:
 *    - sameSite: "none" is required
 *    - secure: true is REQUIRED
 *    - CORS must have credentials: true AND explicit origin (not "*")
 * 
 * 2. If frontend and backend are on the SAME domain:
 *    - sameSite: "lax" is preferred (works with Safari)
 *    - secure: true for HTTPS
 * 
 * 3. Safari and privacy-focused browsers may block sameSite: "none" cookies.
 *    Consider using the same domain for frontend/backend in production.
 */

export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Check if we're using same-origin or cross-origin setup
  // If CLIENT_URL and backend URL have the same domain, use "lax"
  // Otherwise use "none" for cross-origin
  const clientUrl = process.env.CLIENT_URL || "";
  const backendUrl = process.env.BACKEND_URL || "";
  
  // Try to detect if same origin (simplistic check)
  let isSameOrigin = false;
  try {
    if (clientUrl && backendUrl) {
      const clientHost = new URL(clientUrl).hostname;
      const backendHost = new URL(backendUrl).hostname;
      isSameOrigin = clientHost === backendHost;
    }
  } catch {
    // If parsing fails, assume cross-origin for safety
    isSameOrigin = false;
  }

  return {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    // Use "lax" for same-origin (better Safari support), "none" for cross-origin
    sameSite: isProduction ? (isSameOrigin ? "lax" : "none") : "lax",
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    path: "/",
    // Optionally set domain for subdomain sharing
    // domain: isProduction ? ".yourdomain.com" : undefined,
  };
};

export const COOKIE_NAME = "amour";
