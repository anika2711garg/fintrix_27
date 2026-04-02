const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new AppError('MONGODB_URI is required', 500);
    }

    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cachedConnection = conn.connection;
    return cachedConnection;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
