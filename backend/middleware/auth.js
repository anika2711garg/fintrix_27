const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('+tokenVersion');

    if (!req.user) {
      return next(new AppError('User not found', 401));
    }

    if (req.user.status === 'inactive') {
      return next(new AppError('User account is deactivated', 403));
    }

    if (typeof decoded.tokenVersion === 'number' && decoded.tokenVersion !== req.user.tokenVersion) {
      return next(new AppError('Session is no longer valid. Please login again.', 401));
    }

    next();
  } catch (err) {
    return next(new AppError('Not authorized to access this route', 401));
  }
};
