import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: "Email or mobile number is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    let user = null;

    /* ---------------- EMAIL FLOW ---------------- */
    if (isEmail) {
      user = await User.findOne({
        email: identifier.toLowerCase(),
      });

      // ❌ user hi nahi mila
      if (!user) {
        return NextResponse.json({
          success: true,
          exists: false,
        });
      }

      // ❌ mobile number missing → invalid profile
      if (!user.mobileNumber) {
        return NextResponse.json({
          success: true,
          exists: true,
          mobileMissing: true, // 🔥 frontend use karega
        });
      }

      // ✅ valid user
      return NextResponse.json({
        success: true,
        exists: true,
        mobileMissing: false,
      });
    }

    /* ---------------- MOBILE FLOW ---------------- */
    user = await User.findOne({
      mobileNumber: identifier,
    });

    return NextResponse.json({
      success: true,
      exists: !!user,
    });

  } catch (error) {
    console.error("CHECK USER ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check user" },
      { status: 500 }
    );
  }
}
