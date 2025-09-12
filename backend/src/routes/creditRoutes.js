const express = require('express');
const { body, param } = require('express-validator');
const {
  getCredits,
  getCredit,
  createCredit,
  updateCredit,
  deleteCredit,
  getMyCredits,
  getSellerStats,
  verifyCredit,
  getEnergyTypes,
  getCertificationStandards,
  getCountries
} = require('../controllers/creditController');
const { protect, authorize, checkOwnership } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorHandler');
const CarbonCredit = require('../models/CarbonCredit');

const router = express.Router();

// Validation middleware
const createCreditValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('energyType')
    .isIn(['wind', 'solar', 'hydro', 'geothermal', 'biomass', 'nuclear', 'other'])
    .withMessage('Invalid energy type'),
  body('projectLocation.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('totalCredits')
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Total credits must be between 1 and 1,000,000'),
  body('availableCredits')
    .isInt({ min: 0 })
    .withMessage('Available credits cannot be negative'),
  body('pricePerCredit')
    .isFloat({ min: 0.01, max: 1000 })
    .withMessage('Price per credit must be between $0.01 and $1000'),
  body('certification.standard')
    .isIn(['VCS', 'Gold Standard', 'CAR', 'ACR', 'CDM', 'Other'])
    .withMessage('Invalid certification standard'),
  body('certification.certifier')
    .trim()
    .notEmpty()
    .withMessage('Certifier is required'),
  body('certification.certificateNumber')
    .trim()
    .notEmpty()
    .withMessage('Certificate number is required'),
  body('certification.issueDate')
    .isISO8601()
    .withMessage('Invalid issue date'),
  body('certification.expiryDate')
    .isISO8601()
    .withMessage('Invalid expiry date'),
  body('projectDetails.projectName')
    .trim()
    .notEmpty()
    .withMessage('Project name is required'),
  body('projectDetails.projectType')
    .isIn(['renewable-energy', 'energy-efficiency', 'forest-conservation', 'reforestation', 'other'])
    .withMessage('Invalid project type'),
  body('projectDetails.startDate')
    .isISO8601()
    .withMessage('Invalid project start date'),
  body('projectDetails.endDate')
    .isISO8601()
    .withMessage('Invalid project end date'),
  body('projectDetails.estimatedCO2Reduction')
    .isFloat({ min: 0 })
    .withMessage('Estimated CO2 reduction cannot be negative')
];

const updateCreditValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('energyType')
    .optional()
    .isIn(['wind', 'solar', 'hydro', 'geothermal', 'biomass', 'nuclear', 'other'])
    .withMessage('Invalid energy type'),
  body('totalCredits')
    .optional()
    .isInt({ min: 1, max: 1000000 })
    .withMessage('Total credits must be between 1 and 1,000,000'),
  body('availableCredits')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Available credits cannot be negative'),
  body('pricePerCredit')
    .optional()
    .isFloat({ min: 0.01, max: 1000 })
    .withMessage('Price per credit must be between $0.01 and $1000'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'sold-out', 'suspended', 'expired'])
    .withMessage('Invalid status')
];

const creditIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid credit ID')
];

// Public routes
router.get('/', asyncHandler(getCredits));
router.get('/energy-types', asyncHandler(getEnergyTypes));
router.get('/certification-standards', asyncHandler(getCertificationStandards));
router.get('/countries', asyncHandler(getCountries));
router.get('/:id', creditIdValidation, asyncHandler(getCredit));

// Protected routes
router.use(protect);

// Seller routes
router.post('/', authorize('seller'), createCreditValidation, asyncHandler(createCredit));
router.get('/seller/my-credits', authorize('seller'), asyncHandler(getMyCredits));
router.get('/seller/stats', authorize('seller'), asyncHandler(getSellerStats));

// Owner routes (seller who owns the credit)
router.put('/:id', creditIdValidation, checkOwnership(CarbonCredit), updateCreditValidation, asyncHandler(updateCredit));
router.delete('/:id', creditIdValidation, checkOwnership(CarbonCredit), asyncHandler(deleteCredit));

// Admin routes
router.put('/:id/verify', creditIdValidation, authorize('admin'), asyncHandler(verifyCredit));

module.exports = router;
