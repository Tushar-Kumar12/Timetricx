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
        message: "Email required",
      });
    }

    await connectDB();

    const doc = await FaceAttendance.findOne({ userEmail: email });

    const now = new Date();
    const currentMonthName = now.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    if (!doc) {
      return NextResponse.json({
        success: true,
        data: { records: [] },
      });
    }

    const monthBlock = doc.months.find(
      (m: any) => m.monthName === currentMonthName
    );

    return NextResponse.json({
      success: true,
      data: {
        records: monthBlock?.records || [],
      },
    });
  } catch (err) {
    console.log("CALENDAR API ERROR:", err);
    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}
