import { useState, useEffect } from 'react';
import { Settings, UserPlus, Search, Shield, CheckCircle, XCircle, Edit2, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

const API = API_BASE;

const roleBadge = {
  clinician:       'badge-info',
  admin:           'bg-brand-100 text-brand-800 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  records_officer: 'badge-gray',
};
const roleLabel = {
  clinician:       'Clinician',
  admin:           'Admin',
  records_officer: 'Records Officer',
};

const fmtDt = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Admin() {
  const { getToken } = useAuth();

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [showInvite,  setShowInvite]  = useState(false);
  const [inviteForm,  setInviteForm]  = useState({ name: '', email: '', password: '', role: '' });
  const [inviting,    setInviting]    = useState(false);
  const [inviteError, setInviteError] = useState('');

  // ── Fetch users ────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/users`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => { if (!r.ok) throw new Error('Failed to load users'); return r.json(); })
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [getToken]);

  // ── Create user ────────────────────────────────────────────────────────────
  const handleInvite = async () => {
    setInviting(true);
    setInviteError('');
    try {
      const res = await fetch(`${API}/users`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) { setInviteError(data.message || 'Failed to create user'); setInviting(false); return; }
      setUsers(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setShowInvite(false);
      setInviteForm({ name: '', email: '', password: '', role: '' });
    } catch {
      setInviteError('Could not reach the server.');
    }
    setInviting(false);
  };

  // ── Toggle active status ───────────────────────────────────────────────────
  const toggleActive = async (user) => {
    try {
      const res = await fetch(`${API}/users/${user.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ isActive: !user.is_active }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = users.filter(u => {
    const q           = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="min-h-screen">
      <Header title="User Management" subtitle="Manage system users, roles, and access permissions" />
      <div className="p-4 sm:p-8 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',   value: users.length,                                           color: 'text-brand-700' },
            { label: 'Active Users',  value: users.filter(u => u.is_active).length,                  color: 'text-green-700' },
            { label: 'Clinicians',    value: users.filter(u => u.role === 'clinician').length,        color: 'text-blue-700' },
            { label: 'Inactive',      value: users.filter(u => !u.is_active).length,                 color: 'text-red-700' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-4xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* RBAC Info */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-brand-600" />
            <h3 className="font-semibold text-slate-800">Role-Based Access Control (RBAC)</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {[
              { role: 'Admin',           perms: ['User management', 'All reports', 'System config', 'View all data'], color: 'border-brand-300 bg-brand-50' },
              { role: 'Clinician',       perms: ['Create visit', 'Run prediction', 'View patients', 'Clinical notes'], color: 'border-blue-300 bg-blue-50' },
              { role: 'Records Officer', perms: ['Register patient', 'Update demographics', 'View patient list'], color: 'border-slate-300 bg-slate-50' },
            ].map(r => (
              <div key={r.role} className={`rounded-lg border p-3 ${r.color}`}>
                <p className="font-semibold text-slate-800 mb-2">{r.role}</p>
                <ul className="space-y-1">
                  {r.perms.map(p => (
                    <li key={p} className="text-slate-600 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* User table */}
        <div className="card">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-shrink-0">
              <Settings className="w-4 h-4 text-brand-600" />
              <h3 className="font-semibold text-slate-800">System Users</h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users..." className="input-field pl-9 w-full sm:w-52" />
            </div>
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input-field w-full sm:w-44">
              <option value="all">All Roles</option>
              <option value="clinician">Clinician</option>
              <option value="admin">Admin</option>
              <option value="records_officer">Records Officer</option>
            </select>
            <button onClick={() => setShowInvite(true)} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Add User
            </button>
            </div>
          </div>

          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['User', 'Email', 'Role', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading users…
                </td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3.5"><span className={roleBadge[u.role]}>{roleLabel[u.role]}</span></td>
                  <td className="px-5 py-3.5">
                    <span className={u.is_active ? 'badge-low' : 'badge-high'}>
                      {u.is_active
                        ? <><CheckCircle className="w-3 h-3 inline mr-1" />Active</>
                        : <><XCircle    className="w-3 h-3 inline mr-1" />Inactive</>}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{fmtDt(u.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleActive(u)}
                      className="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-xs font-medium">
                      <Edit2 className="w-3.5 h-3.5" />
                      {u.is_active ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500">
            {filtered.length} of {users.length} users
          </div>
        </div>

        {/* Add User modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Add New User</h3>
              <p className="text-sm text-slate-500 mb-5">Create a new staff account in NephroTrack</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input value={inviteForm.name} onChange={e => setInviteForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field" placeholder="e.g. Dr. Amina Usman" />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))}
                    className="input-field" placeholder="user@nephrotrack.ng" />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" value={inviteForm.password} onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))}
                    className="input-field" placeholder="Min 6 characters" />
                </div>
                <div>
                  <label className="label">Assign Role</label>
                  <select value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value }))} className="input-field">
                    <option value="">Select role</option>
                    <option value="clinician">Clinician</option>
                    <option value="admin">Admin</option>
                    <option value="records_officer">Records Officer</option>
                  </select>
                </div>
                {inviteError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{inviteError}</div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleInvite} disabled={inviting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {inviting ? 'Creating…' : 'Create Account'}
                </button>
                <button onClick={() => { setShowInvite(false); setInviteError(''); }} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
