import { useState } from 'react';
import { BarChart3, Download, Filter, AlertTriangle } from 'lucide-react';
import Header from '../components/layout/Header';

// TODO: Replace with → GET /api/reports/risk-summary
//                       GET /api/predictions?recent=true
//                       GET /api/reports/demographics
const patients    = [];
const predictions = [];

const riskBadge = { high: 'badge-high', medium: 'badge-medium', low: 'badge-low' };

const StatBar = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
    </div>
  </div>
);

export default function Reports() {
  const [riskFilter, setRiskFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  const high   = patients.filter(p => p.ckdRisk === 'high').length;
  const medium = patients.filter(p => p.ckdRisk === 'medium').length;
  const low    = patients.filter(p => p.ckdRisk === 'low').length;

  const stages = [...new Set(patients.map(p => p.ckdStage))];

  const filtered = patients.filter(p => {
    const mr = riskFilter  === 'all' || p.ckdRisk   === riskFilter;
    const ms = stageFilter === 'all' || p.ckdStage  === stageFilter;
    return mr && ms;
  });

  return (
    <div className="min-h-screen">
      <Header title="Clinical Reports" subtitle="Risk distribution, CKD staging summary, and high-risk patient list" />
      <div className="p-8 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Patients',   value: patients.length,       color: 'bg-brand-100 text-brand-800' },
            { label: 'High Risk',        value: high,                  color: 'bg-red-100 text-red-800' },
            { label: 'Medium Risk',      value: medium,                color: 'bg-amber-100 text-amber-800' },
            { label: 'Low Risk',         value: low,                   color: 'bg-green-100 text-green-800' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className={`text-4xl font-bold mt-1 ${s.color.split(' ')[1]}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Risk Distribution */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" /> Risk Distribution
            </h3>
            <div className="space-y-3">
              <StatBar label="High Risk"   value={high}   max={patients.length} color="bg-red-400" />
              <StatBar label="Medium Risk" value={medium} max={patients.length} color="bg-amber-400" />
              <StatBar label="Low Risk"    value={low}    max={patients.length} color="bg-green-400" />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              {stages.map(s => (
                <div key={s} className="flex justify-between text-xs">
                  <span className="text-slate-500">{s}</span>
                  <span className="font-medium text-slate-700">{patients.filter(p => p.ckdStage === s).length} patients</span>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction Summary */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Recent Predictions</h3>
            <div className="space-y-3">
              {predictions.map(pr => {
                const pt = patients.find(p => p.id === pr.patientId);
                return (
                  <div key={pr.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{pt?.firstName} {pt?.lastName}</p>
                      <p className="text-xs text-slate-400">{pr.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${pr.riskLevel === 'high' ? 'text-red-600' : 'text-amber-600'}`}>{pr.score}%</p>
                      <span className={riskBadge[pr.riskLevel]}>{pr.riskLevel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gender & Age breakdown */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Demographics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">By Gender</p>
                <StatBar label="Male"   value={patients.filter(p => p.gender === 'Male').length}   max={patients.length} color="bg-blue-400" />
                <div className="mt-2">
                  <StatBar label="Female" value={patients.filter(p => p.gender === 'Female').length} max={patients.length} color="bg-pink-400" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Avg Lab Values</p>
                {[
                  { label: 'Avg Creatinine', value: (patients.reduce((a, p) => a + p.labResults.creatinine, 0) / patients.length).toFixed(2), unit: 'mg/dL' },
                  { label: 'Avg eGFR',       value: (patients.reduce((a, p) => a + p.labResults.gfr, 0) / patients.length).toFixed(0),       unit: 'mL/min' },
                  { label: 'Avg BUN',        value: (patients.reduce((a, p) => a + p.labResults.bun, 0) / patients.length).toFixed(1),        unit: 'mg/dL' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-sm py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{r.label}</span>
                    <span className="font-semibold text-slate-800">{r.value} <span className="text-xs text-slate-400">{r.unit}</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* High Risk Patient List */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
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
              <button className="btn-secondary flex items-center gap-1.5 text-xs">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">CKD Stage</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Risk Level</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Creatinine</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">eGFR</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold flex-shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <span className="font-medium text-slate-800">{p.firstName} {p.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-700">{p.ckdStage}</td>
                  <td className="px-5 py-3"><span className={riskBadge[p.ckdRisk]}>{p.ckdRisk.charAt(0).toUpperCase() + p.ckdRisk.slice(1)}</span></td>
                  <td className="px-5 py-3 font-mono text-sm">{p.labResults.creatinine}</td>
                  <td className="px-5 py-3 font-mono text-sm">{p.labResults.gfr}</td>
                  <td className="px-5 py-3 text-slate-500">{p.lastVisit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            {filtered.length} of {patients.length} patients shown
          </div>
        </div>
      </div>
    </div>
  );
}
