import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserPlus, ClipboardList,
  Brain, BarChart3, CreditCard, Settings, LogOut,
  Activity, Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navByRole = {
  clinician: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients',    icon: Users,            label: 'Patients' },
    { to: '/visits/new',  icon: Stethoscope,      label: 'New Visit' },
    { to: '/prediction',  icon: Brain,            label: 'CKD Prediction' },
    { to: '/reports',     icon: BarChart3,         label: 'Reports' },
  ],
  admin: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients',    icon: Users,            label: 'Patients' },
    { to: '/reports',     icon: BarChart3,         label: 'Reports' },
    { to: '/admin',       icon: Settings,         label: 'User Management' },
  ],
  records_officer: [
    { to: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patients',           icon: Users,            label: 'Patient Registry' },
    { to: '/patients/register',  icon: UserPlus,         label: 'Register Patient' },
  ],
  billing: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/billing',   icon: CreditCard,       label: 'Billing' },
    { to: '/reports',   icon: BarChart3,         label: 'Reports' },
  ],
};

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navByRole[currentUser?.role] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 min-h-screen bg-brand-950 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-brand-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">NephroTrack</p>
            <p className="text-brand-400 text-[10px] uppercase tracking-widest">Clinical System</p>
          </div>
        </div>
      </div>

      {/* User badge */}
      <div className="px-4 py-3 border-b border-brand-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{currentUser?.name}</p>
            <p className="text-brand-400 text-[11px] capitalize">{currentUser?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-brand-300 hover:bg-brand-800 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-400 hover:bg-brand-800 hover:text-white transition-colors duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
