const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const app = require('./src/app');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  🚀 Carbonease Backend Server Running!
  
  📍 Environment: ${process.env.NODE_ENV || 'development'}
  🌐 Server: http://localhost:${PORT}
  🗄️  Database: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}
  💳 Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured' : 'Not configured'}
  📧 Email: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}
  
  📚 API Documentation: http://localhost:${PORT}/api
  ❤️  Health Check: http://localhost:${PORT}/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`);
  console.log('Shutting down the server due to uncaught exception...');
  process.exit(1);
});

module.exports = server;
