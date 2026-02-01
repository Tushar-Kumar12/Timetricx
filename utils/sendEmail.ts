import nodemailer from "nodemailer";

export const sendOtpMail = async (email: string, otp: string) => {
  try {
    console.log("📩 Trying to send OTP to:", email);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // SMTP connection test
    await transporter.verify();
    console.log("✅ SMTP connected successfully");

const info = await transporter.sendMail({
  from: `"Timetricx" <${process.env.SMTP_FROM}>`,
  to: email,
  subject: "Your OTP Code - Timetricx",
  html: `
  <div style="
    background:#0f172a;
    padding:40px;
    font-family:Arial, sans-serif;
  ">

    <div style="
      max-width:500px;
      margin:auto;
      background:#020617;
      border-radius:16px;
      padding:30px;
      color:white;
      box-shadow:0 0 30px rgba(0,0,0,0.6);
    ">

      <h2 style="
        margin:0 0 10px;
        color:#38bdf8;
      ">
        OTP Verification
      </h2>

      <p style="
        color:#cbd5f5;
        font-size:14px;
        margin-bottom:25px;
      ">
        Use the OTP below to verify your email address.
      </p>

      <div style="
        text-align:center;
        background:linear-gradient(135deg,#2563eb,#22c55e);
        padding:20px;
        border-radius:12px;
        margin-bottom:20px;
      ">

        <h1 style="
          letter-spacing:6px;
          margin:0;
          color:black;
          font-size:32px;
        ">
          ${otp}
        </h1>

      </div>

      <p style="
        text-align:center;
        font-size:13px;
        color:#94a3b8;
      ">
        This OTP is valid for <b>5 minutes</b>.
      </p>

      <hr style="
        border:none;
        border-top:1px solid #000000;
        margin:25px 0;
      ">

      <p style="
        font-size:12px;
        color:#64748b;
        text-align:center;
      ">
        If you didn't request this, please ignore this email.
      </p>

      <p style="
        font-size:12px;
        color:#64748b;
        text-align:center;
      ">
        © ${new Date().getFullYear()} Timetricx
      </p>

    </div>
  </div>
  `,
});


    console.log("📨 Mail sent response:", info);

  } catch (error) {
    console.error("❌ MAIL ERROR:", error);
  }
};
