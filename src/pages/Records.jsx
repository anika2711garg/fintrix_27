import React, { useState, useEffect, useCallback } from 'react';
import { recordService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import AddRecordModal from '../components/AddRecordModal';
import EditRecordModal from '../components/EditRecordModal';

const CATEGORIES = ['All', 'Salary', 'Freelance', 'Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'Entertainment', 'Education', 'Investment', 'Other'];

const Records = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [filters, setFilters] = useState({ type: '', category: '', search: '' });
  const [deleting, setDeleting] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filters.type) params.type = filters.type;
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.search) params.search = filters.search;

      const res = await recordService.getAll(params);
      setRecords(res.data.records || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setDeleting(id);
    try {
      await recordService.delete(id);
      fetchRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const canWrite = user?.role === 'Admin' || user?.role === 'Analyst';
  const canAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-6">
      <AddRecordModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSuccess={fetchRecords} />
      <EditRecordModal isOpen={!!editRecord} record={editRecord} onClose={() => setEditRecord(null)} onSuccess={fetchRecords} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Records</h1>
          <p className="text-sm text-white/40 mt-0.5">{total} total records</p>
        </div>
        {canWrite && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-sm font-semibold text-white transition-colors shadow-lg shadow-violet-500/20"
          >
            <Plus size={18} /> Add Record
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search description..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
            value={filters.search}
            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2.5 bg-[#0d0d10] border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-violet-500/50"
            value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          >
            <option className="bg-[#09090b]" value="">All Types</option>
            <option className="bg-[#09090b]" value="income">Income</option>
            <option className="bg-[#09090b]" value="expense">Expense</option>
          </select>
          <select
            className="px-3 py-2.5 bg-[#0d0d10] border border-white/10 rounded-xl text-sm text-white/70 focus:outline-none focus:border-violet-500/50"
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} className="bg-[#09090b]" value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-violet-400" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <FileText size={24} className="text-white/20" />
            </div>
            <p className="text-white/30 text-sm">No records found</p>
            {canWrite && (
              <button
                onClick={() => setAddOpen(true)}
                className="text-xs text-violet-400 hover:underline"
              >
                Add your first record
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10">
                  <tr>
                    {['Date', 'Category', 'Type', 'Amount', 'Description', ...(canAdmin ? ['Actions'] : [])].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((rec) => (
                    <motion.tr
                      key={rec._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-white/60">
                        {new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-white/80">{rec.category}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rec.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {rec.type}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 text-sm font-bold ${rec.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {rec.type === 'income' ? '+' : '-'}${rec.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white/40 max-w-[180px] truncate">
                        {rec.description || '—'}
                      </td>
                      {canAdmin && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditRecord(rec)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-violet-400 transition-colors"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(rec._id)}
                              disabled={deleting === rec._id}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                            >
                              {deleting === rec._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/10">
                <p className="text-xs text-white/30">Page {page} of {pages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white/50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-white/50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Records;
