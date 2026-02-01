import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/database'
import { User } from '../../../models/User'
import { createSuccessResponse, createErrorResponse } from '../../../utils/response'

export async function POST(request: NextRequest) {
  try {
    const { email, role, data } = await request.json()

    if (!email || !role || !data) {
      return NextResponse.json(
        createErrorResponse('Email, role, and data are required'),
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    // Initialize roles object if it doesn't exist
    if (!user.roles) {
      user.roles = {}
    }

    // Update role data
    user.roles[role] = {
      company: data.company,
      position: data.position,
      department: data.department,
      updatedAt: new Date()
    }

    await user.save()

    const userResponse = user.toObject()
    delete userResponse.password

    return NextResponse.json(
      createSuccessResponse({ user: userResponse }, 'Role updated successfully'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Update role error:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}
