import { NextRequest, NextResponse } from "next/server";

import { getAppBaseUrl, getGoogleOAuthClient } from "../../../../../lib/google-oauth";

import {

  upsertGoogleOAuthUser,

  findUserByGoogleEmail,

} from "../../../../../lib/auth-service";



const successRedirect = ({

  redirectPath,

  needsMobile,

  request,

}: {

  redirectPath?: string;

  needsMobile: boolean;

  request: NextRequest;

}) => {

  const base = getAppBaseUrl(request);

  const path = redirectPath || "/signup";

  const url = new URL(`${base}${path}`);

  url.searchParams.set("auth", "google_success");

  url.searchParams.set("needs_mobile", needsMobile ? "1" : "0");

  return url.toString();

};



const errorRedirect = (

  redirectPath: string | undefined,

  message: string,

  request: NextRequest

) => {

  const base = getAppBaseUrl(request);

  const path = redirectPath || "/landing/auth/login";

  const url = new URL(`${base}${path}`);

  url.searchParams.set("auth_error", message);

  return url.toString();

};



export async function GET(request: NextRequest) {

  const search = request.nextUrl.searchParams;

  const code = search.get("code");

  const stateParam = search.get("state");



  if (!code) {

    return NextResponse.redirect(

      errorRedirect("/landing/auth/login", "missing_code", request)

    );

  }



  let redirectPath: string | undefined;

  let mode: "signin" | "signup" = "signup";



  try {

    if (stateParam) {

      const state = JSON.parse(stateParam);

      if (state?.mode === "signin") mode = "signin";

      if (typeof state.redirect === "string") redirectPath = state.redirect;

    }

  } catch {

    // ignore malformed state

  }



  const resolveRedirectPath = ({ existedBefore }: { existedBefore: boolean }) => {

    if (mode !== "signin") return redirectPath;

    if (existedBefore) return redirectPath;

    return "/landing/auth/login";

  };



  try {

    const client = getGoogleOAuthClient(request);

    const { tokens } = await client.getToken(code);



    if (!tokens.id_token) {

      return NextResponse.redirect(

        errorRedirect(redirectPath, "missing_id_token", request)

      );

    }



    const ticket = await client.verifyIdToken({

      idToken: tokens.id_token,

      audience: process.env.GOOGLE_CLIENT_ID,

    });



    const payload = ticket.getPayload();

    if (!payload?.email || !payload.sub) {

      return NextResponse.redirect(

        errorRedirect(redirectPath, "missing_email", request)

      );

    }



    // 🔥 CHECK USER BY GOOGLE EMAIL

    const existedBefore = !!(await findUserByGoogleEmail(payload.email));



    // 🔥 UPSERT ONLY GOOGLE AUTH DATA

    await upsertGoogleOAuthUser({

      email: payload.email,

      name: payload.name,

      providerId: payload.sub,

    });



    const user = await findUserByGoogleEmail(payload.email);

    const needsMobile = !user?.mobileNumber;



    const finalRedirectPath = resolveRedirectPath({ existedBefore });



    return NextResponse.redirect(

      successRedirect({

        redirectPath: finalRedirectPath,

        needsMobile,

        request,

      })

    );

  } catch (error) {

    console.error("Google OAuth callback failed:", error);

    return NextResponse.redirect(

      errorRedirect(redirectPath, "oauth_failed", request)

    );

  }

}

