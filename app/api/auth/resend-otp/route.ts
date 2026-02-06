import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/database'
import { User } from '../../../../models/User'
import { Otp } from '../../../../models/Otp'
import { validateEmail } from '../../../../utils/validateEmail'
import {
  createSuccessResponse,
  createErrorResponse
} from '../../../../utils/response'
import { sendOtpMail } from '../../../../utils/sendEmail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body as { email?: string }

    /* ---------- VALIDATION ---------- */

    if (!email) {
      return NextResponse.json(
        createErrorResponse('Email is required'),
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        createErrorResponse('Please enter a valid email address'),
        { status: 400 }
      )
    }

    /* ---------- DB + USER CHECK ---------- */

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    // Optional: if already verified, you could block resend
    // if (user.isEmailVerified) {
    //   return NextResponse.json(
    //     createErrorResponse('Email already verified'),
    //     { status: 400 }
    //   )
    // }

    /* ---------- GENERATE NEW OTP ---------- */

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Clear previous signup OTPs for this user/email
    await Otp.deleteMany({
      email: user.email,
      purpose: 'signup'
    })

    await Otp.create({
      userId: user._id,
      email: user.email,
      otp,
      purpose: 'signup',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })

    /* ---------- SEND MAIL ---------- */

    try {
      await sendOtpMail(user.email, otp)
    } catch (err) {
      console.error('Resend OTP mail failed:', err)
      // Don’t fail hard – but you may want to surface error
    }

    return NextResponse.json(
      createSuccessResponse(null, 'OTP resent successfully'),
      { status: 200 }
    )
  } catch (error) {
    console.error('Resend OTP error:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

