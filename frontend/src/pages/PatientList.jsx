import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Filter, ChevronRight, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

const riskBadge = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

// Format a DOB string (YYYY-MM-DDT...) → DD MMM YYYY
const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PatientList() {
  const navigate = useNavigate();
  const { currentUser, getToken } = useAuth();

  const [patients,     setPatients]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [riskFilter,   setRiskFilter]   = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const canRegister = ['admin', 'records_officer'].includes(currentUser?.role);

  // ── Fetch patients from backend ──────────────────────────────────────────
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/patients', {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) throw new Error('Failed to load patients');
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [getToken]);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q)  ||
      p.id.toLowerCase().includes(q)         ||
      (p.phone || '').includes(q);
    const matchRisk   = riskFilter   === 'all' || p.ckd_risk   === riskFilter;
    const matchGender = genderFilter === 'all' || p.gender     === genderFilter;
    return matchSearch && matchRisk && matchGender;
  });

  return (
    <div className="min-h-screen">
      <Header
        title="Patient Registry"
        subtitle={loading ? 'Loading…' : `${patients.length} patient${patients.length !== 1 ? 's' : ''} registered`}
      />
      <div className="p-8">

        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID or phone..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="input-field w-36">
              <option value="all">All Risk Levels</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="input-field w-32">
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          {canRegister && (
            <button onClick={() => navigate('/patients/register')} className="btn-primary flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Register Patient
            </button>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Patient</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gender</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date of Birth</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CKD Stage</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading patients…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-400">
                  {search || riskFilter !== 'all' || genderFilter !== 'all'
                    ? 'No patients match your filters'
                    : 'No patients registered yet'}
                </td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <span className="font-medium text-slate-800">{p.first_name} {p.last_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{p.id}</td>
                  <td className="px-5 py-3.5 text-slate-600">{p.gender}</td>
                  <td className="px-5 py-3.5 text-slate-600">{formatDate(p.dob)}</td>
                  <td className="px-5 py-3.5 text-slate-600">{p.phone_code} {p.phone}</td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{p.ckd_stage ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    {p.ckd_risk
                      ? <span className={riskBadge[p.ckd_risk]}>{p.ckd_risk.charAt(0).toUpperCase() + p.ckd_risk.slice(1)}</span>
                      : <span className="text-slate-400 text-xs">Pending</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(p.created_at)}</td>
                  <td className="px-5 py-3.5"><ChevronRight className="w-4 h-4 text-slate-400" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            Showing {filtered.length} of {patients.length} patients
          </div>
        </div>
      </div>
    </div>
  );
}
