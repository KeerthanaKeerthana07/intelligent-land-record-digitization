import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  RefreshCw, 
  Activity, 
  AlertCircle,
  FileCheck,
  Check,
  X
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';
import { auth } from '../services/auth';

export default function AdminPanel({ onNavigate, onSelectRecord }) {
  const currentUser = auth.getUser();
  const isAdmin = currentUser?.role === 'admin';

  // Tabs: 'pending' (Approvals queue), 'users' (User management), 'logs' (Activity audit)
  const [activeTab, setActiveTab] = useState('pending');

  // Pending queue
  const [pendingRecords, setPendingRecords] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);

  // Users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    role: 'officer',
    department: 'Taluk Revenue Office',
    password: ''
  });

  // Logs
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Action status
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchPendingRecords = async () => {
    try {
      setLoadingPending(true);
      const res = await api.getRecords({ status: 'Pending', limit: 20 });
      setPendingRecords(res.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await api.getAdminUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const data = await api.getAdminActivity(100);
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchPendingRecords();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

  const handleApprove = async (recordId) => {
    const note = prompt("Enter administrative approval notes:", "Verified against cadastral field survey.");
    if (note === null) return;
    try {
      setActionLoading(true);
      await api.approveRecord(recordId, note);
      setActionSuccess(`Record #${recordId} has been officially approved.`);
      fetchPendingRecords();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert("Approval failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (recordId) => {
    const reason = prompt("Enter official rejection reason:", "Survey boundary conflict detected during inspection.");
    if (reason === null) return;
    try {
      setActionLoading(true);
      await api.rejectRecord(recordId, reason);
      setActionSuccess(`Record #${recordId} has been marked as Rejected.`);
      fetchPendingRecords();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert("Rejection failed: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await api.createAdminUser(newUser);
      setShowAddUserModal(false);
      setNewUser({ email: '', full_name: '', role: 'officer', department: 'Taluk Revenue Office', password: '' });
      fetchUsers();
      setActionSuccess("New revenue officer created successfully!");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      alert("Failed to create user: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
              State Administrative Directorate
            </h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 uppercase">
              Admin Access
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manual title approvals, user permission controls, and system-wide activity audit logs.
          </p>
        </div>

        {/* Notice if logged in as Officer */}
        {!isAdmin && (
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Currently logged in as Officer. (Actions allowed in demo mode)</span>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-navy-900 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Pending Approvals Queue ({pendingRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-navy-900 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Officer &amp; User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-navy-900 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 text-blue-600" />
          <span>System Audit Activity Log</span>
        </button>
      </div>

      {/* Tab 1: Pending Approvals Queue */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Pending Verification Queue</h3>
              <p className="text-[11px] text-slate-500">Records awaiting official administrative determination</p>
            </div>
            <button
              onClick={fetchPendingRecords}
              className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-600"
              title="Refresh Queue"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loadingPending ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading pending records...</div>
          ) : pendingRecords.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Pending Records</p>
              <p className="text-[11px] text-slate-400">All uploaded land records have been verified or addressed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Record</th>
                    <th className="py-3 px-4">Owner Name</th>
                    <th className="py-3 px-4">Survey No</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Administrative Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {pendingRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-navy-900">#{rec.id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{rec.owner_name}</td>
                      <td className="py-3 px-4 font-mono font-medium">{rec.survey_number}</td>
                      <td className="py-3 px-4">{rec.village}, {rec.district}</td>
                      <td className="py-3 px-4">{rec.land_area} {rec.land_unit}</td>
                      <td className="py-3 px-4"><StatusBadge status={rec.status} size="sm" /></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectRecord(rec.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[11px] font-medium text-slate-700"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => handleApprove(rec.id)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-[11px] font-semibold"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(rec.id)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: User Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Authorized Personnel &amp; Revenue Officers</h3>
              <p className="text-[11px] text-slate-500">Government accounts with portal access</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New Officer</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-navy-900">#{u.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{u.full_name}</td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.department}</td>
                    <td className="py-3 px-4">
                      <span className="text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded text-[10px]">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System Audit Activity Log */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-navy-900">Immutable Audit Trail</h3>
              <p className="text-[11px] text-slate-500">Security and administrative activity logs stored in PostgreSQL</p>
            </div>
            <button
              onClick={fetchLogs}
              className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold sticky top-0">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-400 font-mono whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{log.user_email}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-navy-800 bg-navy-50 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 bg-navy-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Register Revenue Verification Officer</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="e.g. suresh@landrecords.gov.in"
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Portal Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  >
                    <option value="officer">Officer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  placeholder="e.g. Taluk Revenue Office"
                  className="w-full p-2 bg-slate-50 border rounded-lg focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-lg bg-navy-900 text-white font-semibold hover:bg-navy-800 disabled:opacity-50"
                >
                  {actionLoading ? 'Creating User...' : 'Create Officer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
