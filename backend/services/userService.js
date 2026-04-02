const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * @desc    Check if an email already exists. Includes soft-deleted users.
 */
exports.findByEmail = async (email, { includeDeleted = false } = {}) => {
  let query = User.findOne({ email });

  if (includeDeleted) {
    query = query.setOptions({ includeDeleted: true });
  }

  return await query;
};

/**
 * @desc    Create a new user.
 */
exports.createUser = async (data) => {
  return await User.create(data);
};

/**
 * @desc    Find all users with pagination, filters, and search.
 */
exports.getAllUsers = async (query) => {
  const {
    role,
    status,
    search,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  if (role) filter.role = role;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .sort('-createdAt');

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    count: users.length,
    users,
  };
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
