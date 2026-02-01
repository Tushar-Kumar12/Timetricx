import { NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'
import { User } from '../../../../../models/User'

export async function GET(req: Request) {
  try {
    await connectDB()

    /* 1️⃣ Email from query */
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    /* 2️⃣ Fetch ONLY projects where user is in team */
    const projects = await Project.find({
      teamEmails: email
    })
      .sort({ createdAt: -1 })
      .lean()

    /* 3️⃣ Collect all team emails (for avatars) */
    const allEmails = [
      ...new Set(projects.flatMap(p => p.teamEmails))
    ]

    /* 4️⃣ Fetch users for those emails */
    const users = await User.find(
      { email: { $in: allEmails } },
      { email: 1, name: 1, profilePicture: 1 }
    ).lean()

    /* 5️⃣ usersMap */
    const usersMap: Record<string, any> = {}
    users.forEach(u => {
      usersMap[u.email] = {
        name: u.name,
        profilePicture: u.profilePicture || null
      }
    })

    /* 6️⃣ Shape project data */
    const finalProjects = projects.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      status: p.status,
      priority: p.priority,
      progress: p.progress,
      deadline: p.deadline,
      descriptionDriveLink: p.descriptionDriveLink,
      tasks: {
        completed: p.tasks.completed,
        total: p.tasks.total
      },
      teamEmails: p.teamEmails
    }))

    return NextResponse.json({
      success: true,
      projects: finalProjects,
      usersMap
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}
