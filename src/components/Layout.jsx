import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Users, LogOut, Menu, TrendingUp, ChevronRight, Sun, Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Analyst', 'Viewer'] },
  { path: '/records', label: 'Records', icon: FileText, roles: ['Admin', 'Analyst', 'Viewer'] },
  { path: '/users', label: 'Users', icon: Users, roles: ['Admin'] },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('fintrix-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fintrix-theme', theme);
  }, [theme]);

  const filtered = navItems.filter((item) => item.roles.includes(user?.role));
  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const navDefaultColor = isDark ? '#9fb4ab' : '#53675f';
  const navIconDefault = isDark ? '#86a096' : '#70857c';
  const sidebarBg = isDark ? 'rgba(20, 30, 25, 0.62)' : 'rgba(255,255,255,0.48)';
  const mobileHeaderBg = isDark ? 'rgba(20, 30, 25, 0.8)' : 'rgba(255,255,255,0.62)';
  const userCardBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.65)';
  const mobileDrawerBg = isDark ? 'rgba(14, 21, 18, 0.98)' : 'rgba(247, 248, 241, 0.98)';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-2))' }}>
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-base leading-tight">Fintrix</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted">Finance Atelier</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filtered.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group ${
                active
                  ? 'border'
                  : 'hover:bg-white/10'
              }`}
              style={active
                ? { borderColor: 'rgba(11, 143, 119, 0.24)', background: 'rgba(11, 143, 119, 0.12)', color: '#0b8f77' }
                : { color: navDefaultColor }}
            >
              <item.icon size={18} style={{ color: active ? '#0b8f77' : navIconDefault }} />
              {item.label}
              {active && <ChevronRight size={14} className="ml-auto text-[#0b8f77]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'var(--line)' }}>
        <button
          onClick={toggleTheme}
          className="w-full mb-3 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-semibold transition-colors hover:bg-white/60"
          style={{ borderColor: 'var(--line)' }}
          aria-label="Toggle color theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: userCardBg }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg, #0b8f77, #f08a4b)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-muted">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg hover:bg-white text-muted hover:text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden p-3 md:p-5" style={{ color: 'var(--ink)' }}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full blur-3xl" style={{ background: 'rgba(11, 143, 119, 0.18)' }} />
        <div className="absolute top-1/4 -right-24 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(240, 138, 75, 0.16)' }} />
      </div>
      <div className="app-shell flex h-full overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 border-r flex-shrink-0" style={{ borderColor: 'var(--line)', background: sidebarBg }}>
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/35 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 w-64 h-full border-r z-50 flex flex-col md:hidden"
              style={{ borderColor: 'var(--line)', background: mobileDrawerBg }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--line)', background: mobileHeaderBg }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/90 text-[#26453c]"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-2))' }}>
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-bold">Fintrix</span>
          </div>
          <button
            onClick={toggleTheme}
            className="ml-auto p-2 rounded-lg hover:bg-white/90"
            aria-label="Toggle color theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
      </div>
    </div>
  );
};

export default Layout;
