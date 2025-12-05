const express = require('express');
const { body } = require('express-validator');
// Correctly import 'protect' from middleware
const { protect, authorize } = require('../../middleware/auth');
const usersController = require('./users.controller');

const router = express.Router();

// ==========================================
// 🔓 PUBLIC ROUTES
// ==========================================
// None (All user management requires login)

// ==========================================
// 🔐 PROTECTED ROUTES (Must be Logged In)
// ==========================================

// Get own profile
router.get('/profile', protect, usersController.getProfile);

// Update own profile
router.patch(
  '/profile',
  protect,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('dateOfBirth').optional().isISO8601(),
    body('phone').optional().trim(),
    body('profilePicture').optional().isURL(),
  ],
  usersController.updateProfile
);

// ==========================================
// 🛡️ ADMIN ONLY ROUTES
// ==========================================

// Create User (Admin)
router.post(
  '/',
  protect,
  authorize('ADMIN'),
  [
    body('email').isEmail().normalizeEmail(),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['USER', 'ADMIN']),
  ],
  usersController.createUser
);

// Get All Users (Admin)
router.get('/', protect, authorize('ADMIN'), usersController.getAllUsers);

// Delete User (Admin)
router.delete('/:id', protect, authorize('ADMIN'), usersController.deleteUser);

// ==========================================
// 🔐 GENERIC ID ROUTES (Must be last)
// ==========================================

// Get User by ID
router.get('/:id', protect, usersController.getUserById);

// Update User by ID
router.patch(
  '/:id',
  protect,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('dateOfBirth').optional().isISO8601(),
    body('role').optional().isIn(['USER', 'ADMIN']),
    body('isActive').optional().isBoolean(),
  ],
  usersController.updateUser
);

module.exports = router;