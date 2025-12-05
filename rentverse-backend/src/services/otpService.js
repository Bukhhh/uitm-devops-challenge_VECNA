const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');

// Configure Email Transporter (Use Gmail or a fake SMTP like Ethereal for dev)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Add this to your .env later
    pass: process.env.EMAIL_PASS, // Add this to your .env later
  },
});

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
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

module.exports = { generateOTP, verifyOTP, sendOTPEmail };