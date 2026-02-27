import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, MapPin, Droplets,
  Activity, FlaskConical, Clock, Brain, Stethoscope,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';

// TODO: Replace with → GET /api/patients/:id
//                       GET /api/patients/:id/visits
//                       GET /api/patients/:id/predictions
const patients    = [];
const visits      = [];
const predictions = [];

const riskColor = {
  high:   { badge: 'badge-high',   bar: 'bg-red-500',   ring: 'ring-red-400 bg-red-50 text-red-700' },
  medium: { badge: 'badge-medium', bar: 'bg-amber-400',  ring: 'ring-amber-400 bg-amber-50 text-amber-700' },
  low:    { badge: 'badge-low',    bar: 'bg-green-500',  ring: 'ring-green-400 bg-green-50 text-green-700' },
};

const Lab = ({ label, value, unit, flag }) => (
  <div className="bg-slate-50 rounded-lg p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className={`text-lg font-bold mt-0.5 ${flag === 'high' ? 'text-red-600' : flag === 'low' ? 'text-amber-600' : 'text-slate-800'}`}>
      {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
    </p>
  </div>
);

export default function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const patient = patients.find(p => p.id === id);

  if (!patient) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-semibold text-slate-700">Patient not found</p>
        <button onClick={() => navigate('/patients')} className="btn-primary mt-4">Back to list</button>
      </div>
    </div>
  );

  const patientVisits = visits.filter(v => v.patientId === id);
  const patientPreds  = predictions.filter(p => p.patientId === id);
  const rc = riskColor[patient.ckdRisk];
  const canRunPrediction = ['clinician', 'admin'].includes(currentUser?.role);

  const labs = [
    { label: 'Serum Creatinine', value: patient.labResults.creatinine, unit: 'mg/dL', flag: patient.labResults.creatinine > 1.2 ? 'high' : 'normal' },
    { label: 'eGFR',             value: patient.labResults.gfr,        unit: 'mL/min', flag: patient.labResults.gfr < 60 ? 'high' : 'normal' },
    { label: 'BUN',              value: patient.labResults.bun,        unit: 'mg/dL',  flag: patient.labResults.bun > 20 ? 'high' : 'normal' },
    { label: 'Blood Glucose',    value: patient.labResults.glucose,    unit: 'mg/dL',  flag: patient.labResults.glucose > 125 ? 'high' : 'normal' },
    { label: 'Potassium',        value: patient.labResults.potassium,  unit: 'mEq/L',  flag: patient.labResults.potassium > 5.0 ? 'high' : patient.labResults.potassium < 3.5 ? 'low' : 'normal' },
    { label: 'Hemoglobin',       value: patient.labResults.hemoglobin, unit: 'g/dL',   flag: patient.labResults.hemoglobin < 12 ? 'low' : 'normal' },
    { label: 'Albumin',          value: patient.labResults.albumin,    unit: 'g/dL',   flag: patient.labResults.albumin < 3.5 ? 'low' : 'normal' },
    { label: 'HbA1c',            value: patient.labResults.hba1c,      unit: '%',      flag: patient.labResults.hba1c > 6.5 ? 'high' : 'normal' },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Patient Profile" subtitle={`${patient.firstName} ${patient.lastName} · ${patient.id}`} />
      <div className="p-8 space-y-6">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Back to Patient Registry
        </button>

        <div className="grid grid-cols-3 gap-6">
          {/* Left column */}
          <div className="col-span-1 space-y-4">
            {/* Identity card */}
            <div className="card p-5">
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl mb-3">
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{patient.firstName} {patient.lastName}</h2>
                <p className="text-slate-500 text-sm">{patient.id}</p>
                <span className={`mt-2 ring-1 px-3 py-0.5 rounded-full text-xs font-semibold ${rc.ring}`}>
                  {patient.ckdStage}
                </span>
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  { icon: User,    label: `${patient.gender} · DOB: ${patient.dob}` },
                  { icon: Phone,   label: patient.phone },
                  { icon: MapPin,  label: patient.address },
                  { icon: Droplets, label: `Blood Group: ${patient.bloodGroup}` },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-start gap-2.5 text-slate-600">
                    <Icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Vitals */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-600" /> Latest Vitals
              </h4>
              <div className="space-y-2 text-sm">
                {[
                  ['Blood Pressure', patient.vitals.bloodPressure, 'mmHg'],
                  ['Pulse', patient.vitals.pulse, 'bpm'],
                  ['Temperature', patient.vitals.temperature, '°C'],
                  ['Weight', patient.vitals.weight, 'kg'],
                  ['Height', patient.vitals.height, 'cm'],
                ].map(([k, v, u]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-medium text-slate-800">{v} <span className="text-slate-400 text-xs">{u}</span></span>
                  </div>
                ))}
              </div>
            </div>

            {canRunPrediction && (
              <button onClick={() => navigate('/prediction')} className="btn-primary w-full flex items-center justify-center gap-2">
                <Brain className="w-4 h-4" /> Run CKD Prediction
              </button>
            )}
          </div>

          {/* Right column */}
          <div className="col-span-2 space-y-6">
            {/* Lab Results */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-brand-600" /> Lab Results
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {labs.map(l => <Lab key={l.label} {...l} />)}
              </div>
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
              {patientVisits.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No visits recorded yet</p>
              ) : (
                <div className="space-y-3">
                  {patientVisits.map(v => (
                    <div key={v.id} className="flex gap-4 pb-3 border-b border-slate-100 last:border-0">
                      <div className="text-right min-w-24">
                        <p className="text-xs font-semibold text-slate-700">{v.date}</p>
                        <span className={`text-[11px] ${v.type === 'Emergency' ? 'text-red-600' : 'text-slate-400'}`}>{v.type}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-slate-700">{v.clinician}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{v.notes}</p>
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
              {patientPreds.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-6">No predictions run yet</p>
              ) : (
                <div className="space-y-2">
                  {patientPreds.map(pr => (
                    <div key={pr.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{pr.stage}</p>
                        <p className="text-xs text-slate-400">{pr.date} · Model {pr.modelVersion}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${pr.riskLevel === 'high' ? 'text-red-600' : pr.riskLevel === 'medium' ? 'text-amber-600' : 'text-green-600'}`}>
                          {pr.score}%
                        </p>
                        <span className={riskColor[pr.riskLevel].badge}>{pr.riskLevel} risk</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
