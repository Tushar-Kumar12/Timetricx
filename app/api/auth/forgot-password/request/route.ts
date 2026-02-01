import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'
import { Otp } from '../../../../../models/Otp'
import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response'
import { sendOtpMail } from '../../../../../utils/sendEmail'
import crypto from 'crypto'

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

    const user = await User.findOne({
      email: email.toLowerCase()
    })

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    /* ---------- Delete old OTP ---------- */

    await Otp.deleteMany({
      email: user.email,
      purpose: 'reset-password'
    })

    /* ---------- Generate OTP ---------- */

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await Otp.create({
      userId: user._id,
      email: user.email,
      otp,
      purpose: 'reset-password',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min
    })

    /* ---------- Send Mail ---------- */

    await sendOtpMail(user.email, otp)

    /* ---------- Reset Token (for frontend) ---------- */

    const resetToken = crypto.randomBytes(32).toString('hex')

    return NextResponse.json(
      createSuccessResponse(
        {
          token: resetToken
        },
        'OTP sent to your email'
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
