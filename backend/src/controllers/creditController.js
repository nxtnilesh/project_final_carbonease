const mongoose = require('mongoose');
const CarbonCredit = require('../models/CarbonCredit');
const { sendSuccess, sendError, paginate, sendPaginatedResponse, buildFilter, buildSort, buildTextSearch } = require('../utils/response');
const { AppError } = require('../middlewares/errorHandler');

// @desc    Get all carbon credits (marketplace)
// @route   GET /api/credits
// @access  Public
const getCredits = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    
    // Build filter
    const allowedFields = ['energyType', 'status', 'isVerified', 'pricePerCredit_gte', 'pricePerCredit_lte', 'availableCredits_gte', 'projectLocation.country', 'certification.standard'];
    const filter = buildFilter(req.query, allowedFields);
    
    // Add default filters for marketplace
    filter.status = 'active';
    filter.isVerified = true;
    filter.availableCredits_gt = 0;
    
    // Text search
    const searchTerm = req.query.search;
    if (searchTerm) {
      const searchFields = ['title', 'description', 'projectDetails.projectName', 'tags'];
      const searchFilter = buildTextSearch(searchTerm, searchFields);
      Object.assign(filter, searchFilter);
    }
    
    // Build sort
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const sort = buildSort(sortBy, sortOrder);
    
    // Execute query
    const credits = await CarbonCredit.find(filter)
      .populate('seller', 'firstName lastName company profileImage')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await CarbonCredit.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    sendPaginatedResponse(res, credits, {
      page,
      limit,
      total,
      totalPages
    }, 'Carbon credits retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single carbon credit
// @route   GET /api/credits/:id
// @access  Public
const getCredit = async (req, res, next) => {
  try {
    const credit = await CarbonCredit.findById(req.params.id)
      .populate('seller', 'firstName lastName company profileImage email phone')
      .lean();
    
    if (!credit) {
      return sendError(res, 'Carbon credit not found', 404);
    }
    
    // Increment view count
    await CarbonCredit.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    
    sendSuccess(res, credit, 'Carbon credit retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create carbon credit
// @route   POST /api/credits
// @access  Private (Seller only)
const createCredit = async (req, res, next) => {
  try {
    const creditData = {
      ...req.body,
      seller: req.user.id
    };
    
    const credit = await CarbonCredit.create(creditData);
    
    const populatedCredit = await CarbonCredit.findById(credit._id)
      .populate('seller', 'firstName lastName company profileImage');
    
    sendSuccess(res, populatedCredit, 'Carbon credit created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update carbon credit
// @route   PUT /api/credits/:id
// @access  Private (Owner only)
const updateCredit = async (req, res, next) => {
  try {
    const credit = await CarbonCredit.findById(req.params.id);
    
    if (!credit) {
      return sendError(res, 'Carbon credit not found', 404);
    }
    
    // Check ownership
    if (credit.seller.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to update this credit', 403);
    }
    
    // Prevent updating if there are pending transactions
    if (credit.status === 'active' && credit.purchaseCount > 0) {
      return sendError(res, 'Cannot update credit with existing transactions', 400);
    }
    
    const updatedCredit = await CarbonCredit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'firstName lastName company profileImage');
    
    sendSuccess(res, updatedCredit, 'Carbon credit updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete carbon credit
// @route   DELETE /api/credits/:id
// @access  Private (Owner only)
const deleteCredit = async (req, res, next) => {
  try {
    const credit = await CarbonCredit.findById(req.params.id);
    
    if (!credit) {
      return sendError(res, 'Carbon credit not found', 404);
    }
    
    // Check ownership
    if (credit.seller.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to delete this credit', 403);
    }
    
    // Prevent deletion if there are transactions
    if (credit.purchaseCount > 0) {
      return sendError(res, 'Cannot delete credit with existing transactions', 400);
    }
    
    await CarbonCredit.findByIdAndDelete(req.params.id);
    
    sendSuccess(res, null, 'Carbon credit deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's carbon credits
// @route   GET /api/credits/seller/my-credits
// @access  Private (Seller only)
const getMyCredits = async (req, res, next) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    
    const filter = { seller: req.user.id };
    
    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const credits = await CarbonCredit.find(filter)
      .populate('seller', 'firstName lastName company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const total = await CarbonCredit.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    sendPaginatedResponse(res, credits, {
      page,
      limit,
      total,
      totalPages
    }, 'Your carbon credits retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller's credit statistics
// @route   GET /api/credits/seller/stats
// @access  Private (Seller only)
const getSellerStats = async (req, res, next) => {
  try {
    const stats = await CarbonCredit.aggregate([
      { $match: { seller: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: '$totalCredits' },
          totalAvailable: { $sum: '$availableCredits' },
          totalSold: { $sum: { $subtract: ['$totalCredits', '$availableCredits'] } },
          totalValue: { $sum: { $multiply: ['$totalCredits', '$pricePerCredit'] } },
          availableValue: { $sum: { $multiply: ['$availableCredits', '$pricePerCredit'] } },
          soldValue: { $sum: { $multiply: [{ $subtract: ['$totalCredits', '$availableCredits'] }, '$pricePerCredit'] } },
          totalListings: { $sum: 1 },
          activeListings: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalViews: { $sum: '$viewCount' },
          totalPurchases: { $sum: '$purchaseCount' },
          averageRating: { $avg: '$averageRating' }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalCredits: 0,
      totalAvailable: 0,
      totalSold: 0,
      totalValue: 0,
      availableValue: 0,
      soldValue: 0,
      totalListings: 0,
      activeListings: 0,
      totalViews: 0,
      totalPurchases: 0,
      averageRating: 0
    };
    
    sendSuccess(res, result, 'Seller statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Verify carbon credit (Admin only)
// @route   PUT /api/credits/:id/verify
// @access  Private (Admin only)
const verifyCredit = async (req, res, next) => {
  try {
    const credit = await CarbonCredit.findById(req.params.id);
    
    if (!credit) {
      return sendError(res, 'Carbon credit not found', 404);
    }
    
    credit.isVerified = true;
    credit.verificationDate = new Date();
    await credit.save();
    
    sendSuccess(res, credit, 'Carbon credit verified successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get energy types
// @route   GET /api/credits/energy-types
// @access  Public
const getEnergyTypes = async (req, res, next) => {
  try {
    const energyTypes = await CarbonCredit.distinct('energyType');
    
    sendSuccess(res, energyTypes, 'Energy types retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get certification standards
// @route   GET /api/credits/certification-standards
// @access  Public
const getCertificationStandards = async (req, res, next) => {
  try {
    const standards = await CarbonCredit.distinct('certification.standard');
    
    sendSuccess(res, standards, 'Certification standards retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get countries
// @route   GET /api/credits/countries
// @access  Public
const getCountries = async (req, res, next) => {
  try {
    const countries = await CarbonCredit.distinct('projectLocation.country');
    
    sendSuccess(res, countries, 'Countries retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
