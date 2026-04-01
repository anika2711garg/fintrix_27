import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Wallet, Plus, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AddRecordModal from '../components/AddRecordModal';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#dc2626', '#0891b2', '#7c3aed', '#16a34a'];

const StatCard = ({ title, amount, icon, trend }) => (
  <motion.div
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">{icon}</div>
      <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</p>
    </div>
    <p className="text-3xl font-bold text-white">${(amount ?? 0).toLocaleString()}</p>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0d0d10] border border-white/10 rounded-xl p-3 text-xs shadow-xl">
        <p className="text-white/60 mb-1.5">{label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }}>
            {p.name}: ${p.value?.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const { user } = useAuth();

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getSummary();
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await dashboardService.getInsights();
      setInsights(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    if (user?.role !== 'Viewer') fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-violet-400" />
      </div>
    );
  }

  const summary = data?.summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
  const recentTx = data?.recentTransactions || [];

  // Build chart data from insights (passed via API)
  const monthlyData = (insights?.monthlyTrends || []).map((m) => ({
    name: MONTH_NAMES[m._id.month - 1],
    Income: m.income,
    Expense: m.expense,
  }));

  const categoryData = (insights?.categoryBreakdown || []).slice(0, 6).map((c) => ({
    name: c._id,
    value: c.total,
  }));

  return (
    <div className="space-y-8">
      <AddRecordModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchDashboard}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-violet-400">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Role: <span className="text-white/60 font-medium">{user?.role}</span>
          </p>
        </div>
        {user?.role !== 'Viewer' && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold text-white transition-colors shadow-lg shadow-violet-500/20"
          >
            <Plus size={18} /> Add Record
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Total Income" amount={summary.totalIncome} icon={<TrendingUp size={18} className="text-emerald-400" />} />
        <StatCard title="Total Expenses" amount={summary.totalExpenses} icon={<TrendingDown size={18} className="text-red-400" />} />
        <StatCard title="Net Balance" amount={summary.netBalance} icon={<Wallet size={18} className="text-violet-400" />} />
      </div>

      {/* Charts (Analyst/Admin only) */}
      {user?.role !== 'Viewer' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white/70 mb-5">Monthly Trends</h2>
            {loadingInsights ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={24} className="animate-spin text-violet-400" />
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-white/20 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Income" stroke="#7c3aed" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie Chart */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-white/70 mb-5">Category Breakdown</h2>
            {loadingInsights ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={24} className="animate-spin text-violet-400" />
              </div>
            ) : categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-white/20 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d0d10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', color: 'white' }}
                    formatter={(v) => [`$${v.toLocaleString()}`, '']}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* AI Insights (Analyst/Admin) */}
      {user?.role !== 'Viewer' && (
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-violet-300 mb-3 flex items-center gap-2">
            <TrendingUp size={15} /> AI Financial Insights
          </h2>
          {loadingInsights ? (
            <div className="flex items-center gap-2 text-white/30 text-sm animate-pulse">
              <Loader2 size={14} className="animate-spin" /> Analyzing patterns...
            </div>
          ) : insights?.insight ? (
            <div className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{insights.insight}</div>
          ) : typeof insights === 'string' ? (
            <div className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{insights}</div>
          ) : (
            <p className="text-sm text-white/30 italic">Add more records to generate insights.</p>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white/80">Recent Activity</h2>
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          {recentTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                <FileText size={20} className="text-white/20" />
              </div>
              <p className="text-white/30 text-sm">No transactions yet</p>
              {user?.role !== 'Viewer' && (
                <button onClick={() => setAddOpen(true)} className="text-xs text-violet-400 hover:underline">
                  Add your first record
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-white/10">
                <tr>
                  {['Date', 'Category', 'Type', 'Amount'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/30">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTx.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-white/50">
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-white/80">{tx.category}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
