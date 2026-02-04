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
    const { email, faceImage } = await req.json();
    await connectDB();

    if (!email || !faceImage) {
      return NextResponse.json({
        success: false,
        message: "Email and face image are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user?.profilePicture) {
      return NextResponse.json({
        success: false,
        message: "Profile picture not found",
      });
    }

    // 🔥 NORMALIZE IMAGE (VERY IMPORTANT)
    const safeFaceImage = normalizeBase64Image(faceImage);

    // 🔥 FACE API SERVER CALL (JS / PYTHON – doesn’t matter)
    const faceRes = await fetch(
      "http://localhost:5000/verify-face",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          live: safeFaceImage,
          stored: user.profilePicture,
        }),
      }
    );

    const faceData = await faceRes.json(); // ✅ ONLY ONCE

    if (!faceData.success || faceData.distance > 0.45) {
      return NextResponse.json({
        success: false,
        message: "Face mismatch",
        distance: faceData.distance,
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
        message: "Entry not found, mark attendance first",
      });
    }

    if (todayRecord.exitTime) {
      return NextResponse.json({
        success: false,
        message: "Already checked out",
      });
    }

    // 🔥 ADD EXIT TIME
    todayRecord.exitTime = exitTime;
    doc.markModified("months");
    await doc.save();

    return NextResponse.json({
      success: true,
      message: "Checked out successfully",
      data: {
        date: today,
        exitTime,
      },
    });
  } catch (err) {
    console.log("FACE CHECKOUT ERROR:", err);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
