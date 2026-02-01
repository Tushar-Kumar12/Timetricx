import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email: email as string }).lean()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const profile = user.profile || {}

    // ✅ CHECK ALL REQUIRED FIELDS
    const checks = {
      name:
        typeof user.name === 'string' &&
        user.name.trim().length > 0,

      email:
        typeof user.email === 'string' &&
        user.email.trim().length > 0,

      mobileNumber:
        typeof user.mobileNumber === 'string' &&
        user.mobileNumber.trim().length >= 10,

      designation:
        typeof user.designation === 'string' &&
        user.designation.trim().length > 0,

      skills:
        Array.isArray(user.skills) &&
        user.skills.length > 0,

      bio:
        typeof profile.bio === 'string' &&
        profile.bio.trim().length > 0,

      location:
        typeof profile.location === 'string' &&
        profile.location.trim().length > 0,

      gender:
        ['male', 'female', 'other', 'prefer_not_to_say']
          .includes(profile.gender)
    }

    const missingFields = Object.entries(checks)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    const isProfileComplete = Object.values(checks).every(Boolean)

    console.log('Profile check:', {
      email,
      checks,
      missingFields,
      isProfileComplete
    })

    return NextResponse.json({
      success: true,
      profileCompleted: isProfileComplete,
      missingFields
    })

  } catch (error) {
    console.error('Profile check error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
