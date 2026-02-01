import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { Otp } from "../../../../models/Otp";
import { User } from "../../../../models/User";
import jwt from "jsonwebtoken";
import { createSuccessResponse, createErrorResponse } from "../../../../utils/response";

export async function POST(request: NextRequest) {
  try {
    /* ---------------- TOKEN ---------------- */

    const token = request.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        createErrorResponse("Authorization token required"),
        { status: 401 }
      );
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    /* ---------------- BODY ---------------- */

    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        createErrorResponse("Email and OTP required"),
        { status: 400 }
      );
    }

    /* ---------------- DB ---------------- */

    await connectDB();

    /* ---------------- FIND OTP ---------------- */

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
      purpose: "signup",
      isUsed: false,
    });

    if (!otpRecord) {
      return NextResponse.json(
        createErrorResponse("Invalid OTP"),
        { status: 400 }
      );
    }

    /* ---------------- EXPIRY CHECK ---------------- */

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        createErrorResponse("OTP expired"),
        { status: 400 }
      );
    }

    /* ---------------- MARK USED ---------------- */

    otpRecord.isUsed = true;
    await otpRecord.save();

    /* ---------------- VERIFY USER ---------------- */

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        createErrorResponse("User not found"),
        { status: 404 }
      );
    }

    user.isEmailVerified = true;
    await user.save();

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json(
      createSuccessResponse(
        { verified: true },
        "OTP verified successfully"
      ),
      { status: 200 }
    );

  } catch (error: any) {
    console.error("OTP verify error:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        createErrorResponse("Invalid token"),
        { status: 401 }
      );
    }

    return NextResponse.json(
      createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}
