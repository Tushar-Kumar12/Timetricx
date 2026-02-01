import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/database'
import { User } from '../../../../models/User'
import jwt, { JsonWebTokenError } from 'jsonwebtoken'
import cloudinary from '../../../../lib/cloudinary'
import { createSuccessResponse, createErrorResponse } from '../../../../utils/response'

export async function POST(request: NextRequest) {
  try {
    /* ---------- TOKEN ---------- */

    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        createErrorResponse('Authorization token required'),
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET!
    )

    /* ---------- FORM DATA ---------- */

    const data = await request.formData()
    const fullName = data.get('fullName') as string
    const githubId = data.get('githubId') as string
    const shift = data.get('shift') as string  
    const profilePictureFile = data.get('profilePicture') as File | null
    console.log("FILE RECEIVED:", profilePictureFile)

    /* ---------- DB ---------- */

    await connectDB()

    const user = await User.findById(decoded.userId)

    if (!user) {
      return NextResponse.json(
        createErrorResponse('User not found'),
        { status: 404 }
      )
    }

    /* ---------- CLOUDINARY UPLOAD (ALL TYPES) ---------- */

    if (!profilePictureFile || profilePictureFile.size === 0) {
      return NextResponse.json(
        createErrorResponse('Profile picture is required'),
        { status: 400 }
      )
    }

    let uploadedImage = ''

    try {
      const bytes = await profilePictureFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadRes = await cloudinary.uploader.upload(
        `data:${profilePictureFile.type};base64,${buffer.toString('base64')}`,
        {
          folder: 'timetricx/users',
          resource_type: 'auto',
          quality: 'auto',
          transformation: [
            { width: 280, height: 350, crop: 'fill', gravity: 'face' }
          ],
          format: 'webp'
        }
      )

      uploadedImage = uploadRes.secure_url
      user.profilePicture = uploadedImage

    } catch (error) {
      console.error("CLOUDINARY ERROR:", error)
      return NextResponse.json(
        createErrorResponse('Image upload failed'),
        { status: 500 }
      )
    }

    /* ---------- UPDATE FIELDS ---------- */

    if (fullName) {
      user.name = fullName.trim()
    }
    if (shift) {
      user.shift = shift.trim()   // ✅ SAVE SHIFT
    }

    if (githubId) {
  if (!user.authProviders) user.authProviders = {}

  const cleanGithubUsername = githubId.trim()
  const githubProfileUrl = cleanGithubUsername.startsWith('http')
    ? cleanGithubUsername
    : `https://github.com/${cleanGithubUsername}`

  user.authProviders.github = {
    id: githubProfileUrl,          // 🔥 FULL URL
    username: cleanGithubUsername, // 🔥 RAW USERNAME
    email: user.email              // 🔥 AS-IT-IS
  }
}


    await user.save()

    /* ---------- RESPONSE ---------- */

    const userResponse = user.toObject()
    delete userResponse.password

    return NextResponse.json(
      createSuccessResponse(
        { user: userResponse },
        'Profile updated successfully'
      ),
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Update profile error:', error)

    if (error instanceof JsonWebTokenError) {
      return NextResponse.json(
        createErrorResponse('Invalid token'),
        { status: 401 }
      )
    }

    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ')
      return NextResponse.json(
        createErrorResponse(message),
        { status: 400 }
      )
    }

    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

/* BLOCK METHODS */

export async function GET() {
  return NextResponse.json(
    createErrorResponse('Method not allowed'),
    { status: 405 }
  )
}
