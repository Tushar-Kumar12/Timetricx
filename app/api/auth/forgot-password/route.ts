import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/database'
import { User } from '../../../../models/User'
import { Otp } from '../../../../models/Otp'
import { generateToken } from '../../../../utils/generateToken'
import { sendOtpMail } from '../../../../utils/sendEmail'
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    /* ---------- Validation ---------- */

    if (!email) {
      return NextResponse.json(
        createErrorResponse('Email is required'),
        { status: 400 }
      )
    }

    /* ---------- DB ---------- */

    await connectDB()

    /* ---------- Find user ---------- */

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    /* ---------- Generate OTP ---------- */

    const otp = Math.floor(1000000 + Math.random() * 9000000).toString()
    console.log("Generated Reset OTP:", otp)

    try {
      const savedOtp = await Otp.create({
        userId: user._id,
        email: user.email,
        otp,
        purpose: 'reset-password',
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      })
      console.log("Reset OTP SAVED IN DB:", savedOtp)
    } catch (err) {
      console.error("Reset OTP SAVE ERROR:", err)
    }

    /* ---------- Send Mail ---------- */

    try {
      console.log("📧 Attempting to send reset OTP to:", user.email)
      await sendOtpMail(user.email, otp)
      console.log("✅ Reset OTP email sent successfully")
    } catch (emailError) {
      console.error("❌ Failed to send reset OTP email:", emailError)
    }

    /* ---------- Generate token ---------- */

    const token = generateToken({
      userId: user._id,
      email: user.email,
      purpose: 'password-reset'
    })

    return NextResponse.json(
      createSuccessResponse(
        { token },
        'OTP sent successfully'
      ),
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)

    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

/* Block other methods */

export async function GET() {
  return NextResponse.json(
    createErrorResponse('Method not allowed'),
    { status: 405 }
  )
}
