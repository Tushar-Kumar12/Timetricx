import { NextResponse } from "next/server";
import { findUserByEmail, findUserByMobile } from "@/lib/auth-service";

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json(); // identifier can be email or mobile
    if (!identifier) {
      return NextResponse.json({ error: "Email or mobile number is required" }, { status: 400 });
    }

    // Check if identifier is an email or mobile number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    let user = null;

    if (isEmail) {
      user = await findUserByEmail(identifier);
    } else {
      user = await findUserByMobile(identifier);
    }

    return NextResponse.json({ exists: !!user });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to check user";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
