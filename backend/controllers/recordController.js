const recordService = require('../services/recordService');
const auditService = require('../services/auditService');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all records
// @route   GET /api/records
// @access  Private
exports.getRecords = catchAsync(async (req, res, next) => {
  const result = await recordService.getAllRecords(req.query, req.user);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Export records (CSV/JSON)
// @route   GET /api/records/export
// @access  Private
exports.exportRecords = catchAsync(async (req, res, next) => {
  const payload = await recordService.exportRecords(req.query);

  res.setHeader('Content-Type', payload.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${payload.fileName}"`);
  return res.status(200).send(payload.body);
});

// @desc    Get deleted records
// @route   GET /api/records/trash
// @access  Private (Admin)
exports.getDeletedRecords = catchAsync(async (req, res, next) => {
  const result = await recordService.getDeletedRecords(req.query);

  res.status(200).json({
    success: true,
    ...result,
  });
});

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Private
exports.getRecord = catchAsync(async (req, res, next) => {
  const record = await recordService.getRecordById(req.params.id, req.user);
  res.status(200).json({ success: true, data: record });
});

// @desc    Create new record
// @route   POST /api/records
// @access  Private (Admin)
exports.createRecord = catchAsync(async (req, res, next) => {
  const record = await recordService.createRecord(req.body, req.user);

  await auditService.logEvent({
    action: 'CREATE_RECORD',
    entity: 'financialRecord',
    entityId: record._id,
    user: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { type: record.type, amount: record.amount },
  });

  res.status(201).json({ success: true, data: record });
});

// @desc    Update record
// @route   PUT /api/records/:id
// @access  Private (Admin)
exports.updateRecord = catchAsync(async (req, res, next) => {
  const record = await recordService.updateRecord(req.params.id, req.body);

  await auditService.logEvent({
    action: 'UPDATE_RECORD',
    entity: 'financialRecord',
    entityId: record._id,
    user: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: req.body,
  });

  res.status(200).json({ success: true, data: record });
});

// @desc    Delete record (Soft delete)
// @route   DELETE /api/records/:id
// @access  Private (Admin)
exports.deleteRecord = catchAsync(async (req, res, next) => {
  const deleted = await recordService.deleteRecord(req.params.id);

  await auditService.logEvent({
    action: 'DELETE_RECORD',
    entity: 'financialRecord',
    entityId: req.params.id,
    user: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    metadata: { deletedAt: new Date(), amount: deleted.amount, type: deleted.type },
  });

  res.status(200).json({ success: true, data: {} });
});

// @desc    Restore soft deleted record
// @route   PATCH /api/records/:id/restore
// @access  Private (Admin)
exports.restoreRecord = catchAsync(async (req, res, next) => {
  const record = await recordService.restoreRecord(req.params.id);

  await auditService.logEvent({
    action: 'RESTORE_RECORD',
    entity: 'financialRecord',
    entityId: record._id,
    user: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.status(200).json({ success: true, data: record });
});
