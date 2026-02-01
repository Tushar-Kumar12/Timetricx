import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/database'
import { User } from '../../../../models/User'
import bcrypt from 'bcryptjs'
import { generateToken } from '../../../../utils/generateToken'
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, password } = body

    /* ---------- Validation ---------- */

    if (!identifier || !password) {
      return NextResponse.json(
        createErrorResponse('Email and password are required'),
        { status: 400 }
      )
    }

    await connectDB()

    /* ---------- Find user ---------- */

    const user = await User.findOne({
      email: identifier.toLowerCase()
    }).select('+password authProviders role')

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    /* ---------- PASSWORD CHECK (FIRST) ---------- */

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return NextResponse.json(
        createErrorResponse('Invalid credentials'),
        { status: 401 }
      )
    }

    /* ---------- AUTH PROVIDER CHECK (AFTER PASSWORD) ---------- */

    const hasGithub = !!user.authProviders?.github?.id
    const hasGoogle = !!user.authProviders?.google?.id

    // ✅ Allow login if user has at least one provider OR no providers (email-only account)
    if (hasGithub || hasGoogle || (!hasGithub && !hasGoogle)) {
      /* ---------- Generate token ---------- */

      const token = generateToken({
        userId: user._id,
        email: user.email,
        role: user.role
      })

      const userResponse = await User.findOne({email: identifier.toLowerCase()}).select('+email +mobileNumber +designation +skills +profilePicture')
      delete userResponse.password
      console.log('User response:', userResponse)

      return NextResponse.json(
        createSuccessResponse(
          {
            user: userResponse,
            token
          },
          'Login successful'
        ),
        { status: 200 }
      )
    }

    // 🔥 If user has some providers but missing others, show which one to connect
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

    // 🔥 Google missing
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
  } catch (error) {
    console.error('Signin error:', error)

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
