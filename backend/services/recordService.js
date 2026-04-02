const FinancialRecord = require('../models/FinancialRecord');
const AppError = require('../utils/AppError');

/**
 * @desc    Find all records with advanced filtering, pagination, and regex-based search.
 */
exports.getAllRecords = async (query) => {
  const { type, category, startDate, endDate, page = 1, limit = 10, search } = query;
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = category;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }
  
  if (search) {
    filter.$or = [
      { category: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await FinancialRecord.countDocuments(filter);
  const records = await FinancialRecord.find(filter)
    .sort('-date')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    records,
  };
};

/**
 * @desc    Get a single financial record by ID.
 */
exports.getRecordById = async (id) => {
  const record = await FinancialRecord.findById(id).populate('createdBy', 'name email');
  if (!record) throw new AppError('Record not found', 404);
  return record;
};

/**
 * @desc    Create a new financial record.
 */
exports.createRecord = async (data, user) => {
  return await FinancialRecord.create({ ...data, createdBy: user.id });
};

/**
 * @desc    Update a financial record.
 */
exports.updateRecord = async (id, data) => {
  const record = await FinancialRecord.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!record) throw new AppError('Record not found', 404);
  return record;
};

/**
 * @desc    Soft delete a financial record.
 */
exports.deleteRecord = async (id) => {
  const record = await FinancialRecord.findByIdAndUpdate(id, { isDeleted: true });
  if (!record) throw new AppError('Record not found', 404);
  return record;
};
