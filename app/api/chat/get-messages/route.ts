import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/database';
import { Project } from '../../../../models/Project';
import Chat from '../../../../models/Chat';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, projectName } = await req.json();

    /* =====================
       BASIC VALIDATION
    ===================== */
    if (!email || !projectName) {
      return NextResponse.json(
        { success: false, message: 'Email and project name required' },
        { status: 400 }
      );
    }

    /* =====================
       PROJECT CHECK
    ===================== */
    const project = await Project.findOne(
      {
        name: projectName,
        teamEmails: email, // email must be part of team
      },
      { name: 1 }
    ).lean();

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: 'Access denied or project not found',
        },
        { status: 403 }
      );
    }

    /* =====================
       FETCH CHAT MESSAGES
    ===================== */
    const messages = await Chat.find(
      { projectName },
      {
        senderEmail: 1,
        message: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: 1 }) // oldest → newest
      .lean();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('GET CHAT ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
