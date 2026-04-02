import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Loader2, Users as UsersIcon, ShieldCheck, Eye, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_ICONS = {
  Admin: <ShieldCheck size={14} className="text-[#0b8f77]" />,
  Analyst: <BarChart2 size={14} className="text-[#1982c4]" />,
  Viewer: <Eye size={14} className="text-[#667870]" />,
};

const ROLE_COLORS = {
  Admin: 'bg-[#0b8f77]/10 text-[#0a6e5d] border border-[#0b8f77]/20',
  Analyst: 'bg-[#1982c4]/10 text-[#136394] border border-[#1982c4]/20',
  Viewer: 'bg-[#64766d]/10 text-[#52635b] border border-[#64766d]/20',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getAll();
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleUpdate = async (id, data) => {
    setUpdating(id);
    try {
      await userService.update(id, data);
      fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted mb-2">Admin</p>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-sm text-muted mt-0.5">{users.length} registered users</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin" color="#0b8f77" />
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 panel panel-lift hover:bg-white/90 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0b8f77, #f08a4b)' }}>
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{u.name}</p>
                  <p className="text-sm text-muted">{u.email}</p>
                  <p className="text-xs text-muted mt-0.5">
                    Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-emerald-500/12 text-emerald-700 border border-emerald-500/20' : 'bg-red-500/12 text-red-700 border border-red-500/20'}`}>
                  {u.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {u.status}
                </span>

                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                  {ROLE_ICONS[u.role]}
                  {u.role}
                </span>

                <select
                  className="field py-1.5 px-3 text-xs cursor-pointer"
                  value={u.role}
                  disabled={updating === u._id}
                  onChange={(e) => handleUpdate(u._id, { role: e.target.value })}
                >
                  <option value="Viewer">Viewer</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Admin">Admin</option>
                </select>

                <button
                  disabled={updating === u._id}
                  onClick={() => handleUpdate(u._id, { status: u.status === 'Active' ? 'Inactive' : 'Active' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${u.status === 'Active' ? 'bg-red-500/12 text-red-700 hover:bg-red-500/20 border border-red-500/20' : 'bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/20 border border-emerald-500/20'}`}
                >
                  {updating === u._id ? <Loader2 size={12} className="animate-spin inline" /> : u.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/80 border flex items-center justify-center" style={{ borderColor: 'var(--line)' }}>
            <UsersIcon size={24} className="text-muted" />
          </div>
          <p className="text-muted text-sm">No users found</p>
        </div>
      )}
    </div>
  );
};

export default Users;
