import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { User } from "../../../../models/User";
import { FaceAttendance } from "../../../../models/FaceAttendance";

export async function POST(req: Request) {
  try {
    const { email, verified } = await req.json();

    // 🔐 basic validation
    if (!email || verified !== true) {
      return NextResponse.json({
        success: false,
        message: "Face not verified",
      });
    }

    await connectDB();

    // 🔹 check user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
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

    // 🆕 first ever attendance
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

    // 🔎 find month
    let monthBlock = doc.months.find(
      (m: any) => m.monthName === monthName
    );

    if (!monthBlock) {
      monthBlock = { monthName, records: [] };
      doc.months.push(monthBlock);
    }

    // ⛔ already marked
    if (monthBlock.records.find((r: any) => r.date === today)) {
      return NextResponse.json({
        success: false,
        message: "Attendance already marked",
      });
    }

    // ✅ mark attendance
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
