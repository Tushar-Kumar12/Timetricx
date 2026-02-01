import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    // 🔍 Find projects where user is in teamEmails
    const projects = await Project.find(
      { teamEmails: email },
      { name: 1, tasks: 1 } // 👈 tasks bhi lao
    ).lean()

    // 🧾 Map name + total tasks
    const result = projects.map(p => ({
      projectName: p.name,
      totalTasks: Array.isArray(p.tasks) ? p.tasks.length : 0
    }))

    return NextResponse.json({
      success: true,
      projects: result
    })

  } catch (err) {
    console.error('Project names fetch error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch project names' },
      { status: 500 }
    )
  }
}
