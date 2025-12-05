const express = require('express');
const { body } = require('express-validator');
// FIX: Import 'protect' directly (removed the 'auth:' mapping)
const { protect, authorize } = require('../../middleware/auth');
const propertiesController = require('./properties.controller');
const propertyViewsController = require('../propertyViews/propertyViews.controller');

// Dummy upload middleware
const upload = { array: () => (req, res, next) => next() }; 

const router = express.Router();

// ==========================================
// 🔓 PUBLIC ROUTES (Everyone can see)
// ==========================================
router.get('/', propertiesController.getAllProperties);
router.get('/featured', propertiesController.getFeaturedProperties);
router.get('/property/:code', propertiesController.getPropertyByCode);
router.get('/geojson', propertiesController.getGeoJSON);
router.get('/:id', propertiesController.getPropertyById);
router.get('/:id/ratings', propertyViewsController.getPropertyRatings);
router.get('/:id/rating-stats', propertyViewsController.getRatingStats);
router.get('/:id/favorite-stats', propertyViewsController.getFavoriteStats);

// ==========================================
// 🔐 PROTECTED ROUTES (Must be Logged In)
// ==========================================

// --- USER ACTIONS ---
router.get('/favorites', protect, propertyViewsController.getUserFavorites);
router.get('/my-properties', protect, propertiesController.getMyProperties);
router.get('/:id/my-rating', protect, propertyViewsController.getUserRating);
router.get('/:id/favorite-status', protect, propertyViewsController.getFavoriteStatus);

// Create Property
router.post(
  '/',
  protect, // <--- SECURITY GUARD
  authorize('USER', 'ADMIN', 'LANDLORD'),
  upload.array('images', 5),
  [
    body('title').notEmpty().trim(),
    body('address').notEmpty().trim(),
    body('price').isFloat({ min: 0 }),
    body('propertyTypeId').notEmpty().isUUID(),
  ],
  propertiesController.createProperty
);

// Update Property
router.put(
  '/:id',
  protect, // <--- SECURITY GUARD
  authorize('USER', 'ADMIN', 'LANDLORD'),
  upload.array('images', 5),
  propertiesController.updateProperty
);

// Delete Property
router.delete(
  '/:id',
  protect, // <--- SECURITY GUARD
  authorize('USER', 'ADMIN', 'LANDLORD'),
  propertiesController.deleteProperty
);

// Interactions
router.post('/:id/view', propertyViewsController.logView);
router.post('/:id/favorite', protect, propertyViewsController.toggleFavorite);

router.post(
  '/:id/rating',
  protect,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim().isLength({ max: 1000 }),
  ],
  propertyViewsController.createOrUpdateRating
);

router.delete('/:id/rating', protect, propertyViewsController.deleteRating);

// --- ADMIN / ANALYTICS ---
router.get(
  '/:id/view-stats',
  protect,
  authorize('USER', 'ADMIN', 'LANDLORD'),
  propertyViewsController.getViewStats
);

router.get(
  '/pending-approval',
  protect,
  authorize('ADMIN'),
  propertiesController.getPendingApprovals
);

// Admin Actions
router.post(
  '/:id/approve',
  protect,
  authorize('ADMIN'),
  propertiesController.approveProperty
);

router.post(
  '/:id/reject',
  protect,
  authorize('ADMIN'),
  propertiesController.rejectProperty
);

router.get(
  '/:id/approval-history',
  protect,
  propertiesController.getApprovalHistory
);

// Auto-Approve Settings
router.post(
  '/auto-approve/toggle',
  protect,
  authorize('ADMIN'),
  propertiesController.togglePropertyAutoApprove
);

router.get(
  '/auto-approve/status',
  protect,
  propertiesController.getPropertyAutoApproveStatus
);

router.post(
  '/fix-approval-inconsistency',
  protect,
  authorize('ADMIN'),
  propertiesController.fixApprovalDataInconsistency
);

module.exports = router;