const recordService = require('../services/recordService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// @desc    Get all records
// @route   GET /api/records
// @access  Private
exports.getRecords = catchAsync(async (req, res, next) => {
  const result = await recordService.getAllRecords(req.query);
  
  res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Private
exports.getRecord = catchAsync(async (req, res, next) => {
  const record = await recordService.getRecordById(req.params.id);
  res.status(200).json({ success: true, data: record });
});

// @desc    Create new record
// @route   POST /api/records
// @access  Private (Admin/Analyst)
exports.createRecord = catchAsync(async (req, res, next) => {
  const record = await recordService.createRecord(req.body, req.user);
  res.status(201).json({ success: true, data: record });
});

// @desc    Update record
// @route   PUT /api/records/:id
// @access  Private (Admin Only)
exports.updateRecord = catchAsync(async (req, res, next) => {
  const record = await recordService.updateRecord(req.params.id, req.body);
  res.status(200).json({ success: true, data: record });
});

// @desc    Delete record (Soft delete)
// @route   DELETE /api/records/:id
// @access  Private (Admin Only)
exports.deleteRecord = catchAsync(async (req, res, next) => {
  await recordService.deleteRecord(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
