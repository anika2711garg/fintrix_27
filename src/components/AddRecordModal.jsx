import React, { useState } from 'react';
import { recordService } from '../services/api';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Salary', 'Freelance', 'Food', 'Transport', 'Shopping', 'Utilities', 'Health', 'Entertainment', 'Education', 'Investment', 'Other'];

const AddRecordModal = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ amount: '', type: 'income', category: 'Salary', date: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await recordService.create({
        ...form,
        amount: parseFloat(form.amount),
        date: form.date || undefined,
      });
      onSuccess?.();
      onClose();
      setForm({ amount: '', type: 'income', category: 'Salary', date: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md panel-strong p-6 space-y-5 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Add Financial Record</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white text-muted">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="field"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">Type</label>
                  <select
                    className="field"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted">Category</label>
                <select
                  className="field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted">Date (optional)</label>
                <input
                  type="date"
                  className="field"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted">Description (optional)</label>
                <textarea
                  rows={2}
                  maxLength={200}
                  className="field resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..."
                />
              </div>

              {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary flex-1 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  {loading ? 'Saving...' : 'Add Record'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddRecordModal;
