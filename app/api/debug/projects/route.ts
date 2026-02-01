import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/database';
import { Project } from '../../../../models/Project';

export async function GET() {
  try {
    await connectDB();
    
    // Get all projects (no filter)
    const allProjects = await Project.find({}).lean();
    console.log('DEBUG - All projects in DB:', allProjects.length);
    
    // Get sample project details
    const sampleProject = allProjects[0];
    console.log('DEBUG - Sample project:', sampleProject);
    
    return NextResponse.json({
      success: true,
      totalProjects: allProjects.length,
      sampleProject: sampleProject ? {
        name: sampleProject.name,
        teamEmails: sampleProject.teamEmails,
        teamSize: sampleProject.teamEmails?.length || 0
      } : null
    });
  } catch (error) {
    console.error('DEBUG ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
