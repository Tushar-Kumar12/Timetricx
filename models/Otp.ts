import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  userId: mongoose.Types.ObjectId;
  email?: string;
  mobile?: string;
  otp: string;
  purpose: "signup" | "login" | "reset-password";
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
    },

    mobile: {
      type: String,
    },

    otp: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["signup", "login", "reset-password"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* Auto delete OTP after expiry */
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp =
  mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
