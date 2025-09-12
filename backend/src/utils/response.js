// Success response helper
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };

  return res.status(statusCode).json(response);
};

// Error response helper
const sendError = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };

  return res.status(statusCode).json(response);
};

// Pagination helper
const paginate = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

// Pagination response helper
const sendPaginatedResponse = (res, data, pagination, message = 'Success') => {
  const { page, limit, total, totalPages } = pagination;
  
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};

// Filter helper for query parameters
const buildFilter = (query, allowedFields = []) => {
  const filter = {};
  
  Object.keys(query).forEach(key => {
    if (allowedFields.includes(key) && query[key] !== '') {
      // Handle special operators
      if (key.includes('_gte')) {
        const field = key.replace('_gte', '');
        filter[field] = { ...filter[field], $gte: query[key] };
      } else if (key.includes('_lte')) {
        const field = key.replace('_lte', '');
        filter[field] = { ...filter[field], $lte: query[key] };
      } else if (key.includes('_gt')) {
        const field = key.replace('_gt', '');
        filter[field] = { ...filter[field], $gt: query[key] };
      } else if (key.includes('_lt')) {
        const field = key.replace('_lt', '');
        filter[field] = { ...filter[field], $lt: query[key] };
      } else if (key.includes('_in')) {
        const field = key.replace('_in', '');
        filter[field] = { $in: query[key].split(',') };
      } else if (key.includes('_nin')) {
        const field = key.replace('_nin', '');
        filter[field] = { $nin: query[key].split(',') };
      } else if (key.includes('_regex')) {
        const field = key.replace('_regex', '');
        filter[field] = { $regex: query[key], $options: 'i' };
      } else {
        filter[key] = query[key];
      }
    }
  });

  return filter;
};

// Sort helper
const buildSort = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  return sort;
};

// Search helper for text search
const buildTextSearch = (searchTerm, searchFields = []) => {
  if (!searchTerm || searchFields.length === 0) {
    return {};
  }

  return {
    $or: searchFields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

// Date range helper
const buildDateRange = (startDate, endDate, field = 'createdAt') => {
  const filter = {};
  
  if (startDate || endDate) {
    filter[field] = {};
    if (startDate) {
      filter[field].$gte = new Date(startDate);
    }
    if (endDate) {
      filter[field].$lte = new Date(endDate);
    }
  }

  return filter;
};

// Response metadata helper
const addResponseMetadata = (data, metadata = {}) => {
  return {
    ...data,
    metadata: {
      timestamp: new Date().toISOString(),
      ...metadata
    }
  };
};

// Cache helper
const setCacheHeaders = (res, maxAge = 3600) => {
  res.set({
    'Cache-Control': `public, max-age=${maxAge}`,
    'Last-Modified': new Date().toUTCString()
  });
};

// CORS helper
const setCorsHeaders = (res) => {
  res.set({
    'Access-Control-Allow-Origin': process.env.CLIENT_URL || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  });
};

module.exports = {
  sendSuccess,
  sendError,
  paginate,
  sendPaginatedResponse,
  buildFilter,
  buildSort,
  buildTextSearch,
  buildDateRange,
  addResponseMetadata,
  setCacheHeaders,
  setCorsHeaders
};
