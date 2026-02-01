import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/database';
import { Project } from '../../../../../models/Project';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email } = await req.json();
    console.log('TRACK TEAM API - Received email:', email);

    /* =====================
       BASIC VALIDATION
    ===================== */
    if (!email) {
      console.log('TRACK TEAM API - No email provided');
      return NextResponse.json(
        { success: false, message: 'Email required' },
        { status: 400 }
      );
    }

    /* =====================
       FETCH PROJECTS
    ===================== */
    console.log('TRACK TEAM API - Querying projects for email:', email);
    const projects = await Project.find(
      {
        teamEmails: email,               // user is part of team
        $expr: { $gt: [{ $size: '$teamEmails' }, 1] }, // team size > 1
      },
      {
        name: 1,
        teamEmails: 1,
      }
    )
      .limit(3)
      .lean();

    console.log('TRACK TEAM API - Raw projects found:', projects);
    console.log('TRACK TEAM API - Number of projects:', projects.length);

    /* =====================
       FORMAT RESPONSE
    ===================== */
    const formattedProjects = projects.map(project => ({
      projectName: project.name,
      teamEmails: project.teamEmails,
    }));

    console.log('TRACK TEAM API - Formatted projects:', formattedProjects);

    return NextResponse.json({
      success: true,
      projects: formattedProjects,
    });
  } catch (error) {
    console.error('TRACK TEAM ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
