import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/database'
import { User } from '../../../models/User'

export async function PUT(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()

    /**
     * 🔒 SECURITY:
     * Only allow these fields to be updated
     * Everything else is ignored even if frontend sends it
     */
    const updateData: any = {
      name: body.name,
      mobileNumber: body.mobileNumber,
      designation: body.designation,
      skills: body.skills,

      profile: {
        bio: body.profile?.bio,
        website: body.profile?.website,
        location: body.profile?.location,
        gender: body.profile?.gender
      },

      preferences: {
        theme: body.preferences?.theme,
        language: body.preferences?.language,
        notifications: {
          email: body.preferences?.notifications?.email,
          push: body.preferences?.notifications?.push,
          sms: body.preferences?.notifications?.sms
        }
      },

      socialLinks: {
        linkedin: body.socialLinks?.linkedin || undefined,
        twitter: body.socialLinks?.twitter || undefined,
        instagram: body.socialLinks?.instagram || undefined,
        facebook: body.socialLinks?.facebook || undefined
      }
    }

    /**
     * 🧠 Identify user
     * We trust email because you are already controlling it from cookie
     */
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'Email missing' },
        { status: 400 }
      )
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: body.email },
      { $set: updateData },
      { new: true }
    ).select('-password')

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
