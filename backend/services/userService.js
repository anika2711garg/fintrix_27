const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * @desc    Find all users with pagination and role filtering.
 */
exports.getAllUsers = async (query) => {
  const { role, status, page = 1, limit = 10 } = query;
  const filter = {};
  
  if (role) filter.role = role;
  if (status) filter.status = status;
  
  return await User.find(filter)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort('-createdAt');
};

/**
 * @desc    Get user by ID.
 */
exports.getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

/**
 * @desc    Update user status or role.
 */
exports.updateUser = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

/**
 * @desc    Soft delete user.
 */
exports.deleteUser = async (id) => {
  const user = await User.findByIdAndUpdate(id, { isDeleted: true });
  if (!user) throw new AppError('User not found', 404);
  return user;
};
