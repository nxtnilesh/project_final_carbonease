// Mock database for development when MongoDB is not available
const mockData = {
  users: [],
  carbonCredits: [],
  transactions: []
};

let nextId = 1;

const generateId = () => nextId++;

// Mock User operations
const mockUser = {
  findOne: (query) => {
    return Promise.resolve(mockData.users.find(user => {
      return Object.keys(query).every(key => user[key] === query[key]);
    }) || null);
  },
  
  findById: (id) => {
    return Promise.resolve(mockData.users.find(user => user._id === id) || null);
  },
  
  create: (userData) => {
    const user = {
      _id: generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockData.users.push(user);
    return Promise.resolve(user);
  },
  
  findByIdAndUpdate: (id, update, options) => {
    const userIndex = mockData.users.findIndex(user => user._id === id);
    if (userIndex !== -1) {
      mockData.users[userIndex] = {
        ...mockData.users[userIndex],
        ...update,
        updatedAt: new Date()
      };
      return Promise.resolve(mockData.users[userIndex]);
    }
    return Promise.resolve(null);
  },
  
  findByIdAndDelete: (id) => {
    const userIndex = mockData.users.findIndex(user => user._id === id);
    if (userIndex !== -1) {
      const deletedUser = mockData.users.splice(userIndex, 1)[0];
      return Promise.resolve(deletedUser);
    }
    return Promise.resolve(null);
  }
};

// Mock CarbonCredit operations
const mockCarbonCredit = {
  find: (query = {}) => {
    let results = mockData.carbonCredits;
    
    // Simple query filtering
    if (query.seller) {
      results = results.filter(credit => credit.seller === query.seller);
    }
    if (query.energyType) {
      results = results.filter(credit => credit.energyType === query.energyType);
    }
    if (query.status) {
      results = results.filter(credit => credit.status === query.status);
    }
    
    return Promise.resolve(results);
  },
  
  findById: (id) => {
    return Promise.resolve(mockData.carbonCredits.find(credit => credit._id === id) || null);
  },
  
  create: (creditData) => {
    const credit = {
      _id: generateId(),
      ...creditData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockData.carbonCredits.push(credit);
    return Promise.resolve(credit);
  },
  
  findByIdAndUpdate: (id, update, options) => {
    const creditIndex = mockData.carbonCredits.findIndex(credit => credit._id === id);
    if (creditIndex !== -1) {
      mockData.carbonCredits[creditIndex] = {
        ...mockData.carbonCredits[creditIndex],
        ...update,
        updatedAt: new Date()
      };
      return Promise.resolve(mockData.carbonCredits[creditIndex]);
    }
    return Promise.resolve(null);
  },
  
  findByIdAndDelete: (id) => {
    const creditIndex = mockData.carbonCredits.findIndex(credit => credit._id === id);
    if (creditIndex !== -1) {
      const deletedCredit = mockData.carbonCredits.splice(creditIndex, 1)[0];
      return Promise.resolve(deletedCredit);
    }
    return Promise.resolve(null);
  },
  
  countDocuments: (query = {}) => {
    let results = mockData.carbonCredits;
    
    if (query.seller) {
      results = results.filter(credit => credit.seller === query.seller);
    }
    if (query.energyType) {
      results = results.filter(credit => credit.energyType === query.energyType);
    }
    if (query.status) {
      results = results.filter(credit => credit.status === query.status);
    }
    
    return Promise.resolve(results.length);
  },
  
  distinct: (field) => {
    const values = new Set();
    mockData.carbonCredits.forEach(credit => {
      if (credit[field]) {
        values.add(credit[field]);
      }
    });
    return Promise.resolve(Array.from(values));
  },
  
  aggregate: (pipeline) => {
    // Simple aggregation for stats
    if (pipeline[0]?.$match?.seller) {
      const sellerCredits = mockData.carbonCredits.filter(credit => 
        credit.seller === pipeline[0].$match.seller
      );
      
      const stats = {
        totalCredits: sellerCredits.reduce((sum, credit) => sum + (credit.totalCredits || 0), 0),
        totalAvailable: sellerCredits.reduce((sum, credit) => sum + (credit.availableCredits || 0), 0),
        totalSold: sellerCredits.reduce((sum, credit) => sum + ((credit.totalCredits || 0) - (credit.availableCredits || 0)), 0),
        totalValue: sellerCredits.reduce((sum, credit) => sum + ((credit.totalCredits || 0) * (credit.pricePerCredit || 0)), 0),
        availableValue: sellerCredits.reduce((sum, credit) => sum + ((credit.availableCredits || 0) * (credit.pricePerCredit || 0)), 0),
        soldValue: sellerCredits.reduce((sum, credit) => sum + (((credit.totalCredits || 0) - (credit.availableCredits || 0)) * (credit.pricePerCredit || 0)), 0),
        totalListings: sellerCredits.length,
        activeListings: sellerCredits.filter(credit => credit.status === 'active').length,
        totalViews: sellerCredits.reduce((sum, credit) => sum + (credit.viewCount || 0), 0),
        totalPurchases: sellerCredits.reduce((sum, credit) => sum + (credit.purchaseCount || 0), 0),
        averageRating: sellerCredits.length > 0 ? sellerCredits.reduce((sum, credit) => sum + (credit.averageRating || 0), 0) / sellerCredits.length : 0
      };
      
      return Promise.resolve([stats]);
    }
    
    return Promise.resolve([]);
  }
};

// Mock Transaction operations
const mockTransaction = {
  find: (query = {}) => {
    let results = mockData.transactions;
    
    if (query.buyer) {
      results = results.filter(transaction => transaction.buyer === query.buyer);
    }
    if (query.seller) {
      results = results.filter(transaction => transaction.seller === query.seller);
    }
    if (query.status) {
      results = results.filter(transaction => transaction.status === query.status);
    }
    
    return Promise.resolve(results);
  },
  
  findById: (id) => {
    return Promise.resolve(mockData.transactions.find(transaction => transaction._id === id) || null);
  },
  
  create: (transactionData) => {
    const transaction = {
      _id: generateId(),
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockData.transactions.push(transaction);
    return Promise.resolve(transaction);
  },
  
  findByIdAndUpdate: (id, update, options) => {
    const transactionIndex = mockData.transactions.findIndex(transaction => transaction._id === id);
    if (transactionIndex !== -1) {
      mockData.transactions[transactionIndex] = {
        ...mockData.transactions[transactionIndex],
        ...update,
        updatedAt: new Date()
      };
      return Promise.resolve(mockData.transactions[transactionIndex]);
    }
    return Promise.resolve(null);
  },
  
  findByIdAndDelete: (id) => {
    const transactionIndex = mockData.transactions.findIndex(transaction => transaction._id === id);
    if (transactionIndex !== -1) {
      const deletedTransaction = mockData.transactions.splice(transactionIndex, 1)[0];
      return Promise.resolve(deletedTransaction);
    }
    return Promise.resolve(null);
  },
  
  countDocuments: (query = {}) => {
    let results = mockData.transactions;
    
    if (query.buyer) {
      results = results.filter(transaction => transaction.buyer === query.buyer);
    }
    if (query.seller) {
      results = results.filter(transaction => transaction.seller === query.seller);
    }
    if (query.status) {
      results = results.filter(transaction => transaction.status === query.status);
    }
    
    return Promise.resolve(results.length);
  },
  
  aggregate: (pipeline) => {
    // Simple aggregation for stats
    if (pipeline[0]?.$match?.buyer || pipeline[0]?.$match?.seller) {
      const userField = pipeline[0].$match.buyer ? 'buyer' : 'seller';
      const userId = pipeline[0].$match[userField];
      
      const userTransactions = mockData.transactions.filter(transaction => 
        transaction[userField] === userId
      );
      
      const stats = {
        totalTransactions: userTransactions.length,
        totalVolume: userTransactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0),
        totalCredits: userTransactions.reduce((sum, transaction) => sum + (transaction.quantity || 0), 0),
        completedTransactions: userTransactions.filter(transaction => transaction.status === 'completed').length,
        pendingTransactions: userTransactions.filter(transaction => transaction.status === 'pending').length,
        averageTransactionValue: userTransactions.length > 0 ? userTransactions.reduce((sum, transaction) => sum + (transaction.totalAmount || 0), 0) / userTransactions.length : 0
      };
      
      return Promise.resolve([stats]);
    }
    
    return Promise.resolve([]);
  }
};

// Add some sample data
const sampleUser = {
  _id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'seller',
  company: 'Green Energy Corp',
  isEmailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const sampleCredit = {
  _id: 1,
  seller: 1,
  title: 'Solar Farm Project - California',
  description: 'Large-scale solar energy project in California',
  energyType: 'solar',
  projectLocation: {
    country: 'United States',
    state: 'California'
  },
  totalCredits: 1000,
  availableCredits: 800,
  pricePerCredit: 25.50,
  currency: 'USD',
  certification: {
    standard: 'VCS',
    certifier: 'Verra',
    certificateNumber: 'VCS-2024-001'
  },
  status: 'active',
  isVerified: true,
  viewCount: 150,
  purchaseCount: 2,
  averageRating: 4.5,
  createdAt: new Date(),
  updatedAt: new Date()
};

mockData.users.push(sampleUser);
mockData.carbonCredits.push(sampleCredit);

module.exports = {
  mockUser,
  mockCarbonCredit,
  mockTransaction,
  mockData
};
