import { NextResponse } from "next/server";
import connectDB from "../../../../lib/database";
import { FaceAttendance } from "../../../../models/FaceAttendance";

// ⏰ Helper: entry time + 8 hours
function addHours(timeStr: string, hoursToAdd: number) {
  let [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes, 0);
  date.setHours(date.getHours() + hoursToAdd);

  let newHours = date.getHours();
  const newMinutes = date.getMinutes();

  const newModifier = newHours >= 12 ? "PM" : "AM";
  newHours = newHours % 12 || 12;

  return `${newHours}:${newMinutes
    .toString()
    .padStart(2, "0")} ${newModifier}`;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({
        success: false,
        message: "Email required"
      });
    }

    const user = await FaceAttendance.findOne({ userEmail: email });

    if (!user || user.months.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Attendance not found"
      });
    }

    const lastMonth = user.months[user.months.length - 1];

    if (lastMonth.records.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No day record"
      });
    }

    const lastDay = lastMonth.records[lastMonth.records.length - 1];

    // Check if exit time already exists
    if (lastDay.exitTime) {
      return NextResponse.json({
        success: false,
        message: "Exit time already recorded"
      });
    }

    // Convert entry time to Date object for comparison
    const [entryTime, entryModifier] = lastDay.entryTime.split(" ");
    const [hours, minutes] = entryTime.split(":").map(Number);
    
    const entryDate = new Date();
    let entryHours = hours;
    if (entryModifier === "PM" && entryHours !== 12) entryHours += 12;
    if (entryModifier === "AM" && entryHours === 12) entryHours = 0;
    
    entryDate.setHours(entryHours, minutes, 0);
    
    // Current time
    const now = new Date();
    
    // Check if 8 hours have passed
    const eightHoursLater = new Date(entryDate.getTime() + 8 * 60 * 60 * 1000);
    
    if (now >= eightHoursLater) {
      // 8 hours have passed, automatically set exit time
      const exitTime = addHours(lastDay.entryTime, 8);
      
      const recordIndex = lastMonth.records.length - 1;
      await FaceAttendance.findOneAndUpdate(
        { userEmail: email },
        { 
          $set: { 
            [`months.${user.months.length - 1}.records.${recordIndex}.exitTime`]: exitTime
          }
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: "Exit time automatically updated (8 hours completed)",
        data: {
          email,
          entryTime: lastDay.entryTime,
          exitTime,
          autoUpdated: true
        }
      });
    } else {
      // 8 hours not yet completed
      const remainingTime = Math.ceil((eightHoursLater.getTime() - now.getTime()) / (1000 * 60));
      
      return NextResponse.json({
        success: false,
        message: `8 hours not yet completed. ${remainingTime} minutes remaining`,
        data: {
          email,
          entryTime: lastDay.entryTime,
          remainingMinutes: remainingTime
        }
      });
    }

  } catch (error) {
    console.error("ERROR:", error);
    return NextResponse.json({
      success: false,
      message: "Server error"
    });
  }
}
