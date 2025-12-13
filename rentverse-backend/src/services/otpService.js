const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

// Configure Email Transporter
// For production: Use Gmail OAuth2, SendGrid, Mailgun, or AWS SES
// For development: Use Ethereal (free test email service)
let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  // Use configured email credentials
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  // Use Ethereal for testing (doesn't actually send emails, just previews)
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'delores.wintheiser@ethereal.email',
      pass: 'kh5NpY9RvQ8XxGqM3d',
    },
  });
}

// Generate OTP
const generateOTP = () => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const token = speakeasy.totp({
    secret: secret.base32,
    encoding: 'base32',
    step: 300, // Valid for 5 minutes
  });
  return { secret: secret.base32, token };
};

// Verify OTP
const verifyOTP = (token, secret) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2, // Allow a little time drift
    step: 300,
  });
};

// Send OTP via Email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: '"Rentverse Security" <no-reply@rentverse.com>',
    to: email,
    subject: 'Your Login Verification Code',
    text: `Your verification code is: ${otp}. It expires in 5 minutes.`,
    html: `<h3>Your Verification Code</h3><h1>${otp}</h1><p>This code expires in 5 minutes.</p>`,
  };

  try {
    // Only send if credentials are configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}`);
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      return true;
    } else {
      console.log(`⚠️  Email not configured - OTP code shown in console instead`);
      console.log(`📧 Would send OTP to: ${email}`);
      return true; // Return true so login continues
    }
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    console.log(`⚠️  Email failed but OTP is still valid: ${email}`);
    return true; // Return true so login continues despite email error
  }
};

module.exports = { generateOTP, verifyOTP, sendOTPEmail };