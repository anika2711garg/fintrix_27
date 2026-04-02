const mongoose = require('mongoose');
const FinancialRecord = require('../models/FinancialRecord');

/**
 * @desc    Fetch aggregated dashboard summary using MongoDB aggregation pipelines.
 *          Provides totals, category-wise breakdowns, and monthly trends.
 */
exports.getSummary = async () => {
  const summary = await FinancialRecord.aggregate([
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalIncome: 1,
        totalExpenses: 1,
        netBalance: { $subtract: ['$totalIncome', '$totalExpenses'] },
      },
    },
  ]);

  return summary[0] || { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
};

/**
 * @desc    Get category-wise totals.
 */
exports.getCategoryBreakdown = async () => {
  return await FinancialRecord.aggregate([
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

/**
 * @desc    Get monthly trends for income and expenses over the last 12 months.
 */
exports.getMonthlyTrends = async () => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);

  return await FinancialRecord.aggregate([
    {
      $match: {
        date: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

/**
 * @desc    Get the most recent transactions.
 */
exports.getRecentTransactions = async (limit = 5) => {
  return await FinancialRecord.find()
    .sort('-date')
    .limit(limit)
    .populate('createdBy', 'name email');
};
