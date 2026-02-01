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
  
  const clientUrl = process.env.CLIENT_URL || "";
  const backendUrl = process.env.BACKEND_URL || "";
  
  // Default to "none" for cross-origin strictness in production
  // But prefer "lax" if we can determine we are on the same "site" (eTLD+1)
  let sameSite = "none";
  let isSameSite = false;

  try {
    if (clientUrl && backendUrl) {
      const clientHost = new URL(clientUrl).hostname;
      const backendHost = new URL(backendUrl).hostname;

      if (clientHost === backendHost) {
        isSameSite = true;
      } else {
        // Intelligent check for subdomains (e.g., app.amour.ai and api.amour.ai)
        // If they share the same root domain, we should use "lax" for better Safari support
        const clientParts = clientHost.split('.');
        const backendParts = backendHost.split('.');
        
        // Very basic heuristic: if last 2 parts match, assume same root domain.
        // This covers standard domains (amour.ai) and localhost.
        // It might be overly aggressive for SLDs like .co.uk, but "Lax" is a safe fallback 
        // compared to "None" which is blocked by Safari ITP.
        if (clientParts.length >= 2 && backendParts.length >= 2) {
          const clientRoot = clientParts.slice(-2).join('.');
          const backendRoot = backendParts.slice(-2).join('.');
          if (clientRoot === backendRoot) {
            isSameSite = true;
          }
        }
      }
    }
  } catch (err) {
    // Fallback to cross-origin assumption
    isSameSite = false;
  }

  // If detected as same-site (same domain or subdomain sharing root), use "lax"
  // "lax" is much more reliable on Safari than "none"
  if (isSameSite) {
    sameSite = "lax";
  }

  return {
    httpOnly: true,
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? sameSite : "lax", 
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    path: "/",
  };
};

export const COOKIE_NAME = "amour";
