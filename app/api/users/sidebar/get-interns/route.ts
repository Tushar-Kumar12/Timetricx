import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/database';
import { User } from '../../../../../models/User';

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();

    /* =========================
       BASE FILTER
    ========================= */
    const match: any = {
      isEmailVerified: true,
      isActive: true,
      role: 'user',
    };

    /* =========================
       SEARCH (NAME / EMAIL)
    ========================= */
    if (search) {
      match.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    /* =========================
       AGGREGATION
    ========================= */
    const users = await User.aggregate([
      { $match: match },

      // 🔥 random only when no search
      ...(search ? [] : [{ $sample: { size: 10 } }]),

      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          profilePicture: 1,
        },
      },
    ]);

    /* =========================
       FORMAT RESPONSE
    ========================= */
    const interns = users.map((u: any) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,

      // 🖼 profile picture
      avatar:
        u.profilePicture && u.profilePicture.trim() !== ''
          ? u.profilePicture
          : null,

      // fallback initials
      initials: u.name
        ? u.name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : 'U',
    }));

    return NextResponse.json({
      success: true,
      interns,
    });
  } catch (error) {
    console.error('GET INTERNS ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
