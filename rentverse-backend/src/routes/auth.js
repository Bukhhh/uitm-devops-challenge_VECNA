const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../config/database');
const { passport, handleAppleSignIn } = require('../config/passport');
const { generateOTP, verifyOTP, sendOTPEmail } = require('../services/otpService');

const router = express.Router();

// Initialize Passport
router.use(passport.initialize());

// ==========================================
// 🔐 STEP 1: LOGIN (Check Password & Send OTP)
// ==========================================
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Generate OTP
      const { secret, token } = generateOTP();

      // Save OTP Secret to Database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaSecret: secret,
          otp: token,
          otpExpires: new Date(Date.now() + 5 * 60 * 1000)
        }
      });

      console.log("👉 DEBUG OTP CODE:", token);
      // Send Email
      await sendOTPEmail(email, token);

      res.json({
        success: true,
        message: 'OTP sent to email. Please verify.',
        requireOTP: true,
        email: email
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ==========================================
// 🔐 STEP 2: VERIFY OTP (Check Code & Issue Token)
// ==========================================
router.post(
  '/verify-otp',
  [body('email').isEmail().normalizeEmail(), body('otp').isLength({ min: 6, max: 6 })],
  async (req, res) => {
    try {
      const { email, otp } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (!user.otpExpires || new Date() > user.otpExpires) {
        return res.status(400).json({ success: false, message: 'OTP expired. Please login again.' });
      }

      const isValid = verifyOTP(otp, user.mfaSecret);
      
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid OTP code' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      await prisma.user.update({
        where: { id: user.id },
        data: { otp: null, otpExpires: null }
      });

      const { password: _, mfaSecret: __, ...userWithoutSecrets } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutSecrets,
          token,
        },
      });

    } catch (error) {
      console.error('OTP Verification error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ==========================================
// REGISTRATION
// ==========================================
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty().trim().withMessage('First name is required'),
    body('lastName').notEmpty().trim().withMessage('Last name is required'),
    body('dateOfBirth').optional().isISO8601(),
    body('phone').optional().trim(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }

      const { email, password, firstName, lastName, dateOfBirth, phone } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const fullName = `${firstName} ${lastName}`;

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          name: fullName,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          phone: phone || null,
          role: 'USER',
        },
        select: { id: true, email: true, role: true, isActive: true },
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ success: true, message: 'User registered successfully', data: { user, token } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ==========================================
// GET USER PROFILE
// ==========================================
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// ==========================================
// CHECK EMAIL
// ==========================================
router.post('/check-email', [body('email').isEmail().normalizeEmail()], async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, isActive: true, role: true } });
    
    if (!user) return res.json({ success: true, data: { exists: false } });
    res.json({ success: true, data: { exists: true, isActive: user.isActive, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
});

// ==========================================
// OAUTH ROUTES (Simplified)
// ==========================================
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
  try {
    if (!req.user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=google`);
  } catch (e) { res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`); }
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false }), async (req, res) => {
  try {
    if (!req.user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=facebook`);
  } catch (e) { res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`); }
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false }), async (req, res) => {
  try {
    if (!req.user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=github`);
  } catch (e) { res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`); }
});

router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { session: false }), async (req, res) => {
  try {
    if (!req.user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&provider=twitter`);
  } catch (e) { res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_error`); }
});

module.exports = router;