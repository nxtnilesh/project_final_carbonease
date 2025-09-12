const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  carbonCredit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CarbonCredit',
    required: [true, 'Carbon credit is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  pricePerCredit: {
    type: Number,
    required: [true, 'Price per credit is required'],
    min: [0.01, 'Price per credit must be at least $0.01']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0.01, 'Total amount must be at least $0.01']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'bank_transfer', 'crypto', 'other'],
      default: 'stripe'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    stripePaymentIntentId: String,
    stripeSessionId: String,
    transactionId: String,
    gatewayResponse: mongoose.Schema.Types.Mixed,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  delivery: {
    method: {
      type: String,
      enum: ['digital', 'certificate', 'registry_transfer'],
      default: 'digital'
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'failed'],
      default: 'pending'
    },
    deliveredAt: Date,
    deliveryNotes: String,
    trackingNumber: String
  },
  certificates: [{
    certificateNumber: String,
    issueDate: Date,
    expiryDate: Date,
    downloadUrl: String,
    isDownloaded: {
      type: Boolean,
      default: false
    },
    downloadedAt: Date
  }],
  metadata: {
    buyerNotes: String,
    sellerNotes: String,
    internalNotes: String,
    tags: [String],
    source: {
      type: String,
      enum: ['marketplace', 'direct', 'api', 'admin'],
      default: 'marketplace'
    }
  },
  fees: {
    platformFee: {
      type: Number,
      default: 0
    },
    processingFee: {
      type: Number,
      default: 0
    },
    totalFees: {
      type: Number,
      default: 0
    }
  },
  dispute: {
    isDisputed: {
      type: Boolean,
      default: false
    },
    disputeReason: String,
    disputeDate: Date,
    resolution: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  reviews: {
    buyerReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: Date
    },
    sellerReview: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      createdAt: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ buyer: 1 });
transactionSchema.index({ seller: 1 });
transactionSchema.index({ carbonCredit: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ 'payment.status': 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ 'payment.stripePaymentIntentId': 1 });
transactionSchema.index({ 'payment.stripeSessionId': 1 });

// Compound indexes
transactionSchema.index({ buyer: 1, status: 1 });
transactionSchema.index({ seller: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

// Virtual for transaction reference
transactionSchema.virtual('transactionRef').get(function() {
  return `TXN-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for net amount (after fees)
transactionSchema.virtual('netAmount').get(function() {
  return this.totalAmount - this.fees.totalFees;
});

// Pre-save middleware to calculate total amount
transactionSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('pricePerCredit')) {
    this.totalAmount = this.quantity * this.pricePerCredit;
  }
  next();
});

// Pre-save middleware to calculate fees (example: 2.5% platform fee)
transactionSchema.pre('save', function(next) {
  if (this.isModified('totalAmount')) {
    this.fees.platformFee = Math.round(this.totalAmount * 0.025 * 100) / 100; // 2.5%
    this.fees.processingFee = Math.round(this.totalAmount * 0.029 * 100) / 100; // 2.9% (Stripe)
    this.fees.totalFees = this.fees.platformFee + this.fees.processingFee;
  }
  next();
});

// Method to mark payment as completed
transactionSchema.methods.markPaymentCompleted = function(paymentData = {}) {
  this.payment.status = 'completed';
  this.payment.paidAt = new Date();
  this.status = 'processing';
  
  if (paymentData.stripePaymentIntentId) {
    this.payment.stripePaymentIntentId = paymentData.stripePaymentIntentId;
  }
  if (paymentData.stripeSessionId) {
    this.payment.stripeSessionId = paymentData.stripeSessionId;
  }
  if (paymentData.gatewayResponse) {
    this.payment.gatewayResponse = paymentData.gatewayResponse;
  }
};

// Method to mark transaction as completed
transactionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.delivery.status = 'delivered';
  this.delivery.deliveredAt = new Date();
};

// Method to process refund
transactionSchema.methods.processRefund = function(refundAmount, reason) {
  this.payment.status = 'refunded';
  this.payment.refundedAt = new Date();
  this.payment.refundAmount = refundAmount;
  this.payment.refundReason = reason;
  this.status = 'refunded';
};

// Method to add certificate
transactionSchema.methods.addCertificate = function(certificateData) {
  this.certificates.push({
    certificateNumber: certificateData.certificateNumber,
    issueDate: certificateData.issueDate || new Date(),
    expiryDate: certificateData.expiryDate,
    downloadUrl: certificateData.downloadUrl
  });
};

// Static method to get transaction statistics
transactionSchema.statics.getStats = async function(userId, role) {
  const matchStage = role === 'buyer' 
    ? { buyer: new mongoose.Types.ObjectId(userId) }
    : { seller: new mongoose.Types.ObjectId(userId) };

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalVolume: { $sum: '$totalAmount' },
        totalCredits: { $sum: '$quantity' },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pendingTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        averageTransactionValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  return stats[0] || {
    totalTransactions: 0,
    totalVolume: 0,
    totalCredits: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    averageTransactionValue: 0
  };
};

module.exports = mongoose.model('Transaction', transactionSchema);
