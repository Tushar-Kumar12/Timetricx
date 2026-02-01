import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/database';
import { User } from '../../../../models/User';
import { Otp } from '../../../../models/Otp';
import { hashPassword } from '../../../../utils/hashPassword';
import { generateToken } from '../../../../utils/generateToken';
import { validateEmail } from '../../../../utils/validateEmail';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../../../../utils/response';
import { sendOtpMail } from '../../../../utils/sendEmail';

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
      email: email.toLowerCase(),
    }).select('+authProviders');

    /* ---------------- USER EXISTS LOGIC ---------------- */

    if (existingUser) {
      const hasGithub = !!existingUser.authProviders?.github?.id;
      const hasGoogle = !!existingUser.authProviders?.google?.id;

      // 🔴 GitHub NOT linked
      if (!hasGithub) {
        return NextResponse.json(
          {
            success: false,
            message: 'Account exists. Please continue with GitHub',
            action: 'github',
          },
          { status: 409 }
        );
      }

      // 🔴 Google NOT linked
      if (!hasGoogle) {
        return NextResponse.json(
          {
            success: false,
            message: 'Account exists. Please continue with Google',
            action: 'google',
          },
          { status: 409 }
        );
      }

      // 🔴 Both linked
      return NextResponse.json(
        createErrorResponse('User already exists'),
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
      workingrole: workingRole,
      authProviders: {}, // 👈 important
    });

    /* ---------------- OTP GENERATE ---------------- */

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.create({
      userId: newUser._id,
      email: newUser.email,
      otp,
      purpose: 'signup',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    /* ---------------- SEND MAIL ---------------- */

    try {
      await sendOtpMail(newUser.email, otp);
    } catch (err) {
      console.error('OTP mail failed:', err);
    }

    /* ---------------- TOKEN ---------------- */

    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      createSuccessResponse(
        {
          user: userResponse,
          token,
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

    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
