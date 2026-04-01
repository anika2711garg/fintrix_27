import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Loader2, Users as UsersIcon, ShieldCheck, Eye, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_ICONS = {
  Admin: <ShieldCheck size={14} className="text-violet-400" />,
  Analyst: <BarChart2 size={14} className="text-blue-400" />,
  Viewer: <Eye size={14} className="text-white/40" />,
};

const ROLE_COLORS = {
  Admin: 'bg-violet-500/10 text-violet-300 border border-violet-500/20',
  Analyst: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
  Viewer: 'bg-white/5 text-white/40 border border-white/10',
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
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-sm text-white/40 mt-0.5">{users.length} registered users</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-violet-400" />
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((u, i) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:bg-white/[0.05] transition-colors"
            >
              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-sm text-white/40">{u.email}</p>
                  <p className="text-xs text-white/20 mt-0.5">
                    Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Badge */}
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {u.status === 'Active' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {u.status}
                </span>

                {/* Role Badge */}
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                  {ROLE_ICONS[u.role]}
                  {u.role}
                </span>

                {/* Change Role */}
                <select
                  className="px-3 py-1.5 bg-[#09090b] border border-white/10 rounded-lg text-xs text-white/70 focus:outline-none focus:border-violet-500/50 cursor-pointer"
                  value={u.role}
                  disabled={updating === u._id}
                  onChange={(e) => handleUpdate(u._id, { role: e.target.value })}
                >
                  <option className="bg-[#09090b]" value="Viewer">Viewer</option>
                  <option className="bg-[#09090b]" value="Analyst">Analyst</option>
                  <option className="bg-[#09090b]" value="Admin">Admin</option>
                </select>

                {/* Toggle Status */}
                <button
                  disabled={updating === u._id}
                  onClick={() => handleUpdate(u._id, { status: u.status === 'Active' ? 'Inactive' : 'Active' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${u.status === 'Active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}`}
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
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <UsersIcon size={24} className="text-white/20" />
          </div>
          <p className="text-white/30 text-sm">No users found</p>
        </div>
      )}
    </div>
  );
};

export default Users;
