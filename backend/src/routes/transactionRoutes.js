const express = require('express');
const { body, param } = require('express-validator');
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransactionStatus,
  addReview,
  getTransactionStats,
  cancelTransaction,
  downloadCertificate
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Validation middleware
const createTransactionValidation = [
  body('carbonCreditId')
    .isMongoId()
    .withMessage('Invalid carbon credit ID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'processing', 'completed', 'cancelled', 'refunded'])
    .withMessage('Invalid status')
];

const addReviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

const cancelTransactionValidation = [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters')
];

const transactionIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid transaction ID')
];

const certIdValidation = [
  param('certId')
    .isMongoId()
    .withMessage('Invalid certificate ID')
];

// All routes are protected
router.use(protect);

// Transaction routes
router.post('/', authorize('buyer'), createTransactionValidation, asyncHandler(createTransaction));
router.get('/', asyncHandler(getTransactions));
router.get('/stats', asyncHandler(getTransactionStats));
router.get('/:id', transactionIdValidation, asyncHandler(getTransaction));
router.put('/:id/status', transactionIdValidation, updateStatusValidation, asyncHandler(updateTransactionStatus));
router.put('/:id/cancel', transactionIdValidation, cancelTransactionValidation, asyncHandler(cancelTransaction));
router.post('/:id/review', transactionIdValidation, addReviewValidation, asyncHandler(addReview));
router.get('/:id/certificate/:certId', transactionIdValidation, certIdValidation, asyncHandler(downloadCertificate));

module.exports = router;
