import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { User } from "../../../../models/User";
import { FaceAttendance } from "../../../../models/FaceAttendance";

function normalizeBase64Image(img: string) {
  if (img.startsWith("data:image")) return img;
  return `data:image/jpeg;base64,${img}`;
}

export async function POST(req: Request) {
  try {
    const { email, verified } = await req.json();
    await connectDB();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      });
    }

    // 🔐 extra safety (optional but recommended)
    if (!verified) {
      return NextResponse.json({
        success: false,
        message: "Face verification required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
      });
    }

    // 🔥 DATE SETUP
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const exitTime = now.toLocaleTimeString();
    const monthName = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const doc = await FaceAttendance.findOne({ userEmail: email });
    if (!doc) {
      return NextResponse.json({
        success: false,
        message: "No attendance found",
      });
    }

    const monthBlock = doc.months.find(
      (m: any) => m.monthName === monthName
    );
    if (!monthBlock) {
      return NextResponse.json({
        success: false,
        message: "No attendance for this month",
      });
    }

    const todayRecord = monthBlock.records.find(
      (r: any) => r.date === today
    );
    if (!todayRecord) {
      return NextResponse.json({
        success: false,
        message: "Entry not found",
      });
    }

    if (todayRecord.exitTime) {
      return NextResponse.json({
        success: false,
        message: "Already checked out",
      });
    }

    todayRecord.exitTime = exitTime;
    doc.markModified("months");
    await doc.save();

    return NextResponse.json({
      success: true,
      message: "Checked out successfully",
      data: { date: today, exitTime },
    });
  } catch (err) {
    console.error("FACE CHECKOUT ERROR:", err);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
