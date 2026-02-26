import { useState } from 'react';
import { CreditCard, Search, Filter, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';

// TODO: Replace with → GET /api/billing/invoices
const invoices = [];

const statusBadge = {
  paid:    'badge-low',
  unpaid:  'badge-high',
  partial: 'badge-medium',
};
const statusIcon = {
  paid:    <CheckCircle className="w-3.5 h-3.5 inline mr-1" />,
  unpaid:  <AlertCircle className="w-3.5 h-3.5 inline mr-1" />,
  partial: <Clock       className="w-3.5 h-3.5 inline mr-1" />,
};

const fmt = (n) => `₦${n.toLocaleString()}`;

export default function Billing() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const totalRevenue  = invoices.reduce((a, i) => a + i.paid, 0);
  const totalPending  = invoices.reduce((a, i) => a + (i.amount - i.paid), 0);
  const paidCount     = invoices.filter(i => i.status === 'paid').length;
  const unpaidCount   = invoices.filter(i => i.status === 'unpaid').length;

  const filtered = invoices.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.patientName.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen">
      <Header title="Billing & Payments" subtitle="Invoice management and payment tracking" />
      <div className="p-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Revenue',    value: fmt(totalRevenue),  icon: TrendingUp, color: 'bg-green-100 text-green-700' },
            { label: 'Outstanding',      value: fmt(totalPending),  icon: AlertCircle, color: 'bg-red-100 text-red-700' },
            { label: 'Paid Invoices',    value: paidCount,          icon: CheckCircle, color: 'bg-brand-100 text-brand-700' },
            { label: 'Unpaid Invoices',  value: unpaidCount,        icon: Clock,       color: 'bg-amber-100 text-amber-700' },
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
                placeholder="Search patient or ID..."
                className="input-field pl-9 w-52" />
            </div>
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-36">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Invoice ID', 'Patient', 'Date', 'Items', 'Amount', 'Paid', 'Balance', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{inv.id}</td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{inv.patientName}</td>
                  <td className="px-5 py-3.5 text-slate-500">{inv.date}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {inv.items.map(item => (
                        <span key={item} className="badge-gray text-[10px]">{item}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{fmt(inv.amount)}</td>
                  <td className="px-5 py-3.5 text-green-700 font-medium">{fmt(inv.paid)}</td>
                  <td className="px-5 py-3.5 text-red-600 font-medium">{fmt(inv.amount - inv.paid)}</td>
                  <td className="px-5 py-3.5">
                    <span className={statusBadge[inv.status]}>
                      {statusIcon[inv.status]}{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {inv.status !== 'paid' && (
                      <button className="text-xs text-brand-600 hover:text-brand-700 font-medium">Record Payment</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>{filtered.length} invoices shown</span>
            <span>Total outstanding: <strong className="text-red-600">{fmt(totalPending)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
