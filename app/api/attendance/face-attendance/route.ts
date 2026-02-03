import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { User } from "../../../../models/User";
import { FaceAttendance } from "../../../../models/FaceAttendance";

function normalizeBase64Image(img: string) {
  // already proper base64 with header
  if (img.startsWith("data:image")) return img;

  // raw base64 → force jpeg header
  return `data:image/jpeg;base64,${img}`;
}

export async function POST(req: Request) {
  try {
    const { email, faceImage } = await req.json();

    if (!email || !faceImage) {
      return NextResponse.json({
        success: false,
        message: "Email and face image are required",
      });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user?.profilePicture) {
      return NextResponse.json({
        success: false,
        message: "Profile picture not found",
      });
    }

    // 🔥🔥 IMAGE FIX HERE 🔥🔥
    const safeFaceImage = normalizeBase64Image(faceImage);

    // 🔥 CALL JS FACE API SERVER
    const faceRes = await fetch("https://face-api-js-rho.vercel.app/verify-face", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        live: safeFaceImage,           // ✅ ALWAYS VALID IMAGE
        stored: user.profilePicture,   // cloudinary url (already ok)
      }),
    });

    const faceData = await faceRes.json();

    if (!faceData.success || faceData.distance > 0.45) {
      return NextResponse.json({
        success: false,
        message: "Face mismatch",
        distance: faceData.distance,
      });
    }

    // 🔹 DATE / TIME
    const now = new Date();
    const today = `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

    const time = now.toLocaleTimeString();
    const monthName = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    let doc = await FaceAttendance.findOne({ userEmail: email });

    if (!doc) {
      doc = new FaceAttendance({
        userEmail: email,
        months: [
          {
            monthName,
            records: [
              {
                date: today,
                entryTime: time,
                verified: true,
              },
            ],
          },
        ],
        method: "face",
      });

      await doc.save();

      return NextResponse.json({
        success: true,
        message: "Attendance marked (first entry)",
        data: { monthName, date: today, time },
      });
    }

    let monthBlock = doc.months.find(
      (m: any) => m.monthName === monthName
    );

    if (!monthBlock) {
      monthBlock = { monthName, records: [] };
      doc.months.push(monthBlock);
    }

    if (monthBlock.records.find((r: any) => r.date === today)) {
      return NextResponse.json({
        success: false,
        message: "Attendance already marked",
      });
    }

    monthBlock.records.push({
      date: today,
      entryTime: time,
      verified: true,
    });

    doc.markModified("months");
    await doc.save();

    return NextResponse.json({
      success: true,
      message: "Attendance marked",
      data: { monthName, date: today, time },
    });
  } catch (err) {
    console.error("FACE ATTENDANCE ERROR:", err);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
