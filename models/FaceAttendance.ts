import mongoose, { Schema, Document } from "mongoose";

interface IDayEntry {
  date: string;        // "2026-01-16"
  entryTime: string;  // "10:05 AM"
  exitTime?: string;  // "6:30 PM" (optional)
}

interface IMonthRecord {
  monthName: string;  // "January 2026"
  records: IDayEntry[];
}

export interface IFaceAttendance extends Document {
  userEmail: string;
  verified: boolean;      // 👈 OUTSIDE (common for all)
  months: IMonthRecord[];
  method: "face";
  createdAt: Date;
}

const DaySchema = new Schema({
  date: { type: String, required: true },
  entryTime: { type: String, required: true },
  exitTime: { type: String, default: null },
});

const MonthSchema = new Schema({
  monthName: { type: String, required: true },
  records: { type: [DaySchema], default: [] }
});

const FaceAttendanceSchema = new Schema<IFaceAttendance>({
  userEmail: {
    type: String,
    required: true,
    index: true
  },

  verified: {
    type: Boolean,
    default: true   // 👈 SAME FOR ALL
  },

  months: {
    type: [MonthSchema],
    default: []
  },

  method: {
    type: String,
    default: "face"
  }

},{ timestamps:true });
delete mongoose.models.FaceAttendance;


export const FaceAttendance =
  mongoose.models.FaceAttendance ||
  mongoose.model<IFaceAttendance>(
    "FaceAttendance",
    FaceAttendanceSchema
  );
