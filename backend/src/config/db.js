const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MongoDB URI not configured, using mock database for development');
      // Set up mock database
      const { mockUser, mockCarbonCredit, mockTransaction } = require('./mockDb');
      
      // Replace the models with mock versions
      const User = require('../models/User');
      const CarbonCredit = require('../models/CarbonCredit');
      const Transaction = require('../models/Transaction');
      
      // Override the static methods with mock implementations
      Object.assign(User, mockUser);
      Object.assign(CarbonCredit, mockCarbonCredit);
      Object.assign(Transaction, mockTransaction);
      
      console.log('✅ Mock database initialized');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('⚠️  Falling back to mock database for development');
    
    // Set up mock database as fallback
    const { mockUser, mockCarbonCredit, mockTransaction } = require('./mockDb');
    
    // Replace the models with mock versions
    const User = require('../models/User');
    const CarbonCredit = require('../models/CarbonCredit');
    const Transaction = require('../models/Transaction');
    
    // Override the static methods with mock implementations
    Object.assign(User, mockUser);
    Object.assign(CarbonCredit, mockCarbonCredit);
    Object.assign(Transaction, mockTransaction);
    
    console.log('✅ Mock database initialized as fallback');
  }
};

module.exports = connectDB;
