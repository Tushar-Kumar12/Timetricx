// app/api/team-projects/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Project } from '../../../../../models/Project'
import { User } from '../../../../../models/User'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  // 1️⃣ Find projects where user is part of team
  const projects = await Project.find({
    teamEmails: email,
  })

  const result = []

  for (const project of projects) {
    if (project.teamEmails.length <= 1) continue

    // 2️⃣ Find users for this project
    const users = await User.find({
      email: { $in: project.teamEmails },
    })

    const team = []

    for (const user of users) {
      // 3️⃣ Count how many projects this user is in
      const count = await Project.countDocuments({
        teamEmails: user.email,
      })

      team.push({
        email: user.email,
        name: user.name,
        avatar: user.profilePicture,
        projectCount: count,
      })
    }

    result.push({
      projectId: project._id,
      projectName: project.name,
      team,
    })
  }

  return NextResponse.json({
    success: true,
    projects: result,
  })
}
