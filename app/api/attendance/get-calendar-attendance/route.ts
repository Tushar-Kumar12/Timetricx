import { NextResponse } from "next/server";

import connectDB from "../../../../lib/database";

import { FaceAttendance } from "../../../../models/FaceAttendance";



export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const year = searchParams.get("year");
    const month = searchParams.get("month");



    if (!email) {

      return NextResponse.json({

        success:false,

        message:"Email required"

      });

    }



    await connectDB();



    const doc = await FaceAttendance.findOne({ userEmail: email });



    // Use provided year/month or current date as fallback
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const targetMonthName = `${monthNames[targetMonth - 1]} ${targetYear}`;



    if(!doc){

      return NextResponse.json({

        success:true,

        data:{ records:[] }

      });

    }



    const monthBlock = doc.months.find(

      m => m.monthName === targetMonthName

    );



    return NextResponse.json({

      success:true,

      data:{

        records: monthBlock?.records || []

      }

    });



  } catch(err){

    console.log("CALENDAR API ERROR:",err);

    return NextResponse.json({

      success:false,

      message:"Server error"

    });

  }

}

