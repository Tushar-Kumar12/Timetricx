import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/database'
import { Project } from '../../../../../models/Project'

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const body = await req.json()
    const { email, projectName, completedTasks } = body

    /* ---------- Validation ---------- */
    if (!email || !projectName || completedTasks === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (completedTasks < 0) {
      return NextResponse.json(
        { success: false, message: 'Completed tasks cannot be negative' },
        { status: 400 }
      )
    }

    /* ---------- Find Project ---------- */
    const project = await Project.findOne({
      name: projectName,
      teamEmails: email
    })

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          message: 'Project not found or user not part of this project'
        },
        { status: 404 }
      )
    }

    /* ---------- CORE LOGIC ---------- */
    const existingCompleted = project.tasks.completed
    const total = project.tasks.total

    // 🔥 max(existing, incoming) but <= total
    const finalCompleted = Math.min(
      total,
      Math.max(existingCompleted, Number(completedTasks))
    )

    project.tasks.completed = finalCompleted

    /* ---------- STATUS LOGIC ---------- */
    if (finalCompleted === 0) {
      project.status = 'pending'
    } else if (finalCompleted < total) {
      project.status = 'active'
    } else if (finalCompleted === total) {
      project.status = 'completed'
    }

    /* ---------- PROGRESS ---------- */
    project.progress = Math.round(
      (project.tasks.completed / total) * 100
    )

    await project.save()

    return NextResponse.json({
      success: true,
      message: 'Tasks updated successfully',
      data: {
        projectName: project.name,
        completed: project.tasks.completed,
        total: project.tasks.total,
        progress: project.progress,
        status: project.status
      }
    })

  } catch (err) {
    console.error('Update completed tasks error:', err)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
