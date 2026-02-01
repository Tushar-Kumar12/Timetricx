import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/database'; // apna DB connect path
import { Project } from '../../../../models/Project';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required' },
        { status: 400 }
      );
    }

    // 🔍 find projects where:
    // - email teamEmails me ho
    // - teamEmails length > 1
    const projects = await Project.find(
      {
        teamEmails: email,
        $expr: { $gt: [{ $size: '$teamEmails' }, 1] }
      } as any,
      {
        name: 1,
        teamEmails: 1
      }
    ).lean();

    // 🎯 response shape (frontend-friendly)
    const groups = projects.map((project) => ({
      id: project._id,
      projectName: project.name,
      members: project.teamEmails.length
    }));

    return NextResponse.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('GROUP API ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
