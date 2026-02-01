import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { SupportSubmissionModel } from '../../../../models/SupportSubmission'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // minimal sanity (optional)
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name & email required' },
        { status: 400 }
      )
    }

    // 🔥 jo aaya usi se model bna
    const submission = SupportSubmissionModel.create(body)

    // 🔥 abhi sirf return (no fs, no db)
    return NextResponse.json({
      success: true,
      data: submission,
    })
  } catch (err) {
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
