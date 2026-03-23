import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, AlertTriangle, Calendar, Brain,
  TrendingUp, ClipboardList, ArrowRight, CheckCircle, Clock, Loader2,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000/api';

const fmt = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

const todayStr = () => new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const StatCard = ({ label, value, icon: Icon, color, sub, loading }) => (
  <div className="card p-5 flex items-start justify-between">
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      {loading
        ? <div className="w-10 h-8 bg-slate-100 rounded animate-pulse mt-1" />
        : <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>}
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

const riskBadge = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

export default function Dashboard() {
  const { currentUser, getToken } = useAuth();
  const navigate = useNavigate();

  const [patients,     setPatients]     = useState([]);
  const [visits,       setVisits]       = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([
      fetch(`${API}/patients`, { headers }).then(r => r.json()),
      fetch(`${API}/visits`,   { headers }).then(r => r.json()).catch(() => []),
    ])
      .then(([pats, vis]) => {
        setPatients(Array.isArray(pats) ? pats : []);
        setVisits(Array.isArray(vis)   ? vis  : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [getToken]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalPatients        = patients.length;
  const highRiskList         = patients.filter(p => p.ckd_risk === 'high');
  const highRiskCount        = highRiskList.length;
  const predictionsThisMonth = patients.filter(p => p.ckd_stage).length;
  const pendingLabReviews    = patients.filter(p => !p.ckd_stage).length;

  // Avg risk score proxy: high=80, medium=50, low=20
  const riskMap = { high: 80, medium: 50, low: 20 };
  const patientsWithRisk     = patients.filter(p => p.ckd_risk);
  const avgRisk = patientsWithRisk.length
    ? Math.round(patientsWithRisk.reduce((s, p) => s + (riskMap[p.ckd_risk] || 0), 0) / patientsWithRisk.length)
    : 0;

  // Today's visits
  const todayVisits = visits.filter(v =>
    v.visit_date && v.visit_date.startsWith(todayStr())
  );
  const recentVisits = visits
    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date))
    .slice(0, 8);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // ── Role-specific stat cards ────────────────────────────────────────────────
  const statsByRole = {
    clinician: [
      { label: 'Total Patients',         value: totalPatients,        icon: Users,         color: 'bg-brand-100 text-brand-700',   sub: `${patients.filter(p=>p.ckd_stage).length} with prediction` },
      { label: 'High Risk Patients',     value: highRiskCount,        icon: AlertTriangle, color: 'bg-red-100 text-red-700',       sub: 'Needs attention' },
      { label: 'Visits Recorded',        value: visits.length,        icon: Calendar,      color: 'bg-blue-100 text-blue-700',     sub: 'All time' },
      { label: 'Predictions This Month', value: predictionsThisMonth, icon: Brain,         color: 'bg-purple-100 text-purple-700', sub: `Avg risk: ${avgRisk}%` },
    ],
    admin: [
      { label: 'Total Patients',         value: totalPatients,        icon: Users,         color: 'bg-brand-100 text-brand-700',   sub: 'Registered' },
      { label: 'High Risk Patients',     value: highRiskCount,        icon: AlertTriangle, color: 'bg-red-100 text-red-700',       sub: 'Active alerts' },
      { label: 'Predictions This Month', value: predictionsThisMonth, icon: TrendingUp,    color: 'bg-purple-100 text-purple-700', sub: 'AI assessments' },
      { label: 'Pending Predictions',    value: pendingLabReviews,    icon: ClipboardList, color: 'bg-amber-100 text-amber-700',   sub: 'No assessment yet' },
    ],
    records_officer: [
      { label: 'Total Patients',         value: totalPatients,        icon: Users,         color: 'bg-brand-100 text-brand-700',   sub: 'On record' },
      { label: 'Visits Recorded',        value: visits.length,        icon: Calendar,      color: 'bg-blue-100 text-blue-700',     sub: 'All time' },
      { label: 'Pending Predictions',    value: pendingLabReviews,    icon: ClipboardList, color: 'bg-amber-100 text-amber-700',   sub: 'No assessment yet' },
      { label: 'High Risk Patients',     value: highRiskCount,        icon: AlertTriangle, color: 'bg-red-100 text-red-700',       sub: 'Flagged' },
    ],
  };

  const roleStats = statsByRole[currentUser?.role] || statsByRole.clinician;

  // Schedule panel: prefer today's visits, fall back to recent visits
  const scheduleItems = todayVisits.length ? todayVisits : recentVisits;
  const scheduleLabel = todayVisits.length ? "Today's Schedule" : 'Recent Visits';

  return (
    <div className="min-h-screen">
      <Header
        title={`${greeting()}, ${currentUser?.name?.split(' ')[0] ?? 'User'} 👋`}
        subtitle={`Here's what's happening today, ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {roleStats.map(s => <StatCard key={s.label} {...s} loading={loading} />)}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* High Risk Patients */}
          <div className="col-span-2 card">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="font-semibold text-slate-800">High Risk Patients</h3>
              </div>
              <button onClick={() => navigate('/patients')}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
              </div>
            ) : highRiskList.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-400 text-sm">
                No high-risk patients at this time
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {highRiskList.slice(0, 10).map(p => (
                  <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)}
                    className="px-6 py-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                        {p.first_name[0]}{p.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-slate-400">{p.id} · Registered {fmt(p.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{p.ckd_stage ?? '—'}</span>
                      <span className={riskBadge[p.ckd_risk]}>● High</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule / Recent Visits */}
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-slate-800">{scheduleLabel}</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : scheduleItems.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-400 text-sm">
                No visits recorded yet
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {scheduleItems.map(v => (
                  <div key={v.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {v.first_name} {v.last_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{v.visit_type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-700">{fmt(v.visit_date)}</p>
                        <span className="badge-low mt-1 inline-flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" /> Completed
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Disclaimer:</strong> NephroTrack predictions is a decision support tool only and must not replace professional medical diagnosis or clinical judgment.
          </p>
        </div>
      </div>
    </div>
  );
}
