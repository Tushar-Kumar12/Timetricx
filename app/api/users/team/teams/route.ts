import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'
import { User } from '../../../../../models/User'

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

    /* 1️⃣ Find projects where user is in teamEmails */
    const projects = await Project.find({
      teamEmails: email
    }).lean()

    if (!projects.length) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    /* 2️⃣ Collect all team emails (unique) */
    const allEmails = [
      ...new Set(projects.flatMap(p => p.teamEmails))
    ]

    /* 3️⃣ Fetch users for those emails */
    const users = await User.find(
      { email: { $in: allEmails } },
      { name: 1, email: 1, profilePicture: 1, designation: 1 }
    ).lean()

    /* 4️⃣ Email → user map */
    const userMap: Record<string, any> = {}
    users.forEach(u => {
      userMap[u.email] = {
        email: u.email,
        name: u.name,
        profilePicture: u.profilePicture || '',
        designation: u.designation || 'Member'
      }
    })

    /* 5️⃣ Build final response */
    const result = projects.map(p => ({
      project: p.name,
      status: p.status,
      members: p.teamEmails
        .map(e => userMap[e])
        .filter(Boolean)
    }))

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (err) {
    console.error('Team route error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
