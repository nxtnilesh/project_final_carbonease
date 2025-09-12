// MongoDB initialization script for Docker
db = db.getSiblingDB('carbonease');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['firstName', 'lastName', 'email', 'password', 'role'],
      properties: {
        firstName: {
          bsonType: 'string',
          maxLength: 50
        },
        lastName: {
          bsonType: 'string',
          maxLength: 50
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
        },
        role: {
          bsonType: 'string',
          enum: ['buyer', 'seller', 'admin']
        }
      }
    }
  }
});

db.createCollection('carboncredits', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['seller', 'title', 'description', 'energyType', 'totalCredits', 'pricePerCredit'],
      properties: {
        energyType: {
          bsonType: 'string',
          enum: ['wind', 'solar', 'hydro', 'geothermal', 'biomass', 'nuclear', 'other']
        },
        status: {
          bsonType: 'string',
          enum: ['draft', 'active', 'sold-out', 'suspended', 'expired']
        }
      }
    }
  }
});

db.createCollection('transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['buyer', 'seller', 'carbonCredit', 'quantity', 'totalAmount'],
      properties: {
        status: {
          bsonType: 'string',
          enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded']
        },
        'payment.status': {
          bsonType: 'string',
          enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled']
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.carboncredits.createIndex({ seller: 1 });
db.carboncredits.createIndex({ energyType: 1 });
db.carboncredits.createIndex({ status: 1 });
db.carboncredits.createIndex({ 'projectLocation.country': 1 });
db.carboncredits.createIndex({ pricePerCredit: 1 });
db.carboncredits.createIndex({ createdAt: -1 });
db.carboncredits.createIndex({ isVerified: 1 });
db.carboncredits.createIndex({
  title: 'text',
  description: 'text',
  'projectDetails.projectName': 'text',
  tags: 'text'
});

db.transactions.createIndex({ buyer: 1 });
db.transactions.createIndex({ seller: 1 });
db.transactions.createIndex({ carbonCredit: 1 });
db.transactions.createIndex({ status: 1 });
db.transactions.createIndex({ 'payment.status': 1 });
db.transactions.createIndex({ createdAt: -1 });
db.transactions.createIndex({ 'payment.stripePaymentIntentId': 1 });
db.transactions.createIndex({ 'payment.stripeSessionId': 1 });

// Create compound indexes
db.transactions.createIndex({ buyer: 1, status: 1 });
db.transactions.createIndex({ seller: 1, status: 1 });
db.transactions.createIndex({ status: 1, createdAt: -1 });

print('Database initialized successfully!');
