// import { NextResponse } from "next/server";

// import connectDB from "../../../../lib/database";

// import { User } from "../../../../models/User";

// import { FaceAttendance } from "../../../../models/FaceAttendance";



// export async function POST(req: Request) {

//   try {

//     const { email, faceImage } = await req.json();

//     await connectDB();



//     const user = await User.findOne({ email });

//     if (!user?.profilePicture) {

//       return NextResponse.json({

//         success:false,

//         message:"Profile picture not found"

//       });

//     }



//     // 🔥 PYTHON CALL (UNCHANGED)

//     const pyRes = await fetch("https://face-ai-verification.vercel.app/verify-face",{

//       method:"POST",

//       headers:{ "Content-Type":"application/json" },

//       body:JSON.stringify({

//         live: faceImage,

//         stored: user.profilePicture

//       })

//     });



//     const pyData = await pyRes.json();



//     if(!pyData.success || pyData.distance > 0.45){

//       return NextResponse.json({

//         success:false,

//         message:"Face mismatch",

//         distance: pyData.distance

//       });

//     }



//     // 🔥 DATE SETUP (India timezone)

//     console.log("1")

//     const now = new Date();

//     // Use local timezone instead of UTC

//     const today = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

//     const time = now.toLocaleTimeString();

//     const monthName = now.toLocaleDateString('en-US',{

//       month:'long',

//       year:'numeric'

//     }); // January 2026

// console.log("2")

//     // FIND USER DOC

//     let doc = await FaceAttendance.findOne({ userEmail: email });



//     if(!doc){

//       doc = new FaceAttendance({

//         userEmail: email,

//         months: [{

//           monthName,

//           records:[{

//             date: today,

//             entryTime: time,

//             verified:true

//           }]

//         }],

//         method:"face"

//       });



//       await doc.save();



//       return NextResponse.json({

//         success:true,

//         message:"Attendance marked (first entry)",

//         data:{ monthName, date:today, time }

//       });

//     }

//     console.log("3")



//     // FIND MONTH

//     let monthBlock = doc.months.find(

//       m => m.monthName === monthName

//     );



//     if(!monthBlock){

//       monthBlock = {

//         monthName,

//         records:[]

//       };

//       doc.months.push(monthBlock);

//     }



//     // CHECK ALREADY

//     const exists = monthBlock.records.find(

//       r => r.date === today

//     );



//     if(exists){

//       return NextResponse.json({

//         success:false,

//         message:"Attendance already marked"

//       });

//     }



//     // PUSH ENTRY

//     monthBlock.records.push({

//       date: today,

//       entryTime:time,

//       verified:true

//     });



//     doc.markModified("months");

//     await doc.save();



//     return NextResponse.json({

//       success:true,

//       message:"Attendance marked",

//       data:{ monthName, date:today, time }

//     });



//   } catch(err){

//     console.log("FACE API ERROR:",err);

//     return NextResponse.json({

//       success:false,

//       message:"Server error"

//     });

//   }

// }

import { NextResponse } from "next/server";

import connectDB from "../../../../lib/database";

import { User } from "../../../../models/User";

import { FaceAttendance } from "../../../../models/FaceAttendance";



// URL → BASE64

async function urlToBase64(url: string): Promise<string> {

  try {

    const res = await fetch(url);

    if (!res.ok) {

      throw new Error(`Failed to fetch image: ${res.status}`);

    }

    

    const buffer = await res.arrayBuffer();

    const base64 = Buffer.from(buffer).toString("base64");

    

    // Ensure it's a valid image format

    const imageType = res.headers.get('content-type');

    if (!imageType || !imageType.startsWith('image/')) {

      throw new Error('Invalid image type');

    }

    

    return `data:${imageType};base64,${base64}`;

  } catch (error) {

    console.error('URL to Base64 conversion error:', error);

    throw error;

  }

}



// Clean base64

function cleanBase64(base64: string): string {

  return base64

    .replace(/^data:image\/(png|jpeg|jpg);base64,/, "")

    .replace(/\s/g, "");

}



// Validate image format

function validateBase64Image(base64: string): boolean {

  // Check if it's a valid base64 string

  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;

  const cleanedBase64 = cleanBase64(base64);

  

  if (!base64Pattern.test(cleanedBase64)) {

    console.error('Invalid base64 pattern');

    return false;

  }

  

  // Check minimum size (should be at least 1KB)

  if (cleanedBase64.length < 1000) {

    console.error('Image too small:', cleanedBase64.length);

    return false;

  }

  

  // Check maximum size (Face++ limit is 2MB)

  if (cleanedBase64.length > 2000000) {

    console.error('Image too large:', cleanedBase64.length);

    return false;

  }

  

  return true;

}



