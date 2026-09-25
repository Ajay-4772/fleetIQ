import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  History,
  Lock,
  Mail,
  UserCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { UserAdmin, CreateUserRequest, UserAuditLog } from '../../types';
import { api } from '../../services/api';

export const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Create User Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    username: '',
    password: '',
    fullName: '',
    email: '',
    role: 'ROLE_OPERATOR'
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load user directory.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAdminAuditLogs();
      setAuditLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load security audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadAuditLogs();
    }
  }, [activeTab]);

  const handleToggleStatus = async (user: UserAdmin) => {
    const newStatus = !user.enabled;
    try {
      await api.updateAdminUserStatus(user.id, newStatus);
      setSuccessMessage(`User "${user.username}" ${newStatus ? 'enabled' : 'disabled'} successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Status update failed.');
    }
  };

  const handleRoleChange = async (user: UserAdmin, newRole: string) => {
    try {
      await api.updateAdminUserRole(user.id, newRole);
      setSuccessMessage(`Role for "${user.username}" changed to ${newRole}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Role change failed.');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    setError(null);
    try {
      await api.createAdminUser({
        username: createForm.username,
        password: createForm.password || '',
        fullName: createForm.fullName,
        role: createForm.role
      });
      setIsCreateModalOpen(false);
      setCreateForm({
        username: '',
        password: '',
        fullName: '',
        email: '',
        role: 'ROLE_OPERATOR'
      });
      setSuccessMessage(`User "${createForm.username}" successfully created.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user.');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>Identity & Access Governance</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Server-side Role-Based Access Control (RBAC), user lifecycle, credentials, and immutable security audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'users' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Users Directory
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'audit' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Audit Trail</span>
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}

          <button
            onClick={() => (activeTab === 'users' ? loadUsers() : loadAuditLogs())}
            className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 transition shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold hover:bg-rose-100 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === 'users' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Table Header Filter */}
          <div className="p-4 border-b border-slate-200/70 flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username, name, or role..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              Total Users: <span className="text-slate-900 font-bold">{users.length}</span>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Security Role</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Created</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading users directory...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-5">
                        <div>
                          <span className="font-bold text-slate-900 block">{u.fullName}</span>
                          <span className="text-[11px] font-mono text-slate-500">@{u.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5 px-5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                          <option value="ROLE_OPERATOR">ROLE_OPERATOR</option>
                          <option value="ROLE_ANALYST">ROLE_ANALYST</option>
                          <option value="ROLE_VIEWER">ROLE_VIEWER</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            u.enabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.enabled ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVE
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              DISABLED
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                            u.enabled
                              ? 'bg-white hover:bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-white hover:bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}
                        >
                          {u.enabled ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/70 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Security Event Log</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Immutable append-only audit stream</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Actor</th>
                  <th className="py-3 px-5">Action Event</th>
                  <th className="py-3 px-5">Target</th>
                  <th className="py-3 px-5">IP Address</th>
                  <th className="py-3 px-5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No security audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-5 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3 px-5 font-bold text-slate-900">@{log.username}</td>
                      <td className="py-3 px-5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-slate-700">{log.targetEntity || 'SYSTEM'}</td>
                      <td className="py-3 px-5 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                      <td className="py-3 px-5 text-slate-600 truncate max-w-xs">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Create New Platform User</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="e.g. jdoe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="jdoe@fleetiq.internal"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Security Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-semibold"
                >
                  <option value="ROLE_ADMIN">ROLE_ADMIN — Full System Access & User Admin</option>
                  <option value="ROLE_OPERATOR">ROLE_OPERATOR — Operations, Actions & Telematics</option>
                  <option value="ROLE_ANALYST">ROLE_ANALYST — Intelligence, Analytics & Reports</option>
                  <option value="ROLE_VIEWER">ROLE_VIEWER — Read-Only Fleet Access</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-xs disabled:opacity-50"
                >
                  {isSubmittingCreate ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
