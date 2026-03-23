import { useState, useEffect } from 'react';
import { BarChart3, Download, Filter, AlertTriangle, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const fmt = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const riskBadge = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

const StatBar = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: max ? `${(value / max) * 100}%` : '0%' }} />
    </div>
  </div>
);

export default function Reports() {
  const { getToken } = useAuth();
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([
      fetch(`${API}/patients`, { headers }).then(r => r.json()),
      fetch(`${API}/visits`, { headers }).then(r => r.json()).catch(() => []),
    ])
      .then(([pats, vis]) => {
        setPatients(Array.isArray(pats) ? pats : []);
        setVisits(Array.isArray(vis) ? vis : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  // Derived stats
  const high = patients.filter(p => p.ckd_risk === 'high').length;
  const medium = patients.filter(p => p.ckd_risk === 'medium').length;
  const low = patients.filter(p => p.ckd_risk === 'low').length;
  const patientsWithStage = patients.filter(p => p.ckd_stage);
  const stages = [...new Set(patientsWithStage.map(p => p.ckd_stage))].sort();

  // Recent predictions = patients who have a ckd_stage, sorted by most recent
  const recentPredictions = patients
    .filter(p => p.ckd_stage)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  // Gender counts
  const maleCount = patients.filter(p => p.gender === 'Male').length;
  const femaleCount = patients.filter(p => p.gender === 'Female').length;

  // Latest visit per patient (for the table)
  const latestVisitMap = {};
  visits.forEach(v => {
    if (!latestVisitMap[v.patient_id] || new Date(v.visit_date) > new Date(latestVisitMap[v.patient_id].visit_date)) {
      latestVisitMap[v.patient_id] = v;
    }
  });

  // Filtered patients
  const filtered = patients.filter(p => {
    const mr = riskFilter === 'all' || p.ckd_risk === riskFilter;
    const ms = stageFilter === 'all' || p.ckd_stage === stageFilter;
    return mr && ms;
  });

  // Export CSV
  const exportCSV = () => {
    const headers = ['Patient ID', 'Name', 'Gender', 'CKD Stage', 'Risk Level', 'Last Visit'];
    const rows = filtered.map(p => {
      const lv = latestVisitMap[p.id];
      return [
        p.id,
        `${p.first_name} ${p.last_name}`,
        p.gender || '—',
        p.ckd_stage || '—',
        p.ckd_risk ? p.ckd_risk.charAt(0).toUpperCase() + p.ckd_risk.slice(1) : '—',
        lv ? fmt(lv.visit_date) : '—',
      ];
    });

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nephrotrack_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <Header title="Clinical Reports" subtitle="Risk distribution, CKD staging summary, and high-risk patient list" />
      <div className="p-8 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Patients', value: patients.length, color: 'text-brand-800' },
            { label: 'High Risk', value: high, color: 'text-red-800' },
            { label: 'Medium Risk', value: medium, color: 'text-amber-800' },
            { label: 'Low Risk', value: low, color: 'text-green-800' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-sm text-slate-500">{s.label}</p>
              {loading
                ? <div className="w-12 h-10 bg-slate-100 rounded animate-pulse mt-1 mx-auto" />
                : <p className={`text-4xl font-bold mt-1 ${s.color}`}>{s.value}</p>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Distribution */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" /> Risk Distribution
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <StatBar label="High Risk" value={high} max={patients.length} color="bg-red-400" />
                  <StatBar label="Medium Risk" value={medium} max={patients.length} color="bg-amber-400" />
                  <StatBar label="Low Risk" value={low} max={patients.length} color="bg-green-400" />
                </div>
                {stages.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">By CKD Stage</p>
                    {stages.map(s => (
                      <div key={s} className="flex justify-between text-xs">
                        <span className="text-slate-500">{s}</span>
                        <span className="font-medium text-slate-700">
                          {patients.filter(p => p.ckd_stage === s).length} patients
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Recent Predictions */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Predictions</h3>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : recentPredictions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10">No predictions yet</p>
            ) : (
              <div className="space-y-3">
                {recentPredictions.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-slate-400">{p.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{p.ckd_stage}</p>
                      {p.ckd_risk && (
                        <span className={riskBadge[p.ckd_risk]}>
                          {p.ckd_risk.charAt(0).toUpperCase() + p.ckd_risk.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Demographics */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Demographics</h3>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">By Gender</p>
                  <StatBar label="Male" value={maleCount} max={patients.length} color="bg-blue-400" />
                  <div className="mt-2">
                    <StatBar label="Female" value={femaleCount} max={patients.length} color="bg-pink-400" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Risk by Gender</p>
                  <div className="space-y-1.5">
                    {['Male', 'Female'].map(g => {
                      const gPats = patients.filter(p => p.gender === g);
                      const gHigh = gPats.filter(p => p.ckd_risk === 'high').length;
                      return (
                        <div key={g} className="flex justify-between text-xs">
                          <span className="text-slate-500">{g} High Risk</span>
                          <span className="font-medium text-red-600">{gHigh} of {gPats.length}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Prediction Coverage</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">With Prediction</span>
                    <span className="font-medium text-slate-700">{patientsWithStage.length} of {patients.length}</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-slate-500">Pending</span>
                    <span className="font-medium text-amber-600">{patients.length - patientsWithStage.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Patient Risk List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-slate-800">Patient Risk List</h3>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-400" />
              <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="input-field w-36">
                <option value="all">All Risks</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="input-field w-44">
                <option value="all">All Stages</option>
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={exportCSV} className="btn-secondary flex items-center gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">CKD Stage</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Risk Level</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Gender</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Last Visit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-400">
                        No patients match the selected filters
                      </td>
                    </tr>
                  ) : (
                    filtered.map(p => {
                      const lv = latestVisitMap[p.id];
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                                {p.first_name[0]}{p.last_name[0]}
                              </div>
                              <div>
                                <span className="font-medium text-slate-800">{p.first_name} {p.last_name}</span>
                                <p className="text-xs text-slate-400">{p.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-700">{p.ckd_stage || '—'}</td>
                          <td className="px-5 py-3">
                            {p.ckd_risk ? (
                              <span className={riskBadge[p.ckd_risk]}>
                                {p.ckd_risk.charAt(0).toUpperCase() + p.ckd_risk.slice(1)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-5 py-3 text-slate-600">{p.gender || '—'}</td>
                          <td className="px-5 py-3 text-slate-500">{lv ? fmt(lv.visit_date) : '—'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            {filtered.length} of {patients.length} patients shown
          </div>
        </div>
      </div>
    </div>
  );
}
