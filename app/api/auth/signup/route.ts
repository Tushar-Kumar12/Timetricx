import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/database';
import { User } from '../../../../models/User';
import { Otp } from '../../../../models/Otp';
import { hashPassword } from '../../../../utils/hashPassword';
import { generateToken } from '../../../../utils/generateToken';
import { validateEmail } from '../../../../utils/validateEmail';
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response';
import { sendOtpMail } from '../../../../utils/sendEmail'; // mail util

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    /* ---------------- VALIDATION ---------------- */

    if (!email || !password) {
      return NextResponse.json(
        createErrorResponse('Email and password are required'),
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        createErrorResponse('Please enter a valid email address'),
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        createErrorResponse('Password must be at least 6 characters long'),
        { status: 400 }
      );
    }

    /* ---------------- DB ---------------- */

    await connectDB();

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return NextResponse.json(
        createErrorResponse('User with this email already exists'),
        { status: 409 }
      );
    }
/* ---------------- DERIVE WORKING ROLE ---------------- */

let workingRole: 'Employee' | 'Internship' | '' = '';

if (email.toLowerCase().endsWith('.com')) {
  workingRole = 'Employee';
} else if (email.toLowerCase().endsWith('.in')) {
  workingRole = 'Internship';
}

    /* ---------------- CREATE USER ---------------- */

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
  name: name ? name.trim() : email.split('@')[0],
  email: email.toLowerCase(),
  password: hashedPassword,
  isEmailVerified: false,
  workingrole: workingRole, // 🔥 AUTO SET
});


    /* ---------------- OTP GENERATE ---------------- */


const otp = Math.floor(100000 + Math.random() * 900000).toString();
console.log("Generated OTP:", otp);

try {
  const savedOtp = await Otp.create({
    userId: newUser._id,
    email: newUser.email,
    otp,
    purpose: 'signup',
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  console.log("OTP SAVED IN DB:", savedOtp);

} catch (err) {
  console.error("OTP SAVE ERROR:", err);
}


    /* ---------------- SEND MAIL ---------------- */

    try {
      console.log("📧 Attempting to send OTP to:", newUser.email);
      await sendOtpMail(newUser.email, otp);
      console.log("✅ OTP email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send OTP email:", emailError);
      // Continue with signup even if email fails
    }

    /* ---------------- TOKEN ---------------- */

    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      createSuccessResponse(
        {
          user: userResponse,
          token
        },
        'Account created. OTP sent to your email'
      ),
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Signup error:', error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        createErrorResponse(`User with this ${field} already exists`),
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');

      return NextResponse.json(
        createErrorResponse(message),
        { status: 400 }
      );
    }

    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
