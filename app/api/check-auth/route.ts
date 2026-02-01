import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/database'
import { User } from '../../../models/User'
import { generateToken } from '../../../utils/generateToken'
import { createSuccessResponse, createErrorResponse } from '../../../utils/response'

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

    await connectDB()

    /* ---------- Find user ---------- */

    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('authProviders role email name')

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    /* ---------- AUTH PROVIDER CHECK ---------- */

    const hasGithub = !!user.authProviders?.github?.id
    const hasGoogle = !!user.authProviders?.google?.id

    // 🔥 GitHub not linked
    if (!hasGithub) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account exists. Please continue with GitHub',
          action: 'github'
        },
        { status: 409 }
      )
    }

    // 🔥 Google not linked
    if (!hasGoogle) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account exists. Please continue with Google',
          action: 'google'
        },
        { status: 409 }
      )
    }

    /* ---------- GENERATE NEW TOKEN ---------- */

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    })

    const userResponse = user.toObject()

    return NextResponse.json(
      createSuccessResponse(
        {
          user: userResponse,
          token // 👈 NEW token
        },
        'Auth verified'
      ),
      { status: 200 }
    )
  } catch (error) {
    console.error('Check-auth error:', error)

    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

/* ---------- Block other methods ---------- */

export async function GET() {
  return NextResponse.json(
    createErrorResponse('Method not allowed'),
    { status: 405 }
  )
}
