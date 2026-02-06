import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/database'
import { User } from '../../../../models/User'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // 🔍 Find user by email
    const user = await User.findOne(
      { email: email.toLowerCase() },
      { authProviders: 1 } // sirf authProviders
    ).lean()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const hasGoogle = !!user.authProviders?.google?.id
    const hasGithub = !!user.authProviders?.github?.id

    // ✅ agar dono providers linked hai
    const hasAnyProvider = hasGoogle && hasGithub

    return NextResponse.json({
      success: true,
      hasAuthProvider: hasAnyProvider,
      providers: {
        google: hasGoogle,
        github: hasGithub
      }
    })
  } catch (error) {
    console.error('Auth provider check error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

/* ❌ Block other methods */
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  )
}
