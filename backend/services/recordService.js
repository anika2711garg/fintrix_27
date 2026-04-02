const FinancialRecord = require('../models/FinancialRecord');
const AppError = require('../utils/AppError');

const sortMap = {
  latest: { date: -1 },
  oldest: { date: 1 },
  highest: { amount: -1 },
  lowest: { amount: 1 },
};

const buildFilter = ({ type, category, startDate, endDate, search }) => {
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

  return filter;
};

const buildViewerProjection = (role) => {
  if (role === 'viewer') {
    return 'amount type category date createdAt updatedAt';
  }

  return undefined;
};

const toCsv = (records) => {
  const headers = ['id', 'amount', 'type', 'category', 'date', 'description', 'createdBy'];
  const lines = records.map((record) => {
    const values = [
      record._id,
      record.amount,
      record.type,
      record.category,
      record.date ? new Date(record.date).toISOString() : '',
      record.description || '',
      record.createdBy?._id || record.createdBy || '',
    ];

    return values
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',');
  });

  return [headers.join(','), ...lines].join('\n');
};

exports.getAllRecords = async (query, user) => {
  const {
    type,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    search,
    sort = 'latest',
  } = query;

  const filter = buildFilter({ type, category, startDate, endDate, search });
  const total = await FinancialRecord.countDocuments(filter);

  const projection = buildViewerProjection(user.role);

  let queryBuilder = FinancialRecord.find(filter)
    .sort(sortMap[sort] || sortMap.latest)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  if (projection) {
    queryBuilder = queryBuilder.select(projection);
  }

  const records = await queryBuilder.populate('createdBy', 'name email role');

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    count: records.length,
    records,
  };
};

exports.getRecordById = async (id, user) => {
  const projection = buildViewerProjection(user.role);
  let query = FinancialRecord.findById(id);

  if (projection) {
    query = query.select(projection);
  }

  const record = await query.populate('createdBy', 'name email role');

  if (!record) throw new AppError('Record not found', 404);
  return record;
};

exports.createRecord = async (data, user) => {
  return await FinancialRecord.create({ ...data, createdBy: user.id });
};

exports.updateRecord = async (id, data) => {
  const record = await FinancialRecord.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!record) throw new AppError('Record not found', 404);
  return record;
};

exports.deleteRecord = async (id) => {
  const record = await FinancialRecord.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!record) throw new AppError('Record not found', 404);
  return record;
};

exports.restoreRecord = async (id) => {
  const record = await FinancialRecord.findOneAndUpdate(
    { _id: id, isDeleted: true },
    { isDeleted: false },
    { new: true, runValidators: true, includeDeleted: true }
  );

  if (!record) throw new AppError('Deleted record not found', 404);
  return record;
};

exports.getDeletedRecords = async ({ page = 1, limit = 10 }) => {
  const filter = { isDeleted: true };

  const total = await FinancialRecord.countDocuments(filter);
  const records = await FinancialRecord.find(filter)
    .setOptions({ includeDeleted: true })
    .sort({ updatedAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .populate('createdBy', 'name email role');

  return {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    count: records.length,
    records,
  };
};

exports.exportRecords = async (query) => {
  const { format = 'json', sort = 'latest' } = query;
  const filter = buildFilter(query);

  const records = await FinancialRecord.find(filter)
    .sort(sortMap[sort] || sortMap.latest)
    .populate('createdBy', 'name email role');

  if (format === 'csv') {
    return {
      contentType: 'text/csv; charset=utf-8',
      fileName: `financial-records-${Date.now()}.csv`,
      body: toCsv(records),
    };
  }

  return {
    contentType: 'application/json; charset=utf-8',
    fileName: `financial-records-${Date.now()}.json`,
    body: JSON.stringify(records, null, 2),
  };
};
