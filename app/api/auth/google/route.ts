import { NextRequest, NextResponse } from "next/server";
import { getGoogleOAuthClient } from "../../../../lib/google-oauth";

export async function GET(request: NextRequest) {
  try {
    const stateParam = request.nextUrl.searchParams.get("state");

    if (!stateParam) {
      return NextResponse.json(
        { error: "Missing OAuth state" },
        { status: 400 }
      );
    }

    // 🔒 Validate state (basic)
    let parsedState;
    try {
      parsedState = JSON.parse(stateParam);
    } catch {
      return NextResponse.json(
        { error: "Invalid OAuth state" },
        { status: 400 }
      );
    }

    // 🔐 Only CONNECT flow allowed
    if (parsedState.mode !== "connect") {
      return NextResponse.json(
        { error: "Only Google CONNECT is allowed" },
        { status: 400 }
      );
    }

    const client = getGoogleOAuthClient(request);

    const authUrl = client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["openid", "email", "profile"],
      state: stateParam, // 🔥 FORWARD AS-IS
    });

    return NextResponse.redirect(authUrl, { status: 302 });
  } catch (error) {
    console.error("Failed to start Google OAuth:", error);
    return NextResponse.json(
      { error: "Google OAuth not configured" },
      { status: 500 }
    );
  }
}
