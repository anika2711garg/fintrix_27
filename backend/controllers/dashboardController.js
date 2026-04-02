const dashboardService = require('../services/dashboardService');
const aiService = require('../services/aiService');
const catchAsync = require('../utils/catchAsync');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Private (Analyst/Admin)
exports.getSummary = catchAsync(async (req, res, next) => {
  const summary = await dashboardService.getSummary(req.user);
  const recentTransactions = await dashboardService.getRecentTransactions(req.user);

  res.status(200).json({ success: true, data: { summary, recentTransactions } });
});

// @desc    Get dashboard insights (Breakdown and Trends)
// @route   GET /api/dashboard/insights
// @access  Private (Analyst/Admin)
exports.getInsights = catchAsync(async (req, res, next) => {
  const [categoryBreakdown, monthlyTrends, advanced] = await Promise.all([
    dashboardService.getCategoryBreakdown(req.user),
    dashboardService.getMonthlyTrends(req.user),
    dashboardService.getAdvancedInsights(req.user),
  ]);

  const summary = await dashboardService.getSummary(req.user);

  let insight = 'Financial insight:\n';
  if (categoryBreakdown.length > 0) {
    insight += `Top spending category: ${categoryBreakdown[0]._id} (${categoryBreakdown[0].total.toFixed(2)}). `;
  }
  if (advanced.incomeExpenseRatio !== null) {
    insight += `Income/Expense ratio: ${advanced.incomeExpenseRatio}. `;
  }
  insight += `Average transaction value: ${advanced.averageTransactionValue}.`;

  const categoryTotals = categoryBreakdown.map((row) => ({
    category: row._id,
    total: row.total,
  }));

  if (process.env.GROQ_API_KEY) {
    try {
      const aiInsight = await aiService.getFinancialInsights({
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses,
        netBalance: summary.netBalance,
        categoryTotals,
      });

      if (aiInsight && typeof aiInsight === 'string') {
        insight = aiInsight;
      }
    } catch (error) {
      // Keep deterministic insight response if AI provider fails.
    }
  }

  res.status(200).json({
    success: true,
    data: {
      insight,
      categoryBreakdown,
      monthlyTrends,
      advanced,
    },
  });
});
