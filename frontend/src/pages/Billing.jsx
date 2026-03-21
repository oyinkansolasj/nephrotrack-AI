import { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, TrendingUp, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const statusBadge = {
  paid:    'badge-low',
  pending: 'badge-medium',
  overdue: 'badge-high',
};
const statusIcon = {
  paid:    <CheckCircle className="w-3.5 h-3.5 inline mr-1" />,
  pending: <Clock       className="w-3.5 h-3.5 inline mr-1" />,
  overdue: <AlertCircle className="w-3.5 h-3.5 inline mr-1" />,
};

const fmt    = (n)   => `₦${Number(n).toLocaleString()}`;
const fmtDt  = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Billing() {
  const { getToken } = useAuth();

  const [invoices,      setInvoices]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('all');
  const [updating,      setUpdating]      = useState(null);   // invoice id being updated

  // ── Fetch invoices ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/billing`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => { if (!r.ok) throw new Error('Failed to load invoices'); return r.json(); })
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [getToken]);

  // ── Mark invoice as paid ───────────────────────────────────────────────────
  const markPaid = async (id) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API}/billing/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body:    JSON.stringify({ status: 'paid' }),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = await res.json();
      setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: updated.status } : inv));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRevenue = invoices.filter(i => i.status === 'paid')
    .reduce((a, i) => a + Number(i.amount), 0);
  const totalPending = invoices.filter(i => i.status !== 'paid')
    .reduce((a, i) => a + Number(i.amount), 0);
  const paidCount    = invoices.filter(i => i.status === 'paid').length;
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = invoices.filter(i => {
    const q           = search.toLowerCase();
    const patName     = `${i.first_name ?? ''} ${i.last_name ?? ''}`.toLowerCase();
    const matchSearch = !q || patName.includes(q) || i.id.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen">
      <Header title="Billing & Payments" subtitle="Invoice management and payment tracking" />
      <div className="p-8 space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',    value: fmt(totalRevenue), icon: TrendingUp,  color: 'bg-green-100 text-green-700' },
            { label: 'Outstanding',      value: fmt(totalPending), icon: AlertCircle, color: 'bg-red-100 text-red-700' },
            { label: 'Paid Invoices',    value: paidCount,         icon: CheckCircle, color: 'bg-brand-100 text-brand-700' },
            { label: 'Overdue Invoices', value: overdueCount,      icon: Clock,       color: 'bg-amber-100 text-amber-700' },
          ].map(s => (
            <div key={s.label} className="card p-5 flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Invoice table */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-brand-600" />
            <h3 className="font-semibold text-slate-800 flex-1">Invoices</h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search patient or description..."
                className="input-field pl-9 w-56" />
            </div>
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-36">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Patient', 'Description', 'Date', 'Due Date', 'Amount', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading invoices…
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">
                  {search || statusFilter !== 'all' ? 'No invoices match your filters' : 'No invoices yet'}
                </td></tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-medium text-slate-800">
                    {inv.first_name} {inv.last_name}
                    <p className="text-xs text-slate-400 font-normal">{inv.patient_id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-48">
                    <p className="truncate">{inv.description}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{fmtDt(inv.created_at)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{fmtDt(inv.due_date)}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{fmt(inv.amount)}</td>
                  <td className="px-5 py-3.5">
                    <span className={statusBadge[inv.status] ?? 'badge-gray'}>
                      {statusIcon[inv.status]}
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {inv.status !== 'paid' && (
                      <button
                        onClick={() => markPaid(inv.id)}
                        disabled={updating === inv.id}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50 flex items-center gap-1">
                        {updating === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>{filtered.length} invoice{filtered.length !== 1 ? 's' : ''} shown</span>
            <span>Total outstanding: <strong className="text-red-600">{fmt(totalPending)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
