import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { User } from '../../../../../models/User'
import cloudinary from '../../../../../lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    /* ---------- FORM DATA ---------- */

    const data = await request.formData()
    const email = data.get('email') as string
    const file = data.get('image') as File | null

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required' },
        { status: 400 }
      )
    }

    if (!file || file.size === 0) {
      return NextResponse.json(
        { success: false, message: 'Image required' },
        { status: 400 }
      )
    }

    /* ---------- DB ---------- */

    await connectDB()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    /* ---------- CLOUDINARY ---------- */

    let uploadedImage = ''

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadRes = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString('base64')}`,
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

    } catch (err) {
      console.log('Cloudinary error:', err)
      return NextResponse.json(
        { success: false, message: 'Image upload failed' },
        { status: 500 }
      )
    }

    /* ---------- SAVE ---------- */

    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Profile image updated',
      data: {
        profilePicture: uploadedImage
      }
    })

  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

/* BLOCK OTHER METHODS */
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  )
}
