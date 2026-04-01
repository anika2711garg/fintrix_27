const dashboardService = require('../services/dashboardService');
const catchAsync = require('../utils/catchAsync');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = catchAsync(async (req, res, next) => {
  const summary = await dashboardService.getSummary();
  res.status(200).json({ success: true, data: summary });
});

// @desc    Get dashboard insights (Breakdown and Trends)
// @route   GET /api/dashboard/insights
// @access  Private (Analyst/Admin)
exports.getInsights = catchAsync(async (req, res, next) => {
  const breakdown = await dashboardService.getCategoryBreakdown();
  const trends = await dashboardService.getMonthlyTrends();
  const recent = await dashboardService.getRecentTransactions();

  res.status(200).json({
    success: true,
    data: {
      categoryBreakdown: breakdown,
      monthlyTrends: trends,
      recentTransactions: recent,
    },
  });
});
