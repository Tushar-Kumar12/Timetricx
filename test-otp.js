// Test file to check OTP functionality
const mongoose = require('mongoose');
require('dotenv').config();

async function testOTP() {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/timetricx');
    console.log('✅ Connected to MongoDB');

    // Check if OTP model exists
    const Otp = mongoose.models.Otp || mongoose.model('Otp', new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      email: { type: String, lowercase: true },
      otp: { type: String, required: true },
      purpose: { type: String, enum: ['signup', 'login', 'reset-password'], required: true },
      expiresAt: { type: Date, required: true },
      isUsed: { type: Boolean, default: false }
    }, { timestamps: true }));

    // Generate test OTP
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔢 Generated OTP:', testOTP);

    // Save OTP to DB
    const savedOTP = await Otp.create({
      userId: new mongoose.Types.ObjectId(),
      email: 'test@example.com',
      otp: testOTP,
      purpose: 'signup',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    console.log('💾 OTP saved to DB:', savedOTP);

    // Check if OTP exists in DB
    const foundOTP = await Otp.findOne({ email: 'test@example.com', otp: testOTP });
    console.log('🔍 OTP found in DB:', foundOTP ? 'YES' : 'NO');

    // Test email sending
    const nodemailer = require('nodemailer');
    
    console.log('📧 Email Config Check:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST ? 'SET' : 'NOT SET');
    console.log('SMTP_USER:', process.env.SMTP_USER ? 'SET' : 'NOT SET');
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? 'SET' : 'NOT SET');

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      try {
        await transporter.verify();
        console.log('✅ SMTP connection successful');
        
        const info = await transporter.sendMail({
          from: `"Test" <${process.env.SMTP_USER}>`,
          to: 'test@example.com',
          subject: 'Test OTP',
          html: `<h1>Test OTP: ${testOTP}</h1>`,
        });
        console.log('📨 Email sent:', info.messageId);
      } catch (emailError) {
        console.error('❌ Email error:', emailError.message);
      }
    } else {
      console.log('❌ Email credentials not configured');
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testOTP();
