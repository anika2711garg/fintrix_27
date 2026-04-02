const dashboardService = require('../services/dashboardService');
const catchAsync = require('../utils/catchAsync');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private
exports.getSummary = catchAsync(async (req, res, next) => {
  const summary = await dashboardService.getSummary();
  const recentTransactions = await dashboardService.getRecentTransactions();
  res.status(200).json({ success: true, data: { summary, recentTransactions } });
});

// @desc    Get dashboard insights (Breakdown and Trends)
// @route   GET /api/dashboard/insights
// @access  Private (Analyst/Admin)
exports.getInsights = catchAsync(async (req, res, next) => {
  const breakdown = await dashboardService.getCategoryBreakdown();
  const trends = await dashboardService.getMonthlyTrends();

  let insight = 'Based on your financial patterns:\n\n';
  if (breakdown.length > 0) {
    insight += `• Your top spending category is '${breakdown[0]._id}' with $${breakdown[0].total.toLocaleString()} total.\n`;
  }
  if (trends.length > 0) {
    const lastMonth = trends[trends.length - 1];
    const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][lastMonth._id.month - 1];
    insight += `• In ${monthName} ${lastMonth._id.year}, income was $${lastMonth.income.toLocaleString()} and expenses were $${lastMonth.expense.toLocaleString()}.\n`;
    const net = lastMonth.income - lastMonth.expense;
    insight += `• Net for the month: ${net >= 0 ? '+' : ''}$${net.toLocaleString()}.\n`;
  }
  if (breakdown.length === 0 && trends.length === 0) {
    insight = 'Not enough data to generate insights yet. Add some financial records to get started!';
  }

  res.status(200).json({
    success: true,
    data: {
      insight,
      categoryBreakdown: breakdown,
      monthlyTrends: trends,
    },
  });
});
