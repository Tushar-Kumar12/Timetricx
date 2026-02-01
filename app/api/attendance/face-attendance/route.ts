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
    const pyRes = await fetch("http://192.168.0.120:5000/verify-face",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        live: faceImage,
        stored: user.profilePicture
      })
    });

    const pyData = await pyRes.json();

    if(!pyData.success || pyData.distance > 0.45){
      return NextResponse.json({
        success:false,
        message:"Face mismatch",
        distance: pyData.distance
      });
    }

    // 🔥 DATE SETUP (India timezone)
    console.log("1")
    const now = new Date();
    // Use local timezone instead of UTC
    const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const time = now.toLocaleTimeString();
    const monthName = now.toLocaleDateString('en-US',{
      month:'long',
      year:'numeric'
    }); // January 2026
console.log("2")
    // FIND USER DOC
    let doc = await FaceAttendance.findOne({ userEmail: email });

    if(!doc){
      doc = new FaceAttendance({
        userEmail: email,
        months: [{
          monthName,
          records:[{
            date: today,
            entryTime: time,
            verified:true
          }]
        }],
        method:"face"
      });

      await doc.save();

      return NextResponse.json({
        success:true,
        message:"Attendance marked (first entry)",
        data:{ monthName, date:today, time }
      });
    }
    console.log("3")

    // FIND MONTH
    let monthBlock = doc.months.find(
      m => m.monthName === monthName
    );

    if(!monthBlock){
      monthBlock = {
        monthName,
        records:[]
      };
      doc.months.push(monthBlock);
    }

    // CHECK ALREADY
    const exists = monthBlock.records.find(
      r => r.date === today
    );

    if(exists){
      return NextResponse.json({
        success:false,
        message:"Attendance already marked"
      });
    }

    // PUSH ENTRY
    monthBlock.records.push({
      date: today,
      entryTime:time,
      verified:true
    });

    doc.markModified("months");
    await doc.save();

    return NextResponse.json({
      success:true,
      message:"Attendance marked",
      data:{ monthName, date:today, time }
    });

  } catch(err){
    console.log("FACE API ERROR:",err);
    return NextResponse.json({
      success:false,
      message:"Server error"
    });
  }
}
