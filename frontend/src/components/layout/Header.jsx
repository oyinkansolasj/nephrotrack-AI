import { useState, useRef, useEffect } from 'react';
import { Search, LogOut, ChevronDown, Menu, X, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { API_BASE } from '../../config/api';

export default function Header({ title, subtitle }) {
  const { currentUser, logout, getToken } = useAuth();
  const navigate = useNavigate();
  const { onMenuToggle } = useOutletContext() || {};
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced patient search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_BASE}/patients`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const patients = await res.json();
          const q = searchQuery.toLowerCase();
          const filtered = patients
            .filter(p =>
              `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
              String(p.id).includes(q) ||
              (p.phone && p.phone.includes(q))
            )
            .slice(0, 6);
          setSearchResults(filtered);
          setSearchOpen(true);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, getToken]);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const handleSelectPatient = (patient) => {
    setSearchQuery('');
    setSearchOpen(false);
    navigate(`/patients/${patient.id}`);
  };

  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const riskColor = { high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' };

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Hamburger menu - mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              className="pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-40 sm:w-56 bg-slate-50"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {searchOpen && (
            <div className="absolute right-0 sm:left-0 mt-1 w-72 sm:w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 max-h-80 overflow-y-auto">
              {searching ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">No patients found</div>
              ) : (
                searchResults.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-xs flex-shrink-0">
                      {p.first_name?.[0]}{p.last_name?.[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-slate-400">NT-{String(p.id).padStart(4, '0')} · {p.gender}</p>
                    </div>
                    {p.ckd_risk && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${riskColor[p.ckd_risk] || ''}`}>
                        {p.ckd_risk?.charAt(0).toUpperCase() + p.ckd_risk?.slice(1)}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 capitalize">{currentUser?.role?.replace('_', ' ')}</p>
                <p className="text-xs text-slate-400 mt-0.5">{currentUser?.email}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
