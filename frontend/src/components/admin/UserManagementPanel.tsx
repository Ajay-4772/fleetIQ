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
  RefreshCw,
  Sliders,
  Check,
  X,
  Building
} from 'lucide-react';
import { UserAdmin, CreateUserRequest, UserAuditLog } from '../../types';
import { api } from '../../services/api';

export const UserManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [accessRequests, setAccessRequests] = useState<UserAdmin[]>([]);
  const [auditLogs, setAuditLogs] = useState<UserAuditLog[]>([]);
  const [registrationPolicy, setRegistrationPolicy] = useState<string>('APPROVAL_REQUIRED');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'policy' | 'audit'>('users');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reject Modal state
  const [rejectingUser, setRejectingUser] = useState<UserAdmin | null>(null);
  const [rejectReason, setRejectReason] = useState('Administrative rejection');

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

  const loadAccessRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getAccessRequests();
      setAccessRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load pending access requests.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPolicy = async () => {
    try {
      const res = await api.getRegistrationPolicy();
      setRegistrationPolicy(res.policy || 'APPROVAL_REQUIRED');
    } catch {
      // keep current
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
    } else if (activeTab === 'requests') {
      loadAccessRequests();
    } else if (activeTab === 'policy') {
      loadPolicy();
    } else {
      loadAuditLogs();
    }
    // Also load requests count in background for badge
    api.getAccessRequests().then(setAccessRequests).catch(() => {});
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

  const handleApprove = async (user: UserAdmin, role: string) => {
    try {
      await api.approveAccessRequest(user.id, role);
      setSuccessMessage(`Approved "${user.fullName}" as ${role}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadAccessRequests();
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to approve user request.');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingUser) return;
    try {
      await api.rejectAccessRequest(rejectingUser.id, rejectReason);
      setSuccessMessage(`Rejected request for "${rejectingUser.fullName}".`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setRejectingUser(null);
      setRejectReason('Administrative rejection');
      loadAccessRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to reject user request.');
    }
  };

  const handleSavePolicy = async (newPolicy: string) => {
    try {
      const res = await api.updateRegistrationPolicy(newPolicy);
      setRegistrationPolicy(res.policy);
      setSuccessMessage(`Registration policy updated to ${res.policy}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update registration policy.');
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

  const activeAdminCount = users.filter((u) => u.role === 'ROLE_ADMIN' && u.enabled).length;

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
            Server-side Role-Based Access Control (RBAC), user approval workflows, and immutable security audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Pill Tabs */}
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
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'requests' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Access Requests</span>
              {accessRequests.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white">
                  {accessRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('policy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'policy' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Policy</span>
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
            onClick={() => {
              if (activeTab === 'users') loadUsers();
              else if (activeTab === 'requests') loadAccessRequests();
              else if (activeTab === 'policy') loadPolicy();
              else loadAuditLogs();
            }}
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

      {/* 1. USERS DIRECTORY TAB */}
      {activeTab === 'users' && (
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
                  <th className="py-3 px-5">Organization</th>
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
                  filteredUsers.map((u) => {
                    const isSoleAdmin = u.role === 'ROLE_ADMIN' && u.enabled && activeAdminCount <= 1;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-5">
                          <div>
                            <span className="font-bold text-slate-900 block">{u.fullName}</span>
                            <span className="text-[11px] font-mono text-slate-500">@{u.username} · {u.email}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 text-xs">
                          {u.organization || 'Vehryon Enterprise'}
                        </td>
                        <td className="py-3.5 px-5">
                          {isSoleAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200" title="Primary Administrator Protected">
                              <Shield className="w-3 h-3 text-purple-600" />
                              ROLE_ADMIN (Root)
                            </span>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                              <option value="ROLE_OPERATOR">ROLE_OPERATOR</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              u.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : u.status === 'REJECTED'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : u.enabled
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {u.status || (u.enabled ? 'ACTIVE' : 'DEACTIVATED')}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {isSoleAdmin ? (
                            <span className="text-[10px] font-semibold text-slate-400 italic">Protected</span>
                          ) : (
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
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ACCESS REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Pending Applicant Access Requests</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Public registration applicants awaiting administrator review and role authorization
              </p>
            </div>
            <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {accessRequests.length} Pending
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-5">Applicant</th>
                  <th className="py-3 px-5">Corporate Email</th>
                  <th className="py-3 px-5">Organization</th>
                  <th className="py-3 px-5">Requested Role</th>
                  <th className="py-3 px-5">Submitted At</th>
                  <th className="py-3 px-5 text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Loading access requests...
                    </td>
                  </tr>
                ) : accessRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700">No pending access requests.</p>
                        <p className="text-[11px] text-slate-400">All user registration applications have been processed.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  accessRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-5">
                        <div>
                          <span className="font-bold text-slate-900 block">{req.fullName}</span>
                          <span className="text-[11px] font-mono text-slate-500">@{req.username}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-600 text-[11px]">{req.email}</td>
                      <td className="py-3.5 px-5 text-slate-700 font-medium">{req.organization || '—'}</td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                          {req.requestedRole || req.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-[11px]">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req, 'ROLE_OPERATOR')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-2xs"
                          >
                            Approve (Operator)
                          </button>
                          <button
                            onClick={() => handleApprove(req, 'ROLE_ADMIN')}
                            className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-2xs"
                          >
                            Approve (Admin)
                          </button>
                          <button
                            onClick={() => setRejectingUser(req)}
                            className="px-2.5 py-1 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs transition"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. REGISTRATION POLICY TAB */}
      {activeTab === 'policy' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Platform Registration Governance Policy</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Control whether public signups are permitted and whether operator accounts require administrator review
            </p>
          </div>

          <div className="space-y-3">
            <label className={`block p-4 rounded-2xl border cursor-pointer transition ${
              registrationPolicy === 'APPROVAL_REQUIRED'
                ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="policy"
                  value="APPROVAL_REQUIRED"
                  checked={registrationPolicy === 'APPROVAL_REQUIRED'}
                  onChange={() => handleSavePolicy('APPROVAL_REQUIRED')}
                  className="mt-1"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    APPROVAL_REQUIRED (Recommended Default)
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    All new applicants are assigned a status of <code>PENDING_APPROVAL</code>. Login is strictly blocked until an administrator approves their role.
                  </p>
                </div>
              </div>
            </label>

            <label className={`block p-4 rounded-2xl border cursor-pointer transition ${
              registrationPolicy === 'AUTO_APPROVE_OPERATOR'
                ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="policy"
                  value="AUTO_APPROVE_OPERATOR"
                  checked={registrationPolicy === 'AUTO_APPROVE_OPERATOR'}
                  onChange={() => handleSavePolicy('AUTO_APPROVE_OPERATOR')}
                  className="mt-1"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    AUTO_APPROVE_OPERATOR
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Applicants requesting <code>OPERATOR</code> are activated immediately with session tokens. Any applicant requesting <code>ADMIN</code> is still held in <code>PENDING_APPROVAL</code>.
                  </p>
                </div>
              </div>
            </label>

            <label className={`block p-4 rounded-2xl border cursor-pointer transition ${
              registrationPolicy === 'DISABLED'
                ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600'
                : 'border-slate-200 hover:bg-slate-50'
            }`}>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="policy"
                  value="DISABLED"
                  checked={registrationPolicy === 'DISABLED'}
                  onChange={() => handleSavePolicy('DISABLED')}
                  className="mt-1"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    DISABLED (Closed Platform)
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                    Public signups are completely disabled. Only existing administrators can manually invite or provision new users.
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* 4. AUDIT TRAIL TAB */}
      {activeTab === 'audit' && (
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
                      No security audit events recorded.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-5 text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-5 font-bold text-slate-900">@{log.actorUsername}</td>
                      <td className="py-3 px-5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-slate-600">@{log.targetUsername}</td>
                      <td className="py-3 px-5 text-slate-400">{log.ipAddress || '—'}</td>
                      <td className="py-3 px-5 text-slate-700 max-w-xs truncate">{log.details || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">
              Reject Registration Request
            </h3>
            <p className="text-xs text-slate-500">
              Rejecting applicant <b>{rejectingUser.fullName}</b> ({rejectingUser.email}). Please provide a rejection reason for the audit trail:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
              placeholder="e.g. Unverified corporate domain, role unauthorized..."
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                <span>Provision New User Account</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="e.g. sconnor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Minimum 8 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="ROLE_OPERATOR">ROLE_OPERATOR</option>
                  <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
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
