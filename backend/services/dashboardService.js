const FinancialRecord = require('../models/FinancialRecord');

const buildAccessMatch = (user) => {
  if (user.role === 'admin' || user.role === 'analyst') {
    return { isDeleted: { $ne: true } };
  }

  return {
    isDeleted: { $ne: true },
    createdBy: user._id,
  };
};

exports.getSummary = async (user) => {
  const match = buildAccessMatch(user);

  const summary = await FinancialRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
        totalExpenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
        avgTransactionValue: { $avg: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpenses: 1,
        netBalance: { $subtract: ['$totalIncome', '$totalExpenses'] },
        avgTransactionValue: { $round: ['$avgTransactionValue', 2] },
        incomeExpenseRatio: {
          $cond: [
            { $eq: ['$totalExpenses', 0] },
            null,
            { $round: [{ $divide: ['$totalIncome', '$totalExpenses'] }, 2] },
          ],
        },
      },
    },
  ]);

  return summary[0] || {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    avgTransactionValue: 0,
    incomeExpenseRatio: null,
  };
};

exports.getCategoryBreakdown = async (user) => {
  const match = buildAccessMatch(user);

  return await FinancialRecord.aggregate([
    { $match: { ...match, type: 'expense' } },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

exports.getMonthlyTrends = async (user) => {
  const match = buildAccessMatch(user);
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  return await FinancialRecord.aggregate([
    { $match: { ...match, date: { $gte: twelveMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
        expense: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } },
      },
    },
    {
      $project: {
        _id: 1,
        income: 1,
        expense: 1,
        net: { $subtract: ['$income', '$expense'] },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

exports.getWeeklyVsMonthlyComparison = async (user) => {
  const match = buildAccessMatch(user);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [weekly, monthly] = await Promise.all([
    FinancialRecord.aggregate([
      { $match: { ...match, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
    FinancialRecord.aggregate([
      { $match: { ...match, date: { $gte: monthAgo } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]),
  ]);

  const toTotals = (rows) => ({
    income: rows.find((row) => row._id === 'income')?.total || 0,
    expense: rows.find((row) => row._id === 'expense')?.total || 0,
  });

  return {
    weekly: toTotals(weekly),
    monthly: toTotals(monthly),
  };
};

exports.getRecentTransactions = async (user, limit = 5) => {
  const match = buildAccessMatch(user);

  return await FinancialRecord.find(match)
    .sort('-date')
    .limit(limit)
    .populate('createdBy', 'name email role');
};

exports.getAdvancedInsights = async (user) => {
  const [summary, topSpendingCategories, weeklyVsMonthly] = await Promise.all([
    this.getSummary(user),
    FinancialRecord.aggregate([
      { $match: { ...buildAccessMatch(user), type: 'expense' } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
    ]),
    this.getWeeklyVsMonthlyComparison(user),
  ]);

  return {
    incomeExpenseRatio: summary.incomeExpenseRatio,
    averageTransactionValue: summary.avgTransactionValue,
    topSpendingCategories,
    weeklyVsMonthly,
  };
};
