const express = require('express');
const { body, param } = require('express-validator');
const {
  createCheckoutSession,
  handleWebhook,
  getPaymentStatus,
  processRefund
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorHandler');

const router = express.Router();

// Validation middleware
const createCheckoutSessionValidation = [
  body('transactionId')
    .isMongoId()
    .withMessage('Invalid transaction ID')
];

const processRefundValidation = [
  body('transactionId')
    .isMongoId()
    .withMessage('Invalid transaction ID'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Refund amount must be at least $0.01'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reason cannot exceed 200 characters')
];

const transactionIdValidation = [
  param('transactionId')
    .isMongoId()
    .withMessage('Invalid transaction ID')
];

// Public routes (webhook doesn't need authentication)
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(handleWebhook));

// Protected routes
router.use(protect);

// Payment routes
router.post('/create-checkout-session', createCheckoutSessionValidation, asyncHandler(createCheckoutSession));
router.get('/status/:transactionId', transactionIdValidation, asyncHandler(getPaymentStatus));
router.post('/refund', processRefundValidation, asyncHandler(processRefund));

module.exports = router;
