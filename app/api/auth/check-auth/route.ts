import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/database'
import { User } from '../../../../models/User'
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body
    console.log('Email:', email)

    /* ---------- Validation ---------- */
    if (!email) {
      return NextResponse.json(
        createErrorResponse('Email is required'),
        { status: 400 }
      )
    }

    await connectDB()
    console.log('Database connected')
    /* ---------- Find user ---------- */
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('authProviders email role name')

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      )
    }
    console.log('User found:', user)
    /* ---------- AUTH PROVIDER CHECK ---------- */
    const hasGithub = !!user.authProviders?.github?.id
    const hasGoogle = !!user.authProviders?.google?.id

    // ❌ Agar dono linked nahi hain
    if (!hasGithub || !hasGoogle) {
      return NextResponse.json(
        {
          success: false,
          linked: {
            github: hasGithub,
            google: hasGoogle,
          },
        },
        { status: 200 }
      )
    }
    console.log('Both providers linked')
    /* ---------- BOTH PROVIDERS LINKED ---------- */
    return NextResponse.json(
      createSuccessResponse(
        {
          user: user.toObject(),
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
console.log('Check-auth route loaded')
/* ---------- Block other methods ---------- */
export async function GET() {
  return NextResponse.json(
    createErrorResponse('Method not allowed'),
    { status: 405 }
  )
}
