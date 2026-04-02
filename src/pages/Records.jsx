import React, { useState, useEffect, useCallback } from 'react';
import { recordService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import AddRecordModal from '../components/AddRecordModal';
import EditRecordModal from '../components/EditRecordModal';

const CATEGORIES = ['All', 'Salary', 'Freelance', 'Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'Entertainment', 'Education', 'Investment', 'Other'];

const listStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.03,
    },
  },
};

const rowReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

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
  const [compact, setCompact] = useState(false);

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
          <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">Records</p>
          <h1 className="text-3xl font-bold">Financial Records</h1>
          <p className="text-sm text-muted mt-0.5">{total} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompact((v) => !v)}
            className="btn-secondary text-sm"
          >
            {compact ? 'Comfort View' : 'Dense View'}
          </button>
          {canWrite && (
            <button
              onClick={() => setAddOpen(true)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={18} /> Add Record
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search description..."
            className="field pl-9"
            value={filters.search}
            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="field"
            value={filters.type}
            onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            className="field"
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="panel panel-lift overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin" color="#0b8f77" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/75 border flex items-center justify-center" style={{ borderColor: 'var(--line)' }}>
              <FileText size={24} className="text-muted" />
            </div>
            <p className="text-muted text-sm">No records found</p>
            {canWrite && (
              <button
                onClick={() => setAddOpen(true)}
                className="text-xs hover:underline"
                style={{ color: 'var(--brand)' }}
              >
                Add your first record
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b" style={{ borderColor: 'var(--line)' }}>
                  <tr>
                    {['Date', 'Category', 'Type', 'Amount', 'Description', ...(canAdmin ? ['Actions'] : [])].map((h) => (
                      <th key={h} className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'} text-xs font-semibold uppercase tracking-wider text-muted`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <motion.tbody
                  className="divide-y"
                  style={{ borderColor: 'rgba(15,45,35,0.08)' }}
                  variants={listStagger}
                  initial="hidden"
                  animate="visible"
                >
                  {records.map((rec) => (
                    <motion.tr key={rec._id} variants={rowReveal} className="hover:bg-white/70 transition-colors">
                      <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'} text-sm text-muted`}>
                        {new Date(rec.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'}`}>
                        <span className="text-sm font-medium">{rec.category}</span>
                      </td>
                      <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'}`}>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${rec.type === 'income' ? 'bg-emerald-500/12 text-emerald-700' : 'bg-red-500/12 text-red-700'}`}>
                          {rec.type}
                        </span>
                      </td>
                      <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'} text-sm font-bold ${rec.type === 'income' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {rec.type === 'income' ? '+' : '-'}${rec.amount.toLocaleString()}
                      </td>
                      <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'} text-sm text-muted max-w-[180px] truncate`}>
                        {rec.description || '—'}
                      </td>
                      {canAdmin && (
                        <td className={`${compact ? 'px-4 py-2.5' : 'px-5 py-3.5'}`}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditRecord(rec)}
                              className="p-1.5 rounded-lg hover:bg-white text-muted transition-colors"
                              style={{ color: '#45645b' }}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(rec._id)}
                              disabled={deleting === rec._id}
                              className="p-1.5 rounded-lg hover:bg-white transition-colors disabled:opacity-40"
                              style={{ color: '#7f5b5f' }}
                            >
                              {deleting === rec._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: 'var(--line)' }}>
                <p className="text-xs text-muted">Page {page} of {pages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border hover:bg-white text-muted disabled:opacity-30 transition-colors"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    className="p-1.5 rounded-lg border hover:bg-white text-muted disabled:opacity-30 transition-colors"
                    style={{ borderColor: 'var(--line)' }}
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
