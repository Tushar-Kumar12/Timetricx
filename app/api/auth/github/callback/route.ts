import { NextRequest, NextResponse } from "next/server";
import { getAppBaseUrl } from "../../../../../lib/google-oauth";
import { findUserByEmail, upsertGitHubOAuthUser } from "../../../../../lib/auth-service";

const successRedirect = ({
  redirectPath,
  email,
  name,
  picture,
  needsMobile,
  request,
}: {
  redirectPath?: string;
  email?: string;
  name?: string;
  picture?: string;
  needsMobile: boolean;
  request: NextRequest;
}) => {
  const base = getAppBaseUrl(request);
  const path = redirectPath || "/landing/auth/login";
  const url = new URL(`${base}${path}`);
  url.searchParams.set("auth", "github_success");
  url.searchParams.set("needs_mobile", needsMobile ? "1" : "0");
  if (email) url.searchParams.set("email", email);
  if (name) url.searchParams.set("name", name);
  if (picture) url.searchParams.set("picture", picture);
  return url.toString();
};

const errorRedirect = (redirectPath: string | undefined, message: string, request: NextRequest) => {
  const base = getAppBaseUrl(request);
  const path = redirectPath || "/landing/auth/login";
  const url = new URL(`${base}${path}`);
  url.searchParams.set("auth_error", message);
  return url.toString();
};

type GithubEmail = {
  email: string;
  primary?: boolean;
  verified?: boolean;
  visibility?: "public" | "private" | null;
};

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const code = search.get("code");
  const stateParam = search.get("state");

  if (!code) {
    return NextResponse.redirect(errorRedirect("/landing/auth/login", "missing_code", request));
  }

  let redirectPath: string | undefined;
  let mode: "signin" | "signup" = "signup";
  try {
    if (stateParam) {
      const state = JSON.parse(stateParam);
      if (state?.mode === "signin") {
        mode = "signin";
      }
      if (typeof state.redirect === "string") {
        redirectPath = state.redirect;
      }
    }
  } catch {
    // ignore malformed state
  }

  const resolveRedirectPath = ({ existedBefore }: { existedBefore: boolean }) => {
    if (mode !== "signin") return redirectPath;
    if (existedBefore) return redirectPath;

    const raw = typeof redirectPath === "string" ? redirectPath.trim() : "";
    if (!raw) return "/landing/auth/login";
    if (raw === "/signin") return "/landing/auth/login";
    if (raw.startsWith("/signin?")) return raw.replace("/signin?", "/landing/auth/login?");
    if (raw.startsWith("/signin#")) return raw.replace("/signin#", "/landing/auth/login#");
    if (raw.startsWith("/signin/")) return raw.replace("/signin/", "/landing/auth/login/");
    return "/landing/auth/login";
  };

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(errorRedirect(redirectPath, "missing_github_env", request));
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(errorRedirect(redirectPath, tokenData.error || "token_exchange_failed", request));
    }

    const accessToken = tokenData.access_token;

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const userData = (await userRes.json()) as {
      id?: number;
      login?: string;
      name?: string | null;
      email?: string | null;
      avatar_url?: string | null;
    };

    if (!userRes.ok || !userData.id) {
      return NextResponse.redirect(errorRedirect(redirectPath, "missing_user", request));
    }

    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    let email: string | undefined;
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as GithubEmail[];
      email =
        emails.find((e) => e.primary && e.verified)?.email ||
        emails.find((e) => e.verified)?.email ||
        emails[0]?.email;
    }

    email = email || userData.email || undefined;
    if (!email) {
      return NextResponse.redirect(errorRedirect(redirectPath, "missing_email", request));
    }

    const existedBefore = !!(await findUserByEmail(email));

    await upsertGitHubOAuthUser({
      email,
      name: (userData.name ?? userData.login) ?? undefined,
      providerId: String(userData.id),
    });

    const userRow = await findUserByEmail(email);
    const needsMobile = !userRow?.mobile;
    const finalRedirectPath = resolveRedirectPath({ existedBefore });

    return NextResponse.redirect(
      successRedirect({
        redirectPath: finalRedirectPath,
        email,
        name: userRow?.name ?? (userData.name ?? userData.login) ?? undefined,
        picture: userData.avatar_url ?? undefined,
        needsMobile,
        request,
      })
    );
  } catch (error) {
    console.error("GitHub OAuth callback failed:", error);
    return NextResponse.redirect(errorRedirect(redirectPath, "oauth_failed", request));
  }
}
