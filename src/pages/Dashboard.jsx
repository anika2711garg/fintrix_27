import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Wallet, Clock, Tag, Plus, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboard();
    if (user?.role !== 'Viewer') fetchInsights();
  }, []);

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

  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 space-y-8">
      {/* Header remain unchanged */}
      <header className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10">
        <div>
          <h1 className="text-2xl font-bold">Hello, {user?.name}</h1>
          <p className="text-white/60 text-sm">Role: <span className="text-primary">{user?.role}</span></p>
        </div>
        <button onClick={logout} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-danger">
          <LogOut size={24} />
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Income" 
          amount={data?.summary.totalIncome} 
          icon={<TrendingUp className="text-success" />} 
          color="success"
        />
        <StatCard 
          title="Total Expenses" 
          amount={data?.summary.totalExpenses} 
          icon={<TrendingDown className="text-danger" />} 
          color="danger"
        />
        <StatCard 
          title="Net Balance" 
          amount={data?.summary.netBalance} 
          icon={<Wallet className="text-primary" />} 
          color="primary"
        />
      </div>

      {/* AI Insights Section */}
      {user?.role !== 'Viewer' && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-primary/20 p-2 rounded-lg"><TrendingUp size={20} className="text-primary" /></span>
            AI Financial Insights
          </h2>
          <div className="glass p-6 rounded-2xl border border-primary/20 bg-primary/5">
            {loadingInsights ? (
              <div className="flex items-center gap-3 text-white/60 animate-pulse">
                <Loader2 className="animate-spin" /> Analyzing your financial patterns...
              </div>
            ) : insights ? (
              <div className="prose prose-invert max-w-none prose-sm text-white/80 leading-relaxed">
                {insights.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            ) : (
              <p className="text-white/40 italic">Unable to generate insights at this time.</p>
            )}
          </div>
        </section>
      )}

      {/* Recent Transactions remain unchanged */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Activity</h2>
          {user?.role !== 'Viewer' && (
            <button className="bg-primary hover:bg-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
              <Plus size={18} /> Add Record
            </button>
          )}
        </div>
        
        {/* Table JSX code follows ... */}

        <div className="glass rounded-2xl overflow-hidden border border-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-white/50">Date</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-white/50">Category</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-white/50">Type</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-white/50 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.recentTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-white/40" />
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-primary/70" />
                      {tx.category}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${tx.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className={`p-4 text-sm font-bold text-right ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, amount, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass p-6 rounded-2xl border border-white/10 space-y-4"
  >
    <div className="flex justify-between items-start">
      <div className="p-3 bg-white/5 rounded-xl border border-white/5">{icon}</div>
      <p className="text-sm font-medium text-white/50">{title}</p>
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-bold">${amount?.toLocaleString()}</p>
    </div>
  </motion.div>
);

export default Dashboard;
