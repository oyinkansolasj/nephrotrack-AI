import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Filter, ChevronRight } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

// TODO: Replace with → GET /api/patients
const patients = [];

const riskBadge = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

export default function PatientList() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  const canRegister = ['admin', 'records_officer'].includes(currentUser?.role);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.phone.includes(q);
    const matchRisk   = riskFilter === 'all' || p.ckdRisk === riskFilter;
    const matchGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchSearch && matchRisk && matchGender;
  });

  return (
    <div className="min-h-screen">
      <Header
        title="Patient Registry"
        subtitle={`${patients.length} patients registered`}
      />
      <div className="p-8">
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Gender / DOB</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">CKD Stage</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Visit</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-slate-400">No patients found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <span className="font-medium text-slate-800">{p.firstName} {p.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{p.id}</td>
                  <td className="px-5 py-3.5 text-slate-600">{p.gender} · {p.dob}</td>
                  <td className="px-5 py-3.5 text-slate-600">{p.phone}</td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{p.ckdStage}</td>
                  <td className="px-5 py-3.5"><span className={riskBadge[p.ckdRisk]}>{p.ckdRisk.charAt(0).toUpperCase() + p.ckdRisk.slice(1)}</span></td>
                  <td className="px-5 py-3.5 text-slate-500">{p.lastVisit}</td>
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
