import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'
import { Otp } from '../../../../../models/Otp'
import bcrypt from 'bcryptjs'
import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, newPassword, token } = body

    /* ---------- Validation ---------- */

    if (!email || !newPassword || !token) {
      return NextResponse.json(
        createErrorResponse('All fields are required'),
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        createErrorResponse('Password must be at least 6 characters long'),
        { status: 400 }
      )
    }

    /* ---------- DB ---------- */

    await connectDB()

    /* ---------- Check OTP already verified ---------- */

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      purpose: 'reset-password',
      isUsed: true   // verified OTP
    })

    if (!otpRecord) {
      return NextResponse.json(
        createErrorResponse('OTP verification required'),
        { status: 400 }
      )
    }

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

    /* ---------- Hash password ---------- */

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    user.password = hashedPassword
    await user.save()

    /* ---------- Cleanup OTP ---------- */

    await Otp.deleteMany({
      email: email.toLowerCase(),
      purpose: 'reset-password'
    })

    return NextResponse.json(
      createSuccessResponse(
        {},
        'Password reset successfully'
      ),
      { status: 200 }
    )

  } catch (error) {
    console.error('Reset password error:', error)

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
