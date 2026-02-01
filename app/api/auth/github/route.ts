import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAppBaseUrl } from "../../../../lib/google-oauth";

export async function GET(request: NextRequest) {
  try {
    const mode = request.nextUrl.searchParams.get("mode") || "signin"; // Default to signin
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const safeRedirect = (() => {
      if (!redirectParam) return null;
      const trimmed = redirectParam.trim();
      if (!trimmed.startsWith("/")) return null;
      if (trimmed.startsWith("//")) return null;
      return trimmed;
    })();

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 });
    }

    const base = getAppBaseUrl(request);
    const redirectUri = `${base}/api/auth/github/callback`;

    const state = {
      mode,
      redirect: safeRedirect || (mode === "signin" ? "/landing/auth/login" : "/landing/auth/signup"),
      nonce: crypto.randomBytes(16).toString("hex"),
    };

    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", JSON.stringify(state));

    return NextResponse.redirect(url.toString(), { status: 302 });
  } catch (error) {
    console.error("Failed to start GitHub OAuth:", error);
    return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 });
  }
}
