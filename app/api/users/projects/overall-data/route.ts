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
        { success: false, message: 'Email required' },
        { status: 400 }
      )
    }

    /* 🔍 user ke projects (teamEmails match) */
    const projects = await Project.find({
      teamEmails: email
    }).lean()

    const total = projects.length
    const active = projects.filter(p => p.status === 'active').length
    const completed = projects.filter(p => p.status === 'completed').length
    const pending = projects.filter(p => p.status === 'pending').length

    return NextResponse.json({
      success: true,
      data: {
        total,
        active,
        completed,
        pending
      }
    })

  } catch (err) {
    console.error('Overall project stats error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
