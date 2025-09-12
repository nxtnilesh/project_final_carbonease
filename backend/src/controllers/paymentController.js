const stripe = require('../config/stripe');
const Transaction = require('../models/Transaction');
const CarbonCredit = require('../models/CarbonCredit');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
const createCheckoutSession = async (req, res, next) => {
  try {
    const { transactionId } = req.body;

    const transaction = await Transaction.findById(transactionId)
      .populate('buyer', 'firstName lastName email stripeCustomerId')
      .populate('seller', 'firstName lastName email')
      .populate('carbonCredit', 'title energyType projectLocation');

    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    // Check if user is authorized
    if (transaction.buyer._id.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to pay for this transaction', 403);
    }

    // Check if transaction is in pending status
    if (transaction.status !== 'pending') {
      return sendError(res, 'Transaction is not in pending status', 400);
    }

    // Create or get Stripe customer
    let customerId = transaction.buyer.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: transaction.buyer.email,
        name: `${transaction.buyer.firstName} ${transaction.buyer.lastName}`,
        metadata: {
          userId: transaction.buyer._id.toString()
        }
      });
      customerId = customer.id;

      // Update user with customer ID
      await User.findByIdAndUpdate(transaction.buyer._id, {
        stripeCustomerId: customerId
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: transaction.currency.toLowerCase(),
            product_data: {
              name: `${transaction.carbonCredit.title} - Carbon Credits`,
              description: `Purchase of ${transaction.quantity} carbon credits from ${transaction.carbonCredit.energyType} project`,
              images: transaction.carbonCredit.images?.map(img => img.url) || [],
              metadata: {
                transactionId: transaction._id.toString(),
                carbonCreditId: transaction.carbonCredit._id.toString()
              }
            },
            unit_amount: Math.round(transaction.pricePerCredit * 100), // Convert to cents
          },
          quantity: transaction.quantity,
        },
        {
          price_data: {
            currency: transaction.currency.toLowerCase(),
            product_data: {
              name: 'Platform Fee',
              description: 'Carbonease platform fee'
            },
            unit_amount: Math.round(transaction.fees.platformFee * 100),
          },
          quantity: 1,
        }
      ],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel?transaction_id=${transaction._id}`,
      metadata: {
        transactionId: transaction._id.toString(),
        userId: req.user.id
      },
      payment_intent_data: {
        metadata: {
          transactionId: transaction._id.toString(),
          userId: req.user.id
        }
      }
    });

    // Update transaction with session ID
    transaction.payment.stripeSessionId = session.id;
    await transaction.save();

    sendSuccess(res, {
      sessionId: session.id,
      url: session.url
    }, 'Checkout session created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      case 'charge.dispute.created':
        await handleChargeDisputeCreated(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status
// @route   GET /api/payments/status/:transactionId
// @access  Private
const getPaymentStatus = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('buyer', 'firstName lastName email')
      .populate('seller', 'firstName lastName email')
      .populate('carbonCredit', 'title energyType');

    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    // Check authorization
    const isAuthorized = transaction.buyer._id.toString() === req.user.id || 
                        transaction.seller._id.toString() === req.user.id;

    if (!isAuthorized) {
      return sendError(res, 'Not authorized to view payment status', 403);
    }

    let paymentIntent = null;
    if (transaction.payment.stripePaymentIntentId) {
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(
          transaction.payment.stripePaymentIntentId
        );
      } catch (error) {
        console.log('Error retrieving payment intent:', error.message);
      }
    }

    sendSuccess(res, {
      transaction: {
        id: transaction._id,
        status: transaction.status,
        paymentStatus: transaction.payment.status,
        totalAmount: transaction.totalAmount,
        currency: transaction.currency,
        fees: transaction.fees
      },
      paymentIntent: paymentIntent ? {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created
      } : null
    }, 'Payment status retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private
const processRefund = async (req, res, next) => {
  try {
    const { transactionId, amount, reason } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    // Check authorization (seller or admin)
    if (transaction.seller.toString() !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to process refund', 403);
    }

    // Check if payment was successful
    if (transaction.payment.status !== 'completed') {
      return sendError(res, 'Cannot refund transaction that was not completed', 400);
    }

    const refundAmount = amount || transaction.totalAmount;

    // Process refund with Stripe
    const refund = await stripe.refunds.create({
      payment_intent: transaction.payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100), // Convert to cents
      reason: 'requested_by_customer',
      metadata: {
        transactionId: transaction._id.toString(),
        reason: reason || 'Refund requested'
      }
    });

    // Update transaction
    transaction.processRefund(refundAmount, reason);
    await transaction.save();

    // Update carbon credit available credits
    const carbonCredit = await CarbonCredit.findById(transaction.carbonCredit);
    if (carbonCredit) {
      carbonCredit.availableCredits += transaction.quantity;
      await carbonCredit.save();
    }

    sendSuccess(res, {
      refundId: refund.id,
      amount: refundAmount,
      status: refund.status
    }, 'Refund processed successfully');
  } catch (error) {
    next(error);
  }
};

// Helper functions for webhook handling
const handleCheckoutSessionCompleted = async (session) => {
  try {
    const transactionId = session.metadata.transactionId;
    const transaction = await Transaction.findById(transactionId);

    if (transaction) {
      transaction.payment.stripePaymentIntentId = session.payment_intent;
      transaction.payment.status = 'processing';
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
};

const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    const transactionId = paymentIntent.metadata.transactionId;
    const transaction = await Transaction.findById(transactionId);

    if (transaction) {
      transaction.markPaymentCompleted({
        stripePaymentIntentId: paymentIntent.id,
        gatewayResponse: paymentIntent
      });
      await transaction.save();

      // Update carbon credit available credits
      const carbonCredit = await CarbonCredit.findById(transaction.carbonCredit);
      if (carbonCredit) {
        carbonCredit.updateAvailableCredits(transaction.quantity);
        await carbonCredit.save();
      }

      // TODO: Send confirmation emails
      // TODO: Generate certificates
    }
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    const transactionId = paymentIntent.metadata.transactionId;
    const transaction = await Transaction.findById(transactionId);

    if (transaction) {
      transaction.payment.status = 'failed';
      transaction.status = 'cancelled';
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
};

const handleChargeDisputeCreated = async (dispute) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(dispute.payment_intent);
    const transactionId = paymentIntent.metadata.transactionId;
    const transaction = await Transaction.findById(transactionId);

    if (transaction) {
      transaction.dispute.isDisputed = true;
      transaction.dispute.disputeReason = dispute.reason;
      transaction.dispute.disputeDate = new Date();
      await transaction.save();
    }
  } catch (error) {
    console.error('Error handling charge dispute:', error);
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getPaymentStatus,
  processRefund
};
