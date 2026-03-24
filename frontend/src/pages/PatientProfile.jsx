import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, MapPin, Droplets,
  Activity, FlaskConical, Clock, Brain, Stethoscope, Loader2,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

const API = API_BASE;

const riskColor = {
  high:   { badge: 'badge-high',   bar: 'bg-red-500',   ring: 'ring-red-400 bg-red-50 text-red-700' },
  medium: { badge: 'badge-medium', bar: 'bg-amber-400',  ring: 'ring-amber-400 bg-amber-50 text-amber-700' },
  low:    { badge: 'badge-low',    bar: 'bg-green-500',  ring: 'ring-green-400 bg-green-50 text-green-700' },
};

const fmt = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const Lab = ({ label, value, unit, flag }) => (
  <div className="bg-slate-50 rounded-lg p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`text-lg font-bold mt-0.5 ${flag === 'high' ? 'text-red-600' : flag === 'low' ? 'text-amber-600' : 'text-slate-800'}`}>
      {value ?? '—'} <span className="text-xs font-normal text-slate-400">{unit}</span>
    </p>
  </div>
);

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getToken } = useAuth();

  const [patient,   setPatient]   = useState(null);
  const [visits,    setVisits]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const canRunPrediction = ['clinician', 'admin'].includes(currentUser?.role);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };

    const fetchAll = async () => {
      try {
        const [patRes, visRes] = await Promise.all([
          fetch(`${API}/patients/${id}`,         { headers }),
          fetch(`${API}/visits/patient/${id}`,   { headers }),
        ]);

        if (patRes.status === 404) { setError('not_found'); setLoading(false); return; }
        if (!patRes.ok) throw new Error('Failed to load patient');

        const [pat, vis] = await Promise.all([patRes.json(), visRes.json()]);
        setPatient(pat);
        setVisits(Array.isArray(vis) ? vis : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, getToken]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
    </div>
  );

  if (error === 'not_found' || !patient) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-semibold text-slate-700">Patient not found</p>
        <button onClick={() => navigate('/patients')} className="btn-primary mt-4">Back to Registry</button>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-semibold text-red-600">Error loading patient</p>
        <p className="text-slate-500 mt-1">{error}</p>
        <button onClick={() => navigate('/patients')} className="btn-secondary mt-4">Back to Registry</button>
      </div>
    </div>
  );

  const rc   = riskColor[patient.ckd_risk] ?? riskColor.low;
  const labs = patient.lastLabResults;

  const labFields = [
    { label: 'Serum Creatinine', key: 'creatinine', unit: 'mg/dL',  flag: labs?.creatinine > 1.2  ? 'high' : 'normal' },
    { label: 'eGFR',             key: 'gfr',        unit: 'mL/min', flag: labs?.gfr < 60           ? 'high' : 'normal' },
    { label: 'BUN',              key: 'bun',        unit: 'mg/dL',  flag: labs?.bun > 20            ? 'high' : 'normal' },
    { label: 'Blood Glucose',    key: 'glucose',    unit: 'mg/dL',  flag: labs?.glucose > 125       ? 'high' : 'normal' },
    { label: 'Potassium',        key: 'potassium',  unit: 'mEq/L',  flag: labs?.potassium > 5.0    ? 'high' : labs?.potassium < 3.5 ? 'low' : 'normal' },
    { label: 'Hemoglobin',       key: 'hemoglobin', unit: 'g/dL',   flag: labs?.hemoglobin < 12    ? 'low'  : 'normal' },
    { label: 'Albumin',          key: 'albumin',    unit: 'g/dL',   flag: labs?.albumin < 3.5      ? 'low'  : 'normal' },
    { label: 'HbA1c',            key: 'hba1c',      unit: '%',      flag: labs?.hba1c > 6.5        ? 'high' : 'normal' },
  ];

  const lastV = patient.lastVisit;

  return (
    <div className="min-h-screen">
      <Header title="Patient Profile" subtitle={`${patient.first_name} ${patient.last_name} · ${patient.id}`} />
      <div className="p-8 space-y-6">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Back to Patient Registry
        </button>

        <div className="grid grid-cols-3 gap-6">
          {/* ── Left column ── */}
          <div className="col-span-1 space-y-4">

            {/* Identity card */}
            <div className="card p-5">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl mb-3">
                  {patient.first_name[0]}{patient.last_name[0]}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{patient.first_name} {patient.last_name}</h2>
                <p className="text-slate-500 text-sm">{patient.id}</p>
                {patient.ckd_stage ? (
                  <span className={`mt-2 ring-1 px-3 py-0.5 rounded-full text-xs font-semibold ${rc.ring}`}>
                    {patient.ckd_stage}
                  </span>
                ) : (
                  <span className="mt-2 px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                    No prediction yet
                  </span>
                )}
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  { icon: User,     label: `${patient.gender} · DOB: ${fmt(patient.dob)}` },
                  { icon: Phone,    label: `${patient.phone_code} ${patient.phone}` },
                  { icon: MapPin,   label: patient.address || 'No address on file' },
                  { icon: Droplets, label: `Blood Group: ${patient.blood_group}` },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-start gap-2.5 text-slate-600">
                    <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medical history */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Medical History</h4>
              <div className="space-y-1.5 text-sm">
                {[
                  ['Hypertension',   patient.hypertension],
                  ['Diabetes',       patient.diabetes],
                  ['Allergies',      patient.allergies      || '—'],
                  ['Medications',    patient.current_medications || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <span className="text-slate-500 flex-shrink-0">{k}</span>
                    <span className={`font-medium text-right ${v === 'Yes' ? 'text-red-600' : 'text-slate-700'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest vitals (from most recent visit) */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-600" /> Latest Vitals
              </h4>
              {lastV ? (
                <div className="space-y-2 text-sm">
                  {[
                    ['Blood Pressure', lastV.bp_systolic && lastV.bp_diastolic ? `${lastV.bp_systolic}/${lastV.bp_diastolic}` : '—', 'mmHg'],
                    ['Pulse',          lastV.pulse,       'bpm'],
                    ['Temperature',    lastV.temperature, '°C'],
                    ['Weight',         lastV.weight,      'kg'],
                    ['Height',         lastV.height,      'cm'],
                  ].map(([k, v, u]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-medium text-slate-800">{v ?? '—'} <span className="text-slate-400 text-xs">{v ? u : ''}</span></span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No vitals recorded yet</p>
              )}
            </div>

            {canRunPrediction && (
              <button onClick={() => navigate('/prediction')} className="btn-primary w-full flex items-center justify-center gap-2">
                <Brain className="w-4 h-4" /> Run CKD Prediction
              </button>
            )}
          </div>

          {/* ── Right column ── */}
          <div className="col-span-2 space-y-6">

            {/* Lab Results */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-brand-600" /> Latest Lab Results
                {labs && <span className="text-xs text-slate-400 font-normal ml-auto">{fmt(labs.recorded_at)}</span>}
              </h4>
              {labs ? (
                <div className="grid grid-cols-4 gap-3">
                  {labFields.map(l => <Lab key={l.label} label={l.label} value={labs[l.key]} unit={l.unit} flag={l.flag} />)}
                </div>
              ) : (
                <p className="text-slate-400 text-sm text-center py-4">No lab results recorded yet</p>
              )}
            </div>

            {/* Visit Timeline */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-600" /> Visit Timeline
                </h4>
                {canRunPrediction && (
                  <button onClick={() => navigate('/visits/new')} className="btn-secondary text-xs flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" /> New Visit
                  </button>
                )}
              </div>
              {visits.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No visits recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {visits.map(v => (
                    <div key={v.id} className="flex gap-4 pb-3 border-b border-slate-100 last:border-0">
                      <div className="text-right min-w-24">
                        <p className="text-xs font-semibold text-slate-700">{fmt(v.visit_date)}</p>
                        <span className={`text-[11px] ${v.visit_type === 'Emergency' ? 'text-red-600' : 'text-slate-400'}`}>{v.visit_type}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-700">{v.clinician_name ?? 'Unknown clinician'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{v.notes || 'No notes'}</p>
                        {v.labResults && (
                          <p className="text-[11px] text-brand-600 mt-0.5">Lab results recorded</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prediction History */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-brand-600" /> Prediction History
              </h4>
              {!patient.lastPrediction ? (
                <p className="text-slate-400 text-sm text-center py-6">No predictions run yet</p>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{patient.lastPrediction.ckd_stage}</p>
                    <p className="text-xs text-slate-400">{fmt(patient.lastPrediction.created_at)} · {patient.lastPrediction.recommendation}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${patient.lastPrediction.risk_level === 'high' ? 'text-red-600' : patient.lastPrediction.risk_level === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>
                      {patient.lastPrediction.risk_score}%
                    </p>
                    <span className={riskColor[patient.lastPrediction.risk_level]?.badge}>{patient.lastPrediction.risk_level} risk</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
