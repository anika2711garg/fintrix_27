const dotenv = require('dotenv');
const connectDB = require('../config/db');
const app = require('../app');

dotenv.config();

module.exports = async (req, res) => {
  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Serverless bootstrap error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to initialize server',
    });
  }
};
