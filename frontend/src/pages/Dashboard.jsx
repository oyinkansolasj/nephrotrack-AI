import { useNavigate } from 'react-router-dom';
import {
  Users, AlertTriangle, Calendar, Brain,
  TrendingUp, ClipboardList, ArrowRight, CheckCircle, Clock,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { dashboardStats, patients, appointments } from '../data/mockData';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="card p-5 flex items-start justify-between">
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

const riskColor = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };
const apptStatus = { confirmed: 'badge-low', pending: 'badge-medium' };

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const highRisk = patients.filter(p => p.ckdRisk === 'high');
  const todayAppts = appointments.slice(0, 4);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Role-specific stat cards
  const statsByRole = {
    clinician: [
      { label: 'Total Patients',       value: dashboardStats.totalPatients,         icon: Users,         color: 'bg-brand-100 text-brand-700',   sub: '+4 this week' },
      { label: 'High Risk Patients',   value: dashboardStats.highRiskCount,          icon: AlertTriangle, color: 'bg-red-100 text-red-700',       sub: 'Needs attention' },
      { label: "Today's Appointments", value: dashboardStats.todayAppointments,      icon: Calendar,      color: 'bg-blue-100 text-blue-700',     sub: '3 remaining' },
      { label: 'Predictions This Month', value: dashboardStats.predictionsThisMonth, icon: Brain,         color: 'bg-purple-100 text-purple-700', sub: 'Avg risk: 58%' },
    ],
    admin: [
      { label: 'Total Patients',       value: dashboardStats.totalPatients,          icon: Users,         color: 'bg-brand-100 text-brand-700',   sub: 'Registered' },
      { label: 'High Risk Patients',   value: dashboardStats.highRiskCount,          icon: AlertTriangle, color: 'bg-red-100 text-red-700',       sub: 'Active alerts' },
      { label: 'Predictions This Month', value: dashboardStats.predictionsThisMonth, icon: TrendingUp,    color: 'bg-purple-100 text-purple-700', sub: 'AI assessments' },
      { label: 'Pending Lab Reviews',  value: dashboardStats.pendingLabReviews,      icon: ClipboardList, color: 'bg-amber-100 text-amber-700',   sub: 'Awaiting review' },
    ],
    records_officer: [
      { label: 'Total Patients',       value: dashboardStats.totalPatients,          icon: Users,         color: 'bg-brand-100 text-brand-700',   sub: 'On record' },
      { label: "Today's Appointments", value: dashboardStats.todayAppointments,      icon: Calendar,      color: 'bg-blue-100 text-blue-700',     sub: 'Scheduled' },
      { label: 'Pending Lab Reviews',  value: dashboardStats.pendingLabReviews,      icon: ClipboardList, color: 'bg-amber-100 text-amber-700',   sub: 'Awaiting update' },
      { label: 'High Risk Patients',   value: dashboardStats.highRiskCount,          icon: AlertTriangle, color: 'bg-red-100 text-red-700',       sub: 'Flagged' },
    ],
    billing: [
      { label: 'Total Patients',       value: dashboardStats.totalPatients,          icon: Users,         color: 'bg-brand-100 text-brand-700',   sub: 'Active' },
      { label: "Today's Appointments", value: dashboardStats.todayAppointments,      icon: Calendar,      color: 'bg-blue-100 text-blue-700',     sub: 'Billable visits' },
      { label: 'Predictions This Month', value: dashboardStats.predictionsThisMonth, icon: Brain,         color: 'bg-purple-100 text-purple-700', sub: 'AI services' },
      { label: 'Pending Lab Reviews',  value: dashboardStats.pendingLabReviews,      icon: ClipboardList, color: 'bg-amber-100 text-amber-700',   sub: 'Unbilled items' },
    ],
  };

  const stats = statsByRole[currentUser?.role] || statsByRole.clinician;

  return (
    <div className="min-h-screen">
      <Header
        title={`${greeting()}, ${currentUser?.name?.split(' ')[0] ?? 'User'} 👋`}
        subtitle={`Here's what's happening today — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
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
            <div className="divide-y divide-slate-50">
              {highRisk.map(p => (
                <div key={p.id} onClick={() => navigate(`/patients/${p.id}`)}
                  className="px-6 py-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.firstName} {p.lastName}</p>
                      <p className="text-xs text-slate-400">{p.id} · Last visit: {p.lastVisit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{p.ckdStage}</span>
                    <span className={riskColor[p.ckdRisk]}>● High</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="card">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-slate-800">Today's Schedule</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {todayAppts.map(a => (
                <div key={a.id} className="px-5 py-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{a.patientName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-700">{a.time}</p>
                      <span className={`mt-1 ${apptStatus[a.status]}`}>
                        {a.status === 'confirmed' ? <CheckCircle className="w-3 h-3 inline mr-1" /> : <Clock className="w-3 h-3 inline mr-1" />}
                        {a.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Clinical Disclaimer:</strong> NephroTrack predictions are decision support tools only and must not replace professional medical diagnosis or clinical judgment.
          </p>
        </div>
      </div>
    </div>
  );
}
