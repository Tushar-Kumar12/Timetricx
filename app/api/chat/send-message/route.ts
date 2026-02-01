import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/database';
import { Project } from '../../../../models/Project';
import  Chat  from '../../../../models/Chat';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, projectName, message } = await req.json();

    /* =====================
       BASIC VALIDATION
    ===================== */
    if (!email || !projectName || !message?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email, project name and message required' },
        { status: 400 }
      );
    }

    /* =====================
       PROJECT + ACCESS CHECK
    ===================== */
    const project = await Project.findOne(
      {
        name: projectName,
        teamEmails: email,
      } as any
    ).select('_id').lean();

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: 'You are not allowed to send message in this project',
        },
        { status: 403 }
      );
    }

    /* =====================
       SAVE CHAT MESSAGE
    ===================== */
    const chat = await Chat.create({
      projectName,
      senderEmail: email,
      message: message.trim(),
    });

    return NextResponse.json({
      success: true,
      message: {
        _id: chat._id,
        senderEmail: chat.senderEmail,
        message: chat.message,
        createdAt: chat.createdAt,
      },
    });
  } catch (error) {
    console.error('SEND MESSAGE ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
