import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Wallet, Plus, Loader2, FileText, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AddRecordModal from '../components/AddRecordModal';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#0b8f77', '#f08a4b', '#1982c4', '#39a96b', '#e36465', '#7b6d8d', '#d4a017', '#2b6f77'];

const sectionReveal = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const cardStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const cardItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const StatCard = ({ title, amount, icon, compact }) => (
  <motion.div
    variants={cardItem}
    whileHover={{ y: -4 }}
    transition={{ type: 'spring', stiffness: 300 }}
    className={`panel panel-lift ${compact ? 'p-4' : 'p-5'} hover:bg-white/90 transition-colors`}
  >
    <div className={`flex justify-between items-start ${compact ? 'mb-3' : 'mb-4'}`}>
      <div className="p-2.5 rounded-xl border bg-white/70" style={{ borderColor: 'var(--line)' }}>{icon}</div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{title}</p>
    </div>
    <p className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold`}>${(amount ?? 0).toLocaleString()}</p>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="panel-strong p-3 text-xs shadow-xl">
        <p className="text-muted mb-1.5">{label}</p>
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
  const [compact, setCompact] = useState(false);
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
        <Loader2 size={36} className="animate-spin" color="#0b8f77" />
      </div>
    );
  }

  const summary = data?.summary || { totalIncome: 0, totalExpenses: 0, netBalance: 0 };
  const recentTx = data?.recentTransactions || [];
  const savingsRate = summary.totalIncome > 0
    ? Math.max(0, Math.min(100, Math.round((summary.netBalance / summary.totalIncome) * 100)))
    : 0;

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
    <motion.div className={compact ? 'space-y-6' : 'space-y-8'} initial="hidden" animate="visible" variants={cardStagger}>
      <AddRecordModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchDashboard}
      />

      <motion.div variants={sectionReveal} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">Overview</p>
          <h1 className="text-3xl font-bold">
            Welcome back, <span style={{ color: 'var(--brand)' }}>{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Role: <span className="font-semibold" style={{ color: 'var(--ink)' }}>{user?.role}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompact((v) => !v)}
            className="btn-secondary text-sm"
          >
            {compact ? 'Comfort View' : 'Dense View'}
          </button>
          {user?.role !== 'Viewer' && (
            <button
              onClick={() => setAddOpen(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={18} /> Add Record
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={sectionReveal} className="panel panel-lift p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(11,143,119,0.12)', color: 'var(--brand)' }}>
            <Sparkles size={13} /> Financial Pulse
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: '#0f8a58' }}>
            Savings Rate {savingsRate}%
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: summary.netBalance >= 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: summary.netBalance >= 0 ? '#0f8a58' : '#b83136' }}>
            Net {summary.netBalance >= 0 ? 'Positive' : 'Negative'}
          </div>
        </div>
      </motion.div>

      <motion.div variants={cardStagger} className={`grid grid-cols-1 sm:grid-cols-3 ${compact ? 'gap-3' : 'gap-5'}`}>
        <StatCard compact={compact} title="Total Income" amount={summary.totalIncome} icon={<TrendingUp size={18} color="#118a4e" />} />
        <StatCard compact={compact} title="Total Expenses" amount={summary.totalExpenses} icon={<TrendingDown size={18} color="#d93036" />} />
        <StatCard compact={compact} title="Net Balance" amount={summary.netBalance} icon={<Wallet size={18} color="#0b8f77" />} />
      </motion.div>

      {user?.role !== 'Viewer' && (
        <motion.div variants={sectionReveal} className={`grid grid-cols-1 lg:grid-cols-3 ${compact ? 'gap-3' : 'gap-5'}`}>
          <div className={`lg:col-span-2 panel panel-lift ${compact ? 'p-4' : 'p-5'}`}>
            <h2 className={`text-sm font-semibold ${compact ? 'mb-3' : 'mb-5'}`}>Monthly Trends</h2>
            {loadingInsights ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={24} className="animate-spin" color="#0b8f77" />
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={compact ? 170 : 200}>
                <AreaChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b8f77" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0b8f77" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e36465" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e36465" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(11, 45, 35, 0.11)" />
                  <XAxis dataKey="name" tick={{ fill: '#61716a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#61716a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Income" stroke="#0b8f77" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="Expense" stroke="#e36465" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={`panel panel-lift ${compact ? 'p-4' : 'p-5'}`}>
            <h2 className={`text-sm font-semibold ${compact ? 'mb-3' : 'mb-5'}`}>Category Breakdown</h2>
            {loadingInsights ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={24} className="animate-spin" color="#0b8f77" />
              </div>
            ) : categoryData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={compact ? 170 : 200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(15,45,35,0.15)', borderRadius: '12px', fontSize: '12px', color: '#16211b' }}
                    formatter={(v) => [`$${v.toLocaleString()}`, '']}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ color: '#64766d', fontSize: '11px' }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      )}

      {user?.role !== 'Viewer' && (
        <motion.div variants={sectionReveal} className={`rounded-2xl border ${compact ? 'p-4' : 'p-5'}`} style={{ background: 'linear-gradient(135deg, rgba(11,143,119,0.09), rgba(240,138,75,0.1))', borderColor: 'rgba(11,143,119,0.22)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--brand)' }}>
            <TrendingUp size={15} /> AI Financial Insights
          </h2>
          {loadingInsights ? (
            <div className="flex items-center gap-2 text-muted text-sm animate-pulse">
              <Loader2 size={14} className="animate-spin" /> Analyzing patterns...
            </div>
          ) : insights?.insight ? (
            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--ink)' }}>{insights.insight}</div>
          ) : typeof insights === 'string' ? (
            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--ink)' }}>{insights}</div>
          ) : (
            <p className="text-sm text-muted italic">Add more records to generate insights.</p>
          )}
        </motion.div>
      )}

      <motion.div variants={sectionReveal} className="space-y-4">
        <h2 className="text-base font-semibold">Recent Activity</h2>
        <div className="panel panel-lift overflow-hidden">
          {recentTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center border" style={{ borderColor: 'var(--line)' }}>
                <FileText size={20} className="text-muted" />
              </div>
              <p className="text-muted text-sm">No transactions yet</p>
              {user?.role !== 'Viewer' && (
                <button onClick={() => setAddOpen(true)} className="text-xs hover:underline" style={{ color: 'var(--brand)' }}>
                  Add your first record
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b" style={{ borderColor: 'var(--line)' }}>
                <tr>
                  {['Date', 'Category', 'Type', 'Amount'].map((h) => (
                    <th key={h} className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'} text-xs font-semibold uppercase tracking-wider text-muted`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                className="divide-y"
                style={{ borderColor: 'rgba(15,45,35,0.08)' }}
                variants={cardStagger}
                initial="hidden"
                animate="visible"
              >
                {recentTx.map((tx) => (
                  <motion.tr key={tx._id} variants={cardItem} className="hover:bg-white/70 transition-colors">
                    <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'} text-sm text-muted`}>
                      {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'} text-sm font-medium`}>{tx.category}</td>
                    <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'}`}>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${tx.type === 'income' ? 'bg-emerald-500/12 text-emerald-700' : 'bg-red-500/12 text-red-700'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'} text-sm font-bold ${tx.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