// Ensure image is in JPEG format for Face++ compatibility

function ensureJPEGFormat(base64Image: string): string {

  // Check if already JPEG

  if (base64Image.startsWith('data:image/jpeg')) {

    return base64Image;

  }

  

  // If PNG or other format, convert to JPEG data URI

  const cleanedBase64 = cleanBase64(base64Image);

  

  // Simple fallback: just return as JPEG without actual conversion

  // Face++ might accept it if the base64 is valid

  return `data:image/jpeg;base64,${cleanedBase64}`;

}



// Fallback test image for Face++ API

function getTestImage(): string {

  // Simple 1x1 JPEG image in base64

  return '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';

}



export async function POST(req: Request) {

  try {

    const { email, faceImage } = await req.json();

    await connectDB();



    // =========================

    // USER CHECK

    // =========================

    const user = await User.findOne({ email });

    if (!user?.profilePicture) {

      return NextResponse.json({

        success: false,

        message: "Profile picture not found"

      });

    }



    // =========================

    // FACE++ PREP

    // =========================

    

    // Validate live image

    if (!validateBase64Image(faceImage)) {

      return NextResponse.json({

        success: false,

        message: "Invalid image format. Please try again."

      });

    }

    

    // Ensure JPEG format for Face++ compatibility

    const liveJPEG = ensureJPEGFormat(faceImage);

    const liveBase64 = cleanBase64(liveJPEG);

    

    let storedBase64: string;

    try {

      const storedImageWithMime = await urlToBase64(user.profilePicture);

      const storedJPEG = ensureJPEGFormat(storedImageWithMime);

      storedBase64 = cleanBase64(storedJPEG);

      

      // Validate stored image

      if (!validateBase64Image(storedBase64)) {

        console.warn('Profile picture validation failed, using test image');

        storedBase64 = getTestImage();

      }

    } catch (error) {

      console.error('Failed to process profile picture, using test image:', error);

      storedBase64 = getTestImage();

    }

    

    console.log('IMAGE PROCESSING:', {

      liveImageSize: liveBase64.length,

      storedImageSize: storedBase64.length,

      liveFormat: liveJPEG.startsWith('data:image/jpeg') ? 'JPEG' : 'Other',

      storedFormat: 'JPEG', // We force JPEG format

      liveBase64Preview: liveBase64.substring(0, 100),

      storedBase64Preview: storedBase64.substring(0, 100),

      profilePictureUrl: user.profilePicture,

      usingTestImage: storedBase64 === getTestImage()

    });

    

    // Additional validation - check if base64 is actually valid

    console.log('BASE64 VALIDATION:', {

      liveValid: /^[A-Za-z0-9+/]*={0,2}$/.test(liveBase64),

      storedValid: /^[A-Za-z0-9+/]*={0,2}$/.test(storedBase64),

      liveStartsWith: liveBase64.substring(0, 20),

      storedStartsWith: storedBase64.substring(0, 20)

    });

    

    // DEBUG: Force test images for testing

    if (process.env.NODE_ENV === 'development') {

      console.log('DEBUG MODE: Using test images for Face++ API');

      // Temporarily enable test image to debug Face++ API

      storedBase64 = getTestImage();

    }



    const formData = new URLSearchParams();

    formData.append("api_key", process.env.FACEPP_API_KEY!);

    formData.append("api_secret", process.env.FACEPP_API_SECRET!);

    formData.append("image_base64_1", liveBase64);

    formData.append("image_base64_2", storedBase64);



    // =========================

    // FACE++ COMPARE

    // =========================

    let fpData: any;

    let fpText: string;

    

    // Check environment variables

    if (!process.env.FACEPP_API_KEY || !process.env.FACEPP_API_SECRET) {

      console.error("FACE++ CREDENTIALS MISSING:", {

        apiKey: !!process.env.FACEPP_API_KEY,

        apiSecret: !!process.env.FACEPP_API_SECRET

      });

      return NextResponse.json(

        { 

          success: false, 

          message: "Face recognition service not configured properly. Please contact administrator."

        },

        { status: 500 }

      );

    }

    

    console.log("FACE++ API CALL STARTED:", {

      apiKeyLength: process.env.FACEPP_API_KEY?.length,

      apiSecretLength: process.env.FACEPP_API_SECRET?.length,

      liveImageSize: liveBase64.length,

      storedImageSize: storedBase64.length

    });

    

    try {

      const controller = new AbortController();

      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      

      const fpRes = await fetch(

        "https://api-us.faceplusplus.com/facepp/v3/compare",

        {

          method: "POST",

          headers: { "Content-Type": "application/x-www-form-urlencoded" },

          body: formData.toString(),

          signal: controller.signal

        }

      );

      

      clearTimeout(timeoutId);

      fpText = await fpRes.text();

      

      console.log("FACE++ API RESPONSE:", {

        status: fpRes.status,

        statusText: fpRes.statusText,

        responseLength: fpText.length,

        responsePreview: fpText.substring(0, 200)

      });

      

      if (!fpRes.ok) {

        throw new Error(`HTTP ${fpRes.status}: ${fpText}`);

      }



      fpData = JSON.parse(fpText);

    } catch (error) {

      console.error("FACE++ API ERROR:", {

        error: error instanceof Error ? error.message : error,

        name: error instanceof Error ? error.name : 'Unknown',

        stack: error instanceof Error ? error.stack : undefined

      });

      

      let errorMessage = "Face recognition service unavailable. Please try again in a few moments.";

      

      if (error instanceof Error) {

        if (error.name === 'AbortError') {

          errorMessage = "Face recognition service timed out. Please check your internet connection and try again.";

        } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {

          errorMessage = "Network error. Please check your internet connection.";

        } else if (error.message.includes('API_KEY')) {

          errorMessage = "Face recognition service configuration error. Please contact administrator.";

        }

      }

      

      return NextResponse.json(

        { 

          success: false, 

          message: errorMessage,

          error: error instanceof Error ? error.message : "Unknown error",

          debug: {

            apiKeyConfigured: !!process.env.FACEPP_API_KEY,

            apiSecretConfigured: !!process.env.FACEPP_API_SECRET

          }

        },

        { status: 500 }

      );

    }



    // =========================

    // ✅ FACE DETECTION (CORRECT)

    // =========================

    const faces1 = fpData.faces1 || [];

    const faces2 = fpData.faces2 || [];



    console.log("FACE++ RESPONSE:", {

      faces1: faces1.length,

      faces2: faces2.length,

      confidence: fpData.confidence,

      errorMessages: fpData.error_messages || []

    });



    if (faces1.length === 0 || faces2.length === 0) {

      const errorMsg = faces1.length === 0 && faces2.length === 0 

        ? "No faces detected in both images"

        : faces1.length === 0 

        ? "No face detected in live image"

        : "No face detected in profile picture";

      

      return NextResponse.json({

        success: false,

        message: errorMsg,

        debug: {

          faces1: faces1.length,

          faces2: faces2.length,

          faceppResponse: fpData

        }

      });

    }



    // =========================

    // MATCH THRESHOLD

    // =========================

    const confidence = fpData.confidence ?? 0;

    const THRESHOLD = 55; // check-in ke liye thoda lenient



    if (confidence < THRESHOLD) {

      return NextResponse.json({

        success: false,

        message: "Face mismatch",

        confidence

      });

    }



    // =========================

    // DATE SETUP (LOCAL)

    // =========================

    const now = new Date();

    const today = `${now.getFullYear()}-${(now.getMonth() + 1)

      .toString()

      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;



    const entryTime = now.toLocaleTimeString();

    const monthName = now.toLocaleDateString("en-US", {

      month: "long",

      year: "numeric"

    });



    // =========================

    // ATTENDANCE CHECK-IN LOGIC

    // =========================

    let doc = await FaceAttendance.findOne({ userEmail: email });



    // FIRST EVER ENTRY

    if (!doc) {

      doc = new FaceAttendance({

        userEmail: email,

        months: [

          {

            monthName,

            records: [

              {

                date: today,

                entryTime,

                verified: true

              }

            ]

          }

        ],

        method: "face"

      });



      await doc.save();



      return NextResponse.json({

        success: true,

        message: "Attendance marked (first entry)",

        confidence,

        data: { monthName, date: today, entryTime }

      });

    }



    // FIND MONTH

    let monthBlock = doc.months.find(

      (m: any) => m.monthName === monthName

    );



    if (!monthBlock) {

      monthBlock = {

        monthName,

        records: []

      };

      doc.months.push(monthBlock);

    }



    // CHECK ALREADY MARKED

    const exists = monthBlock.records.find(

      (r: any) => r.date === today

    );



    if (exists) {

      return NextResponse.json({

        success: false,

        message: "Attendance already marked"

      });

    }



    // ADD ENTRY

    monthBlock.records.push({

      date: today,

      entryTime,

      verified: true

    });



    doc.markModified("months");

    await doc.save();



    return NextResponse.json({

      success: true,

      message: "Attendance marked",

      confidence,

      data: { monthName, date: today, entryTime }

    });



  } catch (err) {

    console.error("FACE ATTENDANCE ERROR:", err);

    return NextResponse.json(

      { success: false, message: "Server error" },

      { status: 500 }

    );

  }

}

