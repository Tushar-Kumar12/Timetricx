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
    }).select('+password')

    // 🔴 USER EXISTS CHECK
    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    /* ---------- PASSWORD CHECK ---------- */

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      // 🔥 PASSWORD WRONG → CHECK GOOGLE LINK
      const hasGoogle =
        user.authProviders &&
        user.authProviders.google &&
        user.authProviders.google.email

      if (!hasGoogle) {
        return NextResponse.json(
          {
            success: false,
            code: 'GOOGLE_CONNECT_REQUIRED',
            message: 'Google account not linked'
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        createErrorResponse('Invalid credentials'),
        { status: 401 }
      )
    }

    /* ---------- Generate token ---------- */

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role
    })

    const userResponse = user.toObject()
    delete userResponse.password

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

  } catch (error) {
    console.error('Signin error:', error)

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
