import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { User } from "../../../../models/User";
import { FaceAttendance } from "../../../../models/FaceAttendance";

export async function POST(req: Request) {
  try {
    const { email, faceImage } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user?.profilePicture) {
      return NextResponse.json({
        success:false,
        message:"Profile picture not found"
      });
    }

    // 🔥 PYTHON CALL (UNCHANGED)
   const pyRes = await fetch(
  "http://192.168.0.120:5000/verify-face",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      live: faceImage,
      stored: user.profilePicture
    })
  }
);

const data = await pyRes.json();


    const pyData = await pyRes.json();

    if(!pyData.success || pyData.distance > 0.45){
      return NextResponse.json({
        success:false,
        message:"Face mismatch",
        distance: pyData.distance
      });
    }

    // 🔥 DATE SETUP
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const exitTime = now.toLocaleTimeString();
    const monthName = now.toLocaleDateString('en-US',{
      month:'long',
      year:'numeric'
    });

    // FIND USER DOC
    const doc = await FaceAttendance.findOne({ userEmail: email });

    if(!doc){
      return NextResponse.json({
        success:false,
        message:"No attendance found"
      });
    }

    // FIND MONTH
    const monthBlock = doc.months.find(
      m => m.monthName === monthName
    );

    if(!monthBlock){
      return NextResponse.json({
        success:false,
        message:"No attendance for this month"
      });
    }

    // FIND TODAY ENTRY
    const todayRecord = monthBlock.records.find(
      r => r.date === today
    );

    if(!todayRecord){
      return NextResponse.json({
        success:false,
        message:"Entry not found, mark attendance first"
      });
    }

    // CHECK ALREADY CHECKED OUT
    if(todayRecord.exitTime){
      return NextResponse.json({
        success:false,
        message:"Already checked out"
      });
    }

    // 🔥 ADD EXIT TIME
    todayRecord.exitTime = exitTime;

    doc.markModified("months");
    await doc.save();

    return NextResponse.json({
      success:true,
      message:"Checked out successfully",
      data:{
        date: today,
        exitTime
      }
    });

  } catch(err){
    console.log("FACE CHECKOUT ERROR:",err);
    return NextResponse.json({
      success:false,
      message:"Server error"
    });
  }
}
