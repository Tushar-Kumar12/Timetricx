import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required' },
        { status: 400 }
      )
    }

    /* 1️⃣ Find projects where user is in team */
    const projects = await Project.find({
      teamEmails: email
    }).lean()

    /* 2️⃣ Only TEAM projects (exclude solo) */
    const teamProjects = projects.filter(
      p => p.teamEmails.length > 1
    )

    /* 3️⃣ Total Teams */
    const totalTeams = teamProjects.length

    /* 4️⃣ Total Members (ONLY team projects) */
    const totalMembers = teamProjects.reduce(
      (sum, p) => sum + p.teamEmails.length,
      0
    )

    /* 5️⃣ Status count (only team projects) */
    let activeProjects = 0
    let pendingProjects = 0
    let completedProjects = 0

    teamProjects.forEach(p => {
      if (p.status === 'active') activeProjects++
      if (p.status === 'pending') pendingProjects++
      if (p.status === 'completed') completedProjects++
    })

    return NextResponse.json({
      success: true,
      data: {
        totalTeams,
        totalMembers,
        activeProjects,
        pendingProjects,
        completedProjects
      }
    })

  } catch (err) {
    console.error('Team overview error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
