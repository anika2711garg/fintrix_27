const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const authService = require('../services/authService');
const auditService = require('../services/auditService');
const userService = require('../services/userService');

const buildAuthResponse = async ({ user, statusCode, res, req, action }) => {
  const accessToken = authService.signAccessToken(user);
  const refresh = await authService.issueRefreshToken({
    user,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  user.password = undefined;

  await auditService.logEvent({
    action,
    entity: 'user',
    entityId: user._id,
    user: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { role: user.role },
  });

  res.status(statusCode).json({
    success: true,
    data: user,
    tokens: {
      accessToken,
      refreshToken: refresh.refreshToken,
      expiresAt: refresh.expiresAt,
    },
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const existing = await userService.findByEmail(email);
  if (existing) {
    return next(new AppError('User already exists with this email', 409));
  }

  const user = await userService.createUser({
    name,
    email,
    password,
    role,
  });

  await buildAuthResponse({ user, statusCode: 201, res, req, action: 'REGISTER_USER' });
});

// @desc    Create user by admin
// @route   POST /api/auth/users
// @access  Private (Admin)
exports.createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role, status } = req.body;

  const existing = await userService.findByEmail(email, { includeDeleted: true });
  if (existing) {
    return next(new AppError('User already exists with this email', 409));
  }

  const user = await userService.createUser({
    name,
    email,
    password,
    role,
    status,
  });

  user.password = undefined;

  await auditService.logEvent({
    action: 'CREATE_USER',
    entity: 'user',
    entityId: user._id,
    user: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { createdRole: user.role },
  });

  res.status(201).json({ success: true, data: user });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide an email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password +tokenVersion');

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (user.status === 'inactive') {
    return next(new AppError('Your account is deactivated', 403));
  }

  await buildAuthResponse({ user, statusCode: 200, res, req, action: 'LOGIN_USER' });
});

// @desc    Rotate tokens using refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refresh = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  const rotated = await authService.rotateRefreshToken({
    providedToken: refreshToken,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  if (!rotated) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  await auditService.logEvent({
    action: 'REFRESH_TOKEN',
    entity: 'user',
    entityId: rotated.user._id,
    user: rotated.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(200).json({
    success: true,
    tokens: {
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      expiresAt: rotated.expiresAt,
    },
  });
});

// @desc    Logout (invalidate provided refresh token)
// @route   POST /api/auth/logout
// @access  Public
exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  await authService.revokeRefreshToken(refreshToken);

  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Logout from all sessions
// @route   POST /api/auth/logout-all
// @access  Private
exports.logoutAll = catchAsync(async (req, res, next) => {
  await authService.revokeAllUserRefreshTokens(req.user._id);

  await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } }, { new: true });

  await auditService.logEvent({
    action: 'LOGOUT_ALL',
    entity: 'user',
    entityId: req.user._id,
    user: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(200).json({ success: true, message: 'Logged out from all sessions' });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await userService.getUserById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin)
exports.getUsers = catchAsync(async (req, res, next) => {
  const result = await userService.getAllUsers(req.query);

  res.status(200).json({
    success: true,
    total: result.total,
    page: result.page,
    pages: result.pages,
    count: result.count,
    data: result.users,
  });
});

// @desc    Update user role or status
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
exports.updateUser = catchAsync(async (req, res, next) => {
  const { role, status } = req.body;

  if (req.params.id === req.user.id.toString()) {
    return next(new AppError('You cannot modify your own account via this route', 400));
  }

  const fieldsToUpdate = {};
  if (role) fieldsToUpdate.role = role;
  if (status) fieldsToUpdate.status = status;

  const user = await userService.updateUser(req.params.id, fieldsToUpdate);

  if (!user) return next(new AppError('User not found', 404));

  await auditService.logEvent({
    action: 'UPDATE_USER',
    entity: 'user',
    entityId: user._id,
    user: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: fieldsToUpdate,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc    Soft delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
exports.deleteUser = catchAsync(async (req, res, next) => {
  if (req.params.id === req.user.id.toString()) {
    return next(new AppError('You cannot delete your own account via this route', 400));
  }

  const user = await userService.deleteUser(req.params.id);

  if (!user) return next(new AppError('User not found', 404));

  await auditService.logEvent({
    action: 'DELETE_USER',
    entity: 'user',
    entityId: req.params.id,
    user: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(200).json({ success: true, data: {} });
});
