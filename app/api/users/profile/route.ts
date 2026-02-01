import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/database';
import { User } from '../../../../models/User';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    /* =========================
       FIND USER (LIMITED FIELDS)
    ========================= */
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select(
      `
        name
        email
        mobileNumber
        profilePicture
        designation
        skills
        profile.bio
      `
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    /* =========================
       RESPONSE (SAFE PAYLOAD)
    ========================= */
    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber || null,
        profilePicture: user.profilePicture || null,
        designation: user.designation || null,
        skills: user.skills || [],
        bio: user.profile?.bio || null,
      },
    });
  } catch (error) {
    console.error('GET USER PROFILE ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
