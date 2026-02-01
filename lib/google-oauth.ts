import { google } from "googleapis";
import { NextRequest } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn("Google OAuth credentials not found");
}

/**
 * Get correct app base URL (proxy-safe)
 */
export function getAppBaseUrl(request: NextRequest) {
  const protocol =
    request.headers.get("x-forwarded-proto") || "http";
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");

  return `${protocol}://${host}`;
}

/**
 * Google OAuth client (CONNECT flow)
 */
export function getGoogleOAuthClient(request: NextRequest) {
  const baseUrl = getAppBaseUrl(request);

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    `${baseUrl}/api/auth/google/callback`
  );
}
