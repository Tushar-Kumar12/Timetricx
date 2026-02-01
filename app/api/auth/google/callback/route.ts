import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl, getGoogleOAuthClient } from "../../../../../lib/google-oauth";
import connectDB from "../../../../../lib/database";
import { User } from "../../../../../models/User";

/* ---------------- REDIRECT HELPERS ---------------- */

const successRedirect = ({
  redirectPath,
  request,
}: {
  redirectPath?: string;
  request: NextRequest;
}) => {
  const base = getAppBaseUrl(request);
  const path = redirectPath || "/users"; // 🔥 DEFAULT /users
  return new URL(`${base}${path}`).toString();
};

const errorRedirect = (
  message: string,
  request: NextRequest,
  redirectPath = "/landing/auth/login"
) => {
  const base = getAppBaseUrl(request);
  const url = new URL(`${base}${redirectPath}`);
  url.searchParams.set("auth_error", message);
  return url.toString();
};

/* ---------------- MAIN HANDLER ---------------- */

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const code = search.get("code");
  const stateParam = search.get("state");

  if (!code) {
    return NextResponse.redirect(
      errorRedirect("missing_code", request)
    );
  }

  /* ---------- STATE PARSE ---------- */

  let redirectPath: string | undefined;
  let connectEmail: string | null = null;

  try {
    if (stateParam) {
      const state = JSON.parse(stateParam);

      if (typeof state.redirect === "string") {
        redirectPath = state.redirect;
      }

      if (state.mode === "connect" && typeof state.email === "string") {
        connectEmail = state.email.toLowerCase();
      }
    }
  } catch {
    return NextResponse.redirect(
      errorRedirect("invalid_state", request)
    );
  }

  // 🔒 Only CONNECT flow allowed
  if (!connectEmail) {
    return NextResponse.redirect(
      errorRedirect("connect_only", request)
    );
  }

  try {
    /* ---------- GOOGLE TOKEN ---------- */

    const client = getGoogleOAuthClient(request);
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      return NextResponse.redirect(
        errorRedirect("missing_id_token", request, redirectPath)
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {
      return NextResponse.redirect(
        errorRedirect("invalid_google_payload", request, redirectPath)
      );
    }

    /* ---------- DB ---------- */

    await connectDB();

    // 🔥 EXISTING USER (OTP EMAIL)
    const user = await User.findOne({ email: connectEmail });

    if (!user) {
      return NextResponse.redirect(
        errorRedirect("user_not_found", request, redirectPath)
      );
    }

    // 🔗 CONNECT GOOGLE
    user.authProviders.google = {
      id: payload.sub,
      email: payload.email.toLowerCase(),
    };

    await user.save();

    /* ---------- SUCCESS ---------- */

    return NextResponse.redirect(
      successRedirect({
        redirectPath,
        request,
      })
    );
  } catch (error) {
    console.error("Google CONNECT failed:", error);
    return NextResponse.redirect(
      errorRedirect("oauth_failed", request, redirectPath)
    );
  }
}
