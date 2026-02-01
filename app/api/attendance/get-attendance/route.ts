import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { FaceAttendance } from "../../../../models/FaceAttendance";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email required"
      });
    }

    await connectDB();

    const doc = await FaceAttendance.findOne({ userEmail: email });

    if (!doc) {
      return NextResponse.json({
        success: true,
        data: {
          percentage: 0,
          todayEntry: false,
          records: []
        }
      });
    }

    const now = new Date();
    // Use local timezone instead of UTC
    const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

    const currentMonthName = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    }); // "January 2026"

    // 🔥 Find current month block
    const currentMonth = doc.months.find(
      m => m.monthName === currentMonthName
    );

    const records = currentMonth?.records || [];

    // --- percentage + todayEntry ---
    // 🔥 Get total days in current month
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    let presentDays = records.filter(r => r.entryTime).length;

    let todayEntry = records.some(
      r => r.date === today && r.entryTime && !r.exitTime
    );

    const percentage =
      totalDaysInMonth > 0
        ? Math.round((presentDays / totalDaysInMonth) * 100)
        : 0;

    // 🔥 DEBUG: Log the actual data
    console.log("DEBUG - Total records:", records.length);
    console.log("DEBUG - Present days:", presentDays);
    console.log("DEBUG - Records:", records);

    return NextResponse.json({
      success: true,
      data: {
        percentage,
        todayEntry,
        records // 👈 ONLY CURRENT MONTH
      }
    });

  } catch (err) {
    console.log("GET ATTENDANCE ERROR:", err);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
