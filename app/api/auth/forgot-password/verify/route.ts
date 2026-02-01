import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Otp } from '../../../../../models/Otp'
import { createSuccessResponse, createErrorResponse } from '../../../../../utils/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, token } = body

    /* ---------- Validation ---------- */

    if (!email || !otp || !token) {
      return NextResponse.json(
        createErrorResponse('All fields are required'),
        { status: 400 }
      )
    }

    /* ---------- DB ---------- */

    await connectDB()

    /* ---------- Find OTP ---------- */

    const otpRecord = await Otp.findOne({
      email: email.toLowerCase(),
      otp,
      purpose: 'reset-password',
      isUsed: false
    })

    if (!otpRecord) {
      return NextResponse.json(
        createErrorResponse('Invalid OTP'),
        { status: 400 }
      )
    }

    /* ---------- Check expiry ---------- */

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        createErrorResponse('OTP expired'),
        { status: 400 }
      )
    }

    /* ---------- Mark OTP used ---------- */

    otpRecord.isUsed = true
    await otpRecord.save()

    return NextResponse.json(
      createSuccessResponse(
        {},
        'OTP verified successfully'
      ),
      { status: 200 }
    )

  } catch (error) {
    console.error('Verify OTP error:', error)

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
