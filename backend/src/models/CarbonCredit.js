const mongoose = require('mongoose');

const carbonCreditSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: [true, 'Seller is required']
  },
  title: {
    type: String,
    // required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    // required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  energyType: {
    type: String,
    // required: [true, 'Energy type is required'],
    enum: {
      values: ['wind', 'solar', 'hydro', 'geothermal', 'biomass', 'nuclear', 'other'],
      message: 'Energy type must be one of: wind, solar, hydro, geothermal, biomass, nuclear, other'
    }
  },
  projectLocation: {
    country: {
      type: String,
      // required: [true, 'Country is required'],
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  totalCredits: {
    type: Number,
    // required: [true, 'Total credits is required'],
    min: [1, 'Total credits must be at least 1'],
    max: [1000000, 'Total credits cannot exceed 1,000,000']
  },
  availableCredits: {
    type: Number,
    // required: [true, 'Available credits is required'],
    min: [0, 'Available credits cannot be negative']
  },
  pricePerCredit: {
    type: Number,
    // required: [true, 'Price per credit is required'],
    min: [0.01, 'Price per credit must be at least $0.01'],
    max: [1000, 'Price per credit cannot exceed $1000']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  certification: {
    standard: {
      type: String,
      // required: [true, 'Certification standard is required'],
      enum: ['VCS', 'Gold Standard', 'CAR', 'ACR', 'CDM', 'Other']
    },
    certifier: {
      type: String,
      // required: [true, 'Certifier is required'],
      trim: true
    },
    certificateNumber: {
      type: String,
      // required: [true, 'Certificate number is required'],
      trim: true
    },
    issueDate: {
      type: Date,
      // required: [true, 'Issue date is required']
    },
    expiryDate: {
      type: Date,
      // required: [true, 'Expiry date is required']
    }
  },
  projectDetails: {
    projectName: {
      type: String,
      // required: [true, 'Project name is required'],
      trim: true
    },
    projectType: {
      type: String,
      // required: [true, 'Project type is required'],
      enum: ['renewable-energy', 'energy-efficiency', 'forest-conservation', 'reforestation', 'other']
    },
    startDate: {
      type: Date,
      // required: [true, 'Project start date is required']
    },
    endDate: {
      type: Date,
      // required: [true, 'Project end date is required']
    },
    estimatedCO2Reduction: {
      type: Number,
      // required: [true, 'Estimated CO2 reduction is required'],
      min: [0, 'CO2 reduction cannot be negative']
    },
    unit: {
      type: String,
      default: 'tonnes',
      enum: ['tonnes', 'kg', 'pounds']
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  documents: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['certificate', 'report', 'verification', 'other']
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'sold-out', 'suspended', 'expired'],
    default: 'draft'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
carbonCreditSchema.index({ seller: 1 });
carbonCreditSchema.index({ energyType: 1 });
carbonCreditSchema.index({ status: 1 });
carbonCreditSchema.index({ 'projectLocation.country': 1 });
carbonCreditSchema.index({ pricePerCredit: 1 });
carbonCreditSchema.index({ createdAt: -1 });
carbonCreditSchema.index({ isVerified: 1 });

// Text search index
carbonCreditSchema.index({
  title: 'text',
  description: 'text',
  'projectDetails.projectName': 'text',
  tags: 'text'
});

// Virtual for total value
carbonCreditSchema.virtual('totalValue').get(function() {
  return this.totalCredits * this.pricePerCredit;
});

// Virtual for available value
carbonCreditSchema.virtual('availableValue').get(function() {
  return this.availableCredits * this.pricePerCredit;
});

// Ensure available credits don't exceed total credits
carbonCreditSchema.pre('save', function(next) {
  if (this.availableCredits > this.totalCredits) {
    this.availableCredits = this.totalCredits;
  }
  next();
});

// Update status based on available credits
carbonCreditSchema.pre('save', function(next) {
  if (this.availableCredits === 0 && this.status === 'active') {
    this.status = 'sold-out';
  } else if (this.availableCredits > 0 && this.status === 'sold-out') {
    this.status = 'active';
  }
  next();
});

// Method to check if credit is available for purchase
carbonCreditSchema.methods.isAvailableForPurchase = function(quantity) {
  return this.status === 'active' && 
         this.isVerified && 
         this.availableCredits >= quantity &&
         new Date() <= this.certification.expiryDate;
};

// Method to update available credits after purchase
carbonCreditSchema.methods.updateAvailableCredits = function(quantity) {
  if (this.availableCredits >= quantity) {
    this.availableCredits -= quantity;
    this.purchaseCount += 1;
    return true;
  }
  return false;
};

module.exports = mongoose.model('CarbonCredit', carbonCreditSchema);
