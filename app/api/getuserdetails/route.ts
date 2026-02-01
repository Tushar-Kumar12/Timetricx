import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/database'
import { User } from '../../../models/User'
import { createSuccessResponse, createErrorResponse } from '../../../utils/response'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        createErrorResponse('Email is required'),
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase() }).select('-password')

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    return NextResponse.json(
      createSuccessResponse({ user }, 'User details retrieved successfully'),
      { status: 200 }
    )

  } catch (error) {
    console.error('Get user details error:', error)
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}
