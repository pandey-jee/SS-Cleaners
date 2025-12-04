// @ts-nocheck
// Shared CORS configuration for Edge Functions
// Update ALLOWED_ORIGINS before deploying to production

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
  // Add your Vercel URL here after deployment:
  // "https://ss-cleaners.vercel.app",
  // "https://sscleaners.in",
  // "https://www.sscleaners.in",
];

export function getCorsHeaders(origin?: string | null): HeadersInit {
  // In development, allow localhost
  const isDev = Deno.env.get("ENVIRONMENT") === "development";
  
  if (isDev && origin?.includes("localhost")) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
  }

  // In production, only allow specific origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    };
  }

  // Fallback - restrict to first allowed origin
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

export const defaultCorsHeaders = {
  "Access-Control-Allow-Origin": "*", // This should be replaced in production
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
