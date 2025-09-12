const Transaction = require('../models/Transaction');
const CarbonCredit = require('../models/CarbonCredit');
const User = require('../models/User');
const { sendSuccess, sendError, paginate, sendPaginatedResponse, buildFilter, buildSort } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private (Buyer only)
const createTransaction = async (req, res, next) => {
  try {
    const { carbonCreditId, quantity } = req.body;

    // Get carbon credit
    const carbonCredit = await CarbonCredit.findById(carbonCreditId);
    if (!carbonCredit) {
      return sendError(res, 'Carbon credit not found', 404);
    }

    // Check if credit is available for purchase
    if (!carbonCredit.isAvailableForPurchase(quantity)) {
      return sendError(res, 'Insufficient credits available or credit not available for purchase', 400);
    }

    // Check if buyer is not the seller
    if (carbonCredit.seller.toString() === req.user.id) {
      return sendError(res, 'Cannot purchase your own carbon credits', 400);
    }

    // Calculate total amount
    const totalAmount = quantity * carbonCredit.pricePerCredit;

    // Create transaction
    const transaction = await Transaction.create({
      buyer: req.user.id,
      seller: carbonCredit.seller,
      carbonCredit: carbonCreditId,
      quantity,
      pricePerCredit: carbonCredit.pricePerCredit,
      totalAmount,
      currency: carbonCredit.currency,
      status: 'pending'
    });

    // Populate transaction data
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('buyer', 'firstName lastName email')
      .populate('seller', 'firstName lastName email company')
      .populate('carbonCredit', 'title energyType projectLocation certification');

    sendSuccess(res, populatedTransaction, 'Transaction created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's transactions
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    
    // Build filter based on user role
    let filter = {};
    if (req.user.role === 'buyer') {
      filter.buyer = req.user.id;
    } else if (req.user.role === 'seller') {
      filter.seller = req.user.id;
    }
    
    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Add payment status filter if provided
    if (req.query.paymentStatus) {
      filter['payment.status'] = req.query.paymentStatus;
    }
    
    const transactions = await Transaction.find(filter)
      .populate('buyer', 'firstName lastName email')
      .populate('seller', 'firstName lastName email company')
      .populate('carbonCredit', 'title energyType projectLocation certification images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    sendPaginatedResponse(res, transactions, {
      page,
      limit,
      total,
      totalPages
    }, 'Transactions retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('buyer', 'firstName lastName email phone address')
      .populate('seller', 'firstName lastName email phone company address')
      .populate('carbonCredit', 'title description energyType projectLocation certification projectDetails images documents');
    
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }
    
    // Check if user is authorized to view this transaction
    const isAuthorized = transaction.buyer._id.toString() === req.user.id || 
                        transaction.seller._id.toString() === req.user.id;
    
    if (!isAuthorized) {
      return sendError(res, 'Not authorized to view this transaction', 403);
    }
    
    sendSuccess(res, transaction, 'Transaction retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction status
// @route   PUT /api/transactions/:id/status
// @access  Private
const updateTransactionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }
    
    // Check authorization
    const isAuthorized = transaction.buyer.toString() === req.user.id || 
                        transaction.seller.toString() === req.user.id;
    
    if (!isAuthorized) {
      return sendError(res, 'Not authorized to update this transaction', 403);
    }
    
    // Validate status transition
    const validTransitions = {
      'pending': ['processing', 'cancelled'],
      'processing': ['completed', 'cancelled'],
      'completed': ['refunded'],
      'cancelled': [],
      'refunded': []
    };
    
    if (!validTransitions[transaction.status]?.includes(status)) {
      return sendError(res, `Invalid status transition from ${transaction.status} to ${status}`, 400);
    }
    
    // Update transaction
    transaction.status = status;
    
    if (status === 'completed') {
      transaction.markCompleted();
      
      // Update carbon credit available credits
      const carbonCredit = await CarbonCredit.findById(transaction.carbonCredit);
      if (carbonCredit) {
        carbonCredit.updateAvailableCredits(transaction.quantity);
        await carbonCredit.save();
      }
    }
    
    await transaction.save();
    
    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate('buyer', 'firstName lastName email')
      .populate('seller', 'firstName lastName email company')
      .populate('carbonCredit', 'title energyType');
    
    sendSuccess(res, updatedTransaction, 'Transaction status updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to transaction
// @route   POST /api/transactions/:id/review
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }
    
    // Check if transaction is completed
    if (transaction.status !== 'completed') {
      return sendError(res, 'Can only review completed transactions', 400);
    }
    
    // Check authorization
    const isAuthorized = transaction.buyer.toString() === req.user.id || 
                        transaction.seller.toString() === req.user.id;
    
    if (!isAuthorized) {
      return sendError(res, 'Not authorized to review this transaction', 403);
    }
    
    // Add review based on user role
    if (req.user.role === 'buyer') {
      transaction.reviews.buyerReview = {
        rating,
        comment,
        createdAt: new Date()
      };
    } else if (req.user.role === 'seller') {
      transaction.reviews.sellerReview = {
        rating,
        comment,
        createdAt: new Date()
      };
    }
    
    await transaction.save();
    
    // Update carbon credit average rating
    const carbonCredit = await CarbonCredit.findById(transaction.carbonCredit);
    if (carbonCredit) {
      const allTransactions = await Transaction.find({
        carbonCredit: transaction.carbonCredit,
        status: 'completed',
        'reviews.buyerReview.rating': { $exists: true }
      });
      
      const totalRating = allTransactions.reduce((sum, t) => sum + t.reviews.buyerReview.rating, 0);
      carbonCredit.averageRating = totalRating / allTransactions.length;
      carbonCredit.totalReviews = allTransactions.length;
      await carbonCredit.save();
    }
    
    sendSuccess(res, transaction, 'Review added successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res, next) => {
  try {
    const stats = await Transaction.getStats(req.user.id, req.user.role);
    
    sendSuccess(res, stats, 'Transaction statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel transaction
// @route   PUT /api/transactions/:id/cancel
// @access  Private
const cancelTransaction = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }
    
    // Check authorization
    const isAuthorized = transaction.buyer.toString() === req.user.id || 
                        transaction.seller.toString() === req.user.id;
    
    if (!isAuthorized) {
      return sendError(res, 'Not authorized to cancel this transaction', 403);
    }
    
    // Check if transaction can be cancelled
    if (!['pending', 'processing'].includes(transaction.status)) {
      return sendError(res, 'Transaction cannot be cancelled in current status', 400);
    }
    
    transaction.status = 'cancelled';
    transaction.metadata.internalNotes = reason;
    await transaction.save();
    
    sendSuccess(res, transaction, 'Transaction cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Download certificate
// @route   GET /api/transactions/:id/certificate/:certId
// @access  Private
const downloadCertificate = async (req, res, next) => {
  try {
    const { id, certId } = req.params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }
    
    // Check authorization
    const isAuthorized = transaction.buyer.toString() === req.user.id || 
                        transaction.seller.toString() === req.user.id;
    
    if (!isAuthorized) {
      return sendError(res, 'Not authorized to download this certificate', 403);
    }
    
    const certificate = transaction.certificates.id(certId);
    if (!certificate) {
      return sendError(res, 'Certificate not found', 404);
    }
    
    // Mark as downloaded
    certificate.isDownloaded = true;
    certificate.downloadedAt = new Date();
    await transaction.save();
    
    sendSuccess(res, {
      downloadUrl: certificate.downloadUrl,
      certificateNumber: certificate.certificateNumber
    }, 'Certificate download link generated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransactionStatus,
  addReview,
  getTransactionStats,
  cancelTransaction,
  downloadCertificate
};
