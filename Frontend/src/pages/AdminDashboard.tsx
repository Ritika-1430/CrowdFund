import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { adminApi, fundApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, BarChart3, Heart, DollarSign, Download, Search,
  Trash2, Edit3, Eye, ChevronLeft, ChevronRight, X, Check, AlertTriangle,
  TrendingUp, Activity, FileSpreadsheet, Settings, CheckCircle, XCircle,
  Clock, UserCheck, LayoutDashboard, Megaphone, IndianRupee, Filter
} from 'lucide-react';

type Tab = 'overview' | 'users' | 'campaigns' | 'donations' | 'settings';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="w-4.5 h-4.5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4.5 h-4.5" /> },
    { id: 'campaigns', label: 'Campaigns', icon: <Megaphone className="w-4.5 h-4.5" /> },
    { id: 'donations', label: 'Donations', icon: <Heart className="w-4.5 h-4.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4.5 h-4.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f4f1ec] flex">
      {/* Sidebar */}
      <aside className={`bg-[#0f1729] text-white flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'} min-h-screen sticky top-0`}>
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && <span className="font-bold text-sm tracking-tight">Admin Panel</span>}
        </div>
        <nav className="flex-1 py-3 px-2 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-600/20 text-teal-400 shadow-lg shadow-teal-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {!sidebarCollapsed && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="w-full flex items-center justify-center py-2 text-slate-500 hover:text-white transition rounded-lg hover:bg-white/5">
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="bg-white border-b border-[#e8e2d8] px-6 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-serif text-[#1a1a2e] font-bold">{tabs.find(t => t.id === activeTab)?.label}</h1>
            <p className="text-[11px] text-[#8b8477] mt-0.5">CrowdFund Administration Console</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#8b8477] bg-[#f4f1ec] px-3 py-1.5 rounded-lg border border-[#e8e2d8]">
              Logged in as <span className="font-bold text-[#1a1a2e]">{user.name}</span>
            </span>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && <OverviewTab key="overview" />}
            {activeTab === 'users' && <UsersTab key="users" />}
            {activeTab === 'campaigns' && <CampaignsTab key="campaigns" />}
            {activeTab === 'donations' && <DonationsTab key="donations" />}
            {activeTab === 'settings' && <SettingsTab key="settings" />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   HELPER: Download blob as file
   ══════════════════════════════════════════════════════ */
const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ══════════════════════════════════════════════════════
   HELPER: Confirmation Modal
   ══════════════════════════════════════════════════════ */
const ConfirmModal: React.FC<{ title: string; message: string; onConfirm: () => void; onCancel: () => void; loading?: boolean }> = ({ title, message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl border border-[#e8e2d8] p-6 max-w-sm w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
        <h3 className="font-serif text-lg font-bold text-[#1a1a2e]">{title}</h3>
      </div>
      <p className="text-[13px] text-[#8b8477] mb-6 leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-[#e8e2d8] text-[#1a1a2e] rounded-xl text-xs font-bold hover:bg-[#f4f1ec] transition">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5">
          {loading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          Delete
        </button>
      </div>
    </motion.div>
  </div>
);

/* ══════════════════════════════════════════════════════
   HELPER: Pagination
   ══════════════════════════════════════════════════════ */
const Pagination: React.FC<{ page: number; totalPages: number; onPageChange: (p: number) => void }> = ({ page, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-2 mt-6">
    <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="px-3 py-1.5 bg-white border border-[#e8e2d8] rounded-lg text-xs font-medium text-[#8b8477] hover:text-[#1a1a2e] disabled:opacity-30 transition"><ChevronLeft className="w-3.5 h-3.5" /></button>
    <span className="text-[12px] text-[#8b8477] px-3">Page <span className="font-bold text-[#1a1a2e]">{page}</span> of {totalPages || 1}</span>
    <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 bg-white border border-[#e8e2d8] rounded-lg text-xs font-medium text-[#8b8477] hover:text-[#1a1a2e] disabled:opacity-30 transition"><ChevronRight className="w-3.5 h-3.5" /></button>
  </div>
);

/* ══════════════════════════════════════════════════════
   TAB 1: OVERVIEW (ANALYTICS)
   ══════════════════════════════════════════════════════ */
const OverviewTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-7 h-7 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!stats) return <div className="text-center py-20 text-[#8b8477]">Failed to load stats</div>;

  const kpis = [
    { label: 'Total Users', value: stats.totalUsers, icon: <Users className="w-5 h-5" />, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Total Campaigns', value: stats.totalCampaigns, icon: <Megaphone className="w-5 h-5" />, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600' },
    { label: 'Total Donations', value: `₹${(stats.totalDonations || 0).toLocaleString('en-IN')}`, icon: <IndianRupee className="w-5 h-5" />, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Total Donors', value: stats.totalDonors, icon: <Heart className="w-5 h-5" />, color: 'from-rose-500 to-rose-600', bg: 'bg-rose-50', text: 'text-rose-600' },
  ];

  const maxChartAmount = Math.max(...(stats.monthlyChart || []).map((m: any) => m.amount), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-[#e8e2d8] p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center ${kpi.text}`}>{kpi.icon}</div>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[24px] font-bold text-[#1a1a2e] font-serif">{kpi.value}</p>
            <p className="text-[11px] text-[#8b8477] font-medium mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Donations Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e8e2d8] p-6 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-teal-500" /> Monthly Donations</h3>
          {stats.monthlyChart && stats.monthlyChart.length > 0 ? (
            <div className="flex items-end gap-2 h-[180px]">
              {stats.monthlyChart.map((m: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <span className="text-[9px] text-[#8b8477] mb-1 font-medium">₹{(m.amount / 1000).toFixed(0)}k</span>
                  <div
                    className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all hover:from-teal-600 hover:to-teal-500"
                    style={{ height: `${Math.max(8, (m.amount / maxChartAmount) * 100)}%` }}
                  />
                  <span className="text-[8px] text-[#8b8477] mt-1.5 font-medium">{m.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#8b8477] text-sm py-10">No donation data yet</p>
          )}
        </div>

        {/* Campaign Status Breakdown */}
        <div className="bg-white rounded-2xl border border-[#e8e2d8] p-6 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-violet-500" /> Campaign Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.statusBreakdown || {}).map(([status, count]: any) => {
              const colors: Record<string, string> = { Active: 'bg-emerald-500', Pending: 'bg-amber-500', Rejected: 'bg-red-400', Completed: 'bg-blue-500', Verified: 'bg-teal-500' };
              const total = Object.values(stats.statusBreakdown || {}).reduce((s: number, v: any) => s + v, 0) as number;
              return (
                <div key={status}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#8b8477] font-medium">{status}</span>
                    <span className="font-bold text-[#1a1a2e]">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-[#f4f1ec] rounded-full overflow-hidden">
                    <div className={`h-full ${colors[status] || 'bg-slate-400'} rounded-full transition-all`} style={{ width: `${total ? (count / total) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.statusBreakdown || {}).length === 0 && <p className="text-[12px] text-[#8b8477] text-center py-4">No campaigns yet</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-[#e8e2d8] p-6 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Top Categories by Donations</h3>
          <div className="space-y-3">
            {(stats.topCategories || []).map((cat: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-[#f4f1ec] rounded-lg flex items-center justify-center text-[10px] font-bold text-[#8b8477]">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1a1a2e] truncate">{cat.category}</p>
                  <p className="text-[10px] text-[#8b8477]">{cat.count} donations</p>
                </div>
                <span className="text-[12px] font-bold text-emerald-600">₹{cat.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
            {(stats.topCategories || []).length === 0 && <p className="text-[12px] text-[#8b8477] text-center py-4">No data yet</p>}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl border border-[#e8e2d8] p-6 shadow-sm">
          <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Recent Activity</h3>
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            {(stats.recentActivity || []).map((a: any, i: number) => (
              <div key={i} className="flex items-start gap-3 text-[12px]">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type === 'donation' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[#1a1a2e] leading-relaxed">{a.text}</p>
                  <p className="text-[10px] text-[#8b8477] mt-0.5">{new Date(a.time).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {(stats.recentActivity || []).length === 0 && <p className="text-[12px] text-[#8b8477] text-center py-4">No recent activity</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   TAB 2: USER MANAGEMENT
   ══════════════════════════════════════════════════════ */
const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.listUsers({ search: search || undefined, role: roleFilter || undefined, page, limit: 15 });
      setUsers(r.data.users);
      setTotalPages(r.data.totalPages);
    } catch { }
    finally { setLoading(false); }
  }, [search, roleFilter, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSaveUser = async () => {
    if (!editUser) return;
    setActionLoading(true);
    try {
      await adminApi.updateUser(editUser._id, {
        name: editUser.name,
        email: editUser.email,
        role: editUser.role,
        isVerified: editUser.isVerified,
        password: editUser.newPassword || undefined,
      });
      setEditUser(null);
      loadUsers();
    } catch { }
    finally { setActionLoading(false); }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminApi.deleteUser(deleteTarget._id);
      setDeleteTarget(null);
      loadUsers();
    } catch { }
    finally { setActionLoading(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await adminApi.exportUsers();
      downloadBlob(r.data, `CrowdFund_Users_${Date.now()}.xlsx`);
    } catch { }
    finally { setExporting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8b8477] absolute left-3 top-3" />
          <input type="text" placeholder="Search users by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] placeholder-[#8b8477]/50 focus:border-teal-400 focus:outline-none transition" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[12px] font-medium text-[#1a1a2e] focus:outline-none">
          <option value="">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={handleExport} disabled={exporting}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm">
          {exporting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-[#8b8477] text-sm">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#f9f7f3] border-b border-[#e8e2d8] text-[10px] font-bold text-[#8b8477] uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">User</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-center">Role</th>
                  <th className="py-3 px-4 text-center">Verified</th>
                  <th className="py-3 px-4 text-left">Joined</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f1ec]">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-[#faf9f6] transition">
                    <td className="py-3 px-4 font-semibold text-[#1a1a2e]">{u.name}</td>
                    <td className="py-3 px-4 text-[#8b8477]">{u.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-50 text-blue-600'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {u.isVerified ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-[#ccc] mx-auto" />}
                    </td>
                    <td className="py-3 px-4 text-[#8b8477]">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => setEditUser({ ...u, newPassword: '' })} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(u)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl border border-[#e8e2d8] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-lg font-bold text-[#1a1a2e]">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="p-1 rounded-lg hover:bg-[#f4f1ec] transition"><X className="w-4 h-4 text-[#8b8477]" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Name</label>
                <input type="text" value={editUser.name} onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] focus:border-teal-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Email</label>
                <input type="email" value={editUser.email} onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] focus:border-teal-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Role</label>
                  <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] focus:outline-none">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Verified</label>
                  <select value={editUser.isVerified ? 'yes' : 'no'} onChange={e => setEditUser({ ...editUser, isVerified: e.target.value === 'yes' })}
                    className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] focus:outline-none">
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">New Password <span className="text-[#8b8477] font-normal">(leave blank to keep current)</span></label>
                <input type="password" value={editUser.newPassword} onChange={e => setEditUser({ ...editUser, newPassword: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] focus:border-teal-400 focus:outline-none" placeholder="••••••" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 border border-[#e8e2d8] text-[#1a1a2e] rounded-xl text-xs font-bold hover:bg-[#f4f1ec] transition">Cancel</button>
              <button onClick={handleSaveUser} disabled={actionLoading} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                {actionLoading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${deleteTarget.name}" (${deleteTarget.email})? This will also delete all their campaigns and associated data. This action cannot be undone.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   TAB 3: CAMPAIGN MANAGEMENT
   ══════════════════════════════════════════════════════ */
const CampaignsTab: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editCampaign, setEditCampaign] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.listCampaigns({ search: search || undefined, status: statusFilter || undefined, page, limit: 15 });
      setCampaigns(r.data.campaigns);
      setTotalPages(r.data.totalPages);
    } catch { }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleQuickAction = async (id: string, status: string) => {
    setActionLoading(true);
    try {
      await fundApi.updateStatus(id, status);
      loadCampaigns();
    } catch { }
    finally { setActionLoading(false); }
  };

  const handleSaveCampaign = async () => {
    if (!editCampaign) return;
    setActionLoading(true);
    try {
      await adminApi.updateCampaign(editCampaign._id, {
        title: editCampaign.title,
        description: editCampaign.description,
        category: editCampaign.category,
        targetAmount: Number(editCampaign.targetAmount),
        status: editCampaign.status,
        emergency: editCampaign.emergency,
      });
      setEditCampaign(null);
      loadCampaigns();
    } catch { }
    finally { setActionLoading(false); }
  };

  const handleDeleteCampaign = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminApi.deleteCampaign(deleteTarget._id);
      setDeleteTarget(null);
      loadCampaigns();
    } catch { }
    finally { setActionLoading(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await adminApi.exportCampaigns();
      downloadBlob(r.data, `CrowdFund_Campaigns_${Date.now()}.xlsx`);
    } catch { }
    finally { setExporting(false); }
  };

  const categories = ['Orphanage & Child Welfare', 'Old Age Home Support', 'Medical & Healthcare', 'Disability & Physical Challenges', 'Women Health Care & Maternity Support', 'Disaster & Emergency Relief'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8b8477] absolute left-3 top-3" />
          <input type="text" placeholder="Search campaigns..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] placeholder-[#8b8477]/50 focus:border-teal-400 focus:outline-none transition" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[12px] font-medium text-[#1a1a2e] focus:outline-none">
          <option value="">All Status</option>
          {['Pending', 'Active', 'Verified', 'Completed', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={handleExport} disabled={exporting}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm">
          {exporting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center text-[#8b8477] text-sm">No campaigns found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#f9f7f3] border-b border-[#e8e2d8] text-[10px] font-bold text-[#8b8477] uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">Campaign</th>
                  <th className="py-3 px-4 text-left">Category</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Target</th>
                  <th className="py-3 px-4 text-right">Collected</th>
                  <th className="py-3 px-4 text-center">Creator</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f1ec]">
                {campaigns.map(c => {
                  const pct = c.targetAmount ? Math.round((c.amountCollected / c.targetAmount) * 100) : 0;
                  const statusColors: Record<string, string> = { Active: 'bg-emerald-100 text-emerald-700', Pending: 'bg-amber-100 text-amber-700', Rejected: 'bg-red-100 text-red-600', Completed: 'bg-blue-100 text-blue-700', Verified: 'bg-teal-100 text-teal-700' };
                  return (
                    <tr key={c._id} className="hover:bg-[#faf9f6] transition">
                      <td className="py-3 px-4 max-w-[200px]">
                        <p className="font-semibold text-[#1a1a2e] truncate">{c.title}</p>
                        {c.emergency && <span className="text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded mt-0.5 inline-block">URGENT</span>}
                      </td>
                      <td className="py-3 px-4 text-[#8b8477] max-w-[120px] truncate">{c.category}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColors[c.status] || 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-[#1a1a2e]">₹{c.targetAmount?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-medium text-emerald-600">₹{c.amountCollected?.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-[#8b8477] ml-1">({pct}%)</span>
                      </td>
                      <td className="py-3 px-4 text-center text-[#8b8477] truncate max-w-[100px]">{c.creatorId?.name || '—'}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => navigate(`/funds/${c._id}`)} className="p-1.5 bg-[#f4f1ec] text-[#8b8477] rounded-lg hover:bg-[#e8e2d8] transition" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setEditCampaign({ ...c })} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Edit"><Edit3 className="w-3.5 h-3.5" /></button>
                          {c.status === 'Pending' && (
                            <button onClick={() => handleQuickAction(c._id, 'Active')} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition" title="Approve"><CheckCircle className="w-3.5 h-3.5" /></button>
                          )}
                          <button onClick={() => setDeleteTarget(c)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Edit Campaign Modal */}
      {editCampaign && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-2xl border border-[#e8e2d8] p-6 max-w-lg w-full my-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-lg font-bold text-[#1a1a2e]">Edit Campaign</h3>
              <button onClick={() => setEditCampaign(null)} className="p-1 rounded-lg hover:bg-[#f4f1ec] transition"><X className="w-4 h-4 text-[#8b8477]" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Title</label>
                <input type="text" value={editCampaign.title} onChange={e => setEditCampaign({ ...editCampaign, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] focus:border-teal-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Description</label>
                <textarea value={editCampaign.description || ''} onChange={e => setEditCampaign({ ...editCampaign, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] focus:border-teal-400 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Category</label>
                  <select value={editCampaign.category} onChange={e => setEditCampaign({ ...editCampaign, category: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[12px] text-[#1a1a2e] focus:outline-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Status</label>
                  <select value={editCampaign.status} onChange={e => setEditCampaign({ ...editCampaign, status: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[12px] text-[#1a1a2e] focus:outline-none">
                    {['Pending', 'Active', 'Verified', 'Completed', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#1a1a2e] mb-1">Target Amount (₹)</label>
                  <input type="number" value={editCampaign.targetAmount} onChange={e => setEditCampaign({ ...editCampaign, targetAmount: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] focus:border-teal-400 focus:outline-none" />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editCampaign.emergency} onChange={e => setEditCampaign({ ...editCampaign, emergency: e.target.checked })}
                      className="w-4 h-4 rounded border-[#e8e2d8] accent-red-500" />
                    <span className="text-[12px] font-semibold text-red-500">Emergency / Urgent</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditCampaign(null)} className="flex-1 py-2.5 border border-[#e8e2d8] text-[#1a1a2e] rounded-xl text-xs font-bold hover:bg-[#f4f1ec] transition">Cancel</button>
              <button onClick={handleSaveCampaign} disabled={actionLoading} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition disabled:opacity-50 flex items-center justify-center gap-1.5">
                {actionLoading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Campaign"
          message={`Are you sure you want to delete "${deleteTarget.title}"? All associated donations will also be deleted. This action cannot be undone.`}
          onConfirm={handleDeleteCampaign}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   TAB 4: DONATION MANAGEMENT
   ══════════════════════════════════════════════════════ */
const DonationsTab: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.listDonations({ search: search || undefined, status: statusFilter || undefined, page, limit: 15 });
      setDonations(r.data.donations);
      setTotalPages(r.data.totalPages);
    } catch { }
    finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { loadDonations(); }, [loadDonations]);

  const handleDeleteDonation = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await adminApi.deleteDonation(deleteTarget._id);
      setDeleteTarget(null);
      loadDonations();
    } catch { }
    finally { setActionLoading(false); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const r = await adminApi.exportDonations();
      downloadBlob(r.data, `CrowdFund_Donations_${Date.now()}.xlsx`);
    } catch { }
    finally { setExporting(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#8b8477] absolute left-3 top-3" />
          <input type="text" placeholder="Search by donor name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[13px] text-[#1a1a2e] placeholder-[#8b8477]/50 focus:border-teal-400 focus:outline-none transition" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-[#f4f1ec] border border-[#e8e2d8] rounded-xl text-[12px] font-medium text-[#1a1a2e] focus:outline-none">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <button onClick={handleExport} disabled={exporting}
          className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-[12px] font-bold hover:bg-emerald-700 transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm">
          {exporting ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : donations.length === 0 ? (
          <div className="py-16 text-center text-[#8b8477] text-sm">No donations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#f9f7f3] border-b border-[#e8e2d8] text-[10px] font-bold text-[#8b8477] uppercase tracking-wider">
                  <th className="py-3 px-4 text-left">Donor</th>
                  <th className="py-3 px-4 text-left">Campaign</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Method</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f1ec]">
                {donations.map(d => {
                  const statusColors: Record<string, string> = { success: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', failed: 'bg-red-100 text-red-600' };
                  return (
                    <tr key={d._id} className="hover:bg-[#faf9f6] transition">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#1a1a2e]">{d.donorName || 'Anonymous'}</p>
                        <p className="text-[10px] text-[#8b8477]">{d.email || d.donorId?.email || '—'}</p>
                      </td>
                      <td className="py-3 px-4 text-[#8b8477] max-w-[150px] truncate">{d.fundId?.title || 'Deleted Campaign'}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">₹{d.amount?.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusColors[d.paymentStatus] || 'bg-gray-100 text-gray-600'}`}>{d.paymentStatus}</span>
                      </td>
                      <td className="py-3 px-4 text-center text-[#8b8477] text-[10px] max-w-[100px] truncate">
                        {d.matchingPartner?.includes('UPI') ? 'UPI' : d.matchingPartner?.includes('Card') ? 'Card' : d.matchingPartner?.includes('SecurePay') ? 'SecurePay' : 'Standard'}
                      </td>
                      <td className="py-3 px-4 text-[#8b8477]">{new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={() => setDeleteTarget(d)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {deleteTarget && (
        <ConfirmModal
          title="Delete Donation"
          message={`Are you sure you want to delete this ₹${deleteTarget.amount?.toLocaleString('en-IN')} donation from "${deleteTarget.donorName || 'Anonymous'}"? The campaign's collected amount will be adjusted accordingly.`}
          onConfirm={handleDeleteDonation}
          onCancel={() => setDeleteTarget(null)}
          loading={actionLoading}
        />
      )}
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════
   TAB 5: SETTINGS
   ══════════════════════════════════════════════════════ */
const SettingsTab: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    adminApi.getStats().then(r => setStats(r.data)).catch(console.error);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Platform Health */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] p-6 shadow-sm">
        <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-[#8b8477]" /> Platform Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#f4f1ec] p-4 rounded-xl border border-[#e8e2d8]">
            <p className="text-[11px] text-[#8b8477] font-medium">API Server</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Online (Port 4000)</p>
          </div>
          <div className="bg-[#f4f1ec] p-4 rounded-xl border border-[#e8e2d8]">
            <p className="text-[11px] text-[#8b8477] font-medium">Frontend Client</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> Online (Port 3000)</p>
          </div>
          <div className="bg-[#f4f1ec] p-4 rounded-xl border border-[#e8e2d8]">
            <p className="text-[11px] text-[#8b8477] font-medium">Database</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> MongoDB Connected</p>
          </div>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] p-6 shadow-sm">
        <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-violet-500" /> Platform Summary</h3>
        {stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-[#f4f1ec] rounded-xl border border-[#e8e2d8]">
              <p className="text-2xl font-serif font-bold text-[#1a1a2e]">{stats.totalUsers}</p>
              <p className="text-[10px] text-[#8b8477] font-medium">Users</p>
            </div>
            <div className="text-center p-3 bg-[#f4f1ec] rounded-xl border border-[#e8e2d8]">
              <p className="text-2xl font-serif font-bold text-[#1a1a2e]">{stats.totalCampaigns}</p>
              <p className="text-[10px] text-[#8b8477] font-medium">Campaigns</p>
            </div>
            <div className="text-center p-3 bg-[#f4f1ec] rounded-xl border border-[#e8e2d8]">
              <p className="text-2xl font-serif font-bold text-emerald-600">₹{(stats.totalDonations || 0).toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-[#8b8477] font-medium">Total Raised</p>
            </div>
            <div className="text-center p-3 bg-[#f4f1ec] rounded-xl border border-[#e8e2d8]">
              <p className="text-2xl font-serif font-bold text-[#1a1a2e]">{stats.totalDonors}</p>
              <p className="text-[10px] text-[#8b8477] font-medium">Donors</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8"><div className="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
        )}
      </div>

      {/* Admin Credentials Info */}
      <div className="bg-white rounded-2xl border border-[#e8e2d8] p-6 shadow-sm">
        <h3 className="text-[13px] font-bold text-[#1a1a2e] mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal-500" /> Security Information</h3>
        <div className="bg-[#f4f1ec] p-4 rounded-xl border border-[#e8e2d8] text-[12px] space-y-2">
          <div className="flex justify-between"><span className="text-[#8b8477]">Authentication</span><span className="font-semibold text-[#1a1a2e]">JWT Token (HS256)</span></div>
          <div className="flex justify-between"><span className="text-[#8b8477]">Password Hashing</span><span className="font-semibold text-[#1a1a2e]">bcrypt (10 rounds)</span></div>
          <div className="flex justify-between"><span className="text-[#8b8477]">Rate Limiting</span><span className="font-semibold text-[#1a1a2e]">300 req / 15 min</span></div>
          <div className="flex justify-between"><span className="text-[#8b8477]">Payment Signature</span><span className="font-semibold text-[#1a1a2e]">HMAC-SHA256</span></div>
          <div className="flex justify-between"><span className="text-[#8b8477]">API Protection</span><span className="font-semibold text-[#1a1a2e]">Helmet + CORS + Compression</span></div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
