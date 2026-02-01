import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/database';
import InternDocument from '../../../../../models/InternDocument';

/* =========================
   GET: FETCH UPLOADED DOCS
========================= */
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email required' },
        { status: 400 }
      );
    }

    const docs = await InternDocument.findOne(
      { internEmail: email },
      {
        _id: 0,
        resume: 1,
        aadhar: 1,
        collegeId: 1,
        offerLetter: 1,
        noc: 1,
      }
    ).lean();

    return NextResponse.json({
      success: true,
      documents: docs || {
        resume: null,
        aadhar: null,
        collegeId: null,
        offerLetter: null,
        noc: null,
      },
    });
  } catch (error) {
    console.error('FETCH INTERN DOCS ERROR:', error);

    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
