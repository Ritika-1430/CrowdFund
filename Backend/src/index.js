require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const port = process.env.PORT || 4000;

// Use MongoDB Atlas or local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ritikasoni222006_db_user:ritika222006@contactapp.ozcjh94.mongodb.net/?appName=contactapp';

const mongooseOptions = {
  serverSelectionTimeoutMS: 3000,  // Fail fast if MongoDB not available
  socketTimeoutMS: 45000,
  retryWrites: true,
};

// Try to connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✓ Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('✗ MongoDB connection failed:', err.message);
    console.log('Tip: Start MongoDB with: mongod');
    console.log('Or update MONGODB_URI in .env file');
    return false;
  }
};

// Start server
const startServer = async () => {
  const dbConnected = await connectDB();

  // Log environment for debugging
  console.log('Using MONGODB_URI:', process.env.MONGODB_URI || 'mongodb+srv://ritikasoni222006_db_user:ritika222006@contactapp.ozcjh94.mongodb.net/?appName=contactapp');

  const host = process.env.BIND_HOST || '0.0.0.0';
  const server = app.listen(port, host, () => {
    const addr = server.address();
    console.log(`✓ Server listening on ${addr.address}:${addr.port}`);
    if (!dbConnected) {
      console.log('⚠ Warning: Database not connected, some features may not work');
    }
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    // If binding to loopback fails, attempt 0.0.0.0 as fallback
    if (err.code === 'EADDRNOTAVAIL' || err.code === 'EACCES') {
      console.warn('Attempting to bind to 0.0.0.0 due to error:', err.code);
      const server2 = app.listen(port, '0.0.0.0', () => {
        const addr = server2.address();
        console.log(`✓ Server listening on ${addr.address}:${addr.port}`);
      });
      server2.on('error', (e) => {
        console.error('Fallback server error:', e);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
};

// Handle global unexpected errors and log them for debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.stack || err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('exit', (code) => {
  console.log('Process exiting with code', code);
});

startServer().catch(err => {
  console.error('Startup error:', err);
  // avoid silently exiting without logs
  process.exit(1);
});


