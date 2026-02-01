import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/database';
import cloudinary from '../../../../../lib/cloudinary';
import InternDocument from '../../../../../models/InternDocument';
import path from 'path';

export async function POST(req: Request) {
  try {
    await connectDB();

    const formData = await req.formData();
    const email = formData.get('email') as string;
    const docType = formData.get('docType') as string;
    const file = formData.get('file') as File;

    if (!email || !docType || !file) {
      return NextResponse.json(
        { success: false, message: 'Missing fields' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isPdf = file.type === 'application/pdf';

    // 🔥 filename + extension force
    const originalName = file.name || `${docType}`;
    const ext = path.extname(originalName) || (isPdf ? '.pdf' : '');
    const baseName = path.basename(originalName, ext);

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `intern-documents/${email}`,
          resource_type: 'raw',   // 🔒 correct for PDFs
          public_id: `${baseName}_${Date.now()}${ext}`, // Add extension to public_id
          use_filename: true,
          unique_filename: false,
          overwrite: true,
        },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      ).end(buffer);
    });

    // 🔐 SAVE RAW URL (frontend will make it viewable)
    await InternDocument.findOneAndUpdate(
      { internEmail: email },
      { $set: { [docType]: uploadResult.secure_url } },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url, // ✅ now ends with .pdf
      isPdf,
    });
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
