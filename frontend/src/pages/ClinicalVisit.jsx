import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, CheckCircle, ArrowLeft, Brain } from 'lucide-react';
import Header from '../components/layout/Header';
import { patients } from '../data/mockData';

const initVitals = { bp_systolic: '', bp_diastolic: '', pulse: '', temperature: '', weight: '', height: '' };
const initLabs   = { creatinine: '', bun: '', glucose: '', potassium: '', hemoglobin: '', albumin: '', hba1c: '', gfr: '' };

export default function ClinicalVisit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [visitType, setVisitType] = useState('');
  const [vitals, setVitals] = useState(initVitals);
  const [labs, setLabs] = useState(initLabs);
  const [notes, setNotes] = useState('');
  const [runPrediction, setRunPrediction] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const patient = patients.find(p => p.id === selectedPatient);

  const handleAutoFill = (id) => {
    setSelectedPatient(id);
    const p = patients.find(pt => pt.id === id);
    if (p) {
      const [sys, dia] = p.vitals.bloodPressure.split('/');
      setVitals({ bp_systolic: sys, bp_diastolic: dia, pulse: p.vitals.pulse, temperature: p.vitals.temperature, weight: p.vitals.weight, height: p.vitals.height });
      setLabs({ creatinine: p.labResults.creatinine, bun: p.labResults.bun, glucose: p.labResults.glucose, potassium: p.labResults.potassium, hemoglobin: p.labResults.hemoglobin, albumin: p.labResults.albumin, hba1c: p.labResults.hba1c, gfr: p.labResults.gfr });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="min-h-screen">
      <Header title="Clinical Visit" />
      <div className="p-8 flex items-center justify-center">
        <div className="card p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-9 h-9 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Visit Recorded</h3>
          <p className="text-slate-500 text-sm mb-6">
            Clinical visit for <strong>{patient?.firstName} {patient?.lastName}</strong> has been saved successfully.
          </p>
          <div className="flex gap-3 justify-center">
            {runPrediction && (
              <button onClick={() => navigate('/prediction')} className="btn-primary flex items-center gap-2">
                <Brain className="w-4 h-4" /> Run Prediction
              </button>
            )}
            <button onClick={() => navigate('/patients')} className="btn-secondary">Patient List</button>
          </div>
        </div>
      </div>
    </div>
  );

  const InputField = ({ label, name, state, setState, unit, placeholder }) => (
    <div>
      <label className="label">{label} {unit && <span className="text-slate-400">({unit})</span>}</label>
      <input type="number" step="any" value={state[name]}
        onChange={e => setState(s => ({ ...s, [name]: e.target.value }))}
        className="input-field" placeholder={placeholder} />
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header title="New Clinical Visit" subtitle="Record patient visit, vitals, and lab results" />
      <div className="p-8 max-w-4xl">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-8">
          {['Patient & Visit Info', 'Vitals', 'Lab Results', 'Summary'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${step === i + 1 ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>{s}</span>
              {i < 3 && <div className="w-10 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="card p-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-brand-600" /> Patient & Visit Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Select Patient <span className="text-red-500">*</span></label>
                  <select value={selectedPatient} onChange={e => handleAutoFill(e.target.value)} className="input-field" required>
                    <option value="">-- Choose patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.id} – {p.firstName} {p.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Visit Type <span className="text-red-500">*</span></label>
                  <select value={visitType} onChange={e => setVisitType(e.target.value)} className="input-field" required>
                    <option value="">Select type</option>
                    {['Routine', 'Follow-up', 'Consultation', 'Emergency'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Visit Date</label>
                  <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="input-field" />
                </div>
                <div>
                  <label className="label">Attending Clinician</label>
                  <input type="text" defaultValue="Dr. Amara Nwosu" className="input-field" readOnly />
                </div>
              </div>
              {patient && (
                <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-sm text-brand-800">
                  Auto-filled data for <strong>{patient.firstName} {patient.lastName}</strong> ({patient.ckdStage}). You can update values below.
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Vital Signs</h3>
              <div className="grid grid-cols-3 gap-4">
                <InputField label="Systolic BP"   name="bp_systolic"   state={vitals} setState={setVitals} unit="mmHg" placeholder="e.g. 120" />
                <InputField label="Diastolic BP"  name="bp_diastolic"  state={vitals} setState={setVitals} unit="mmHg" placeholder="e.g. 80" />
                <InputField label="Pulse"         name="pulse"         state={vitals} setState={setVitals} unit="bpm"  placeholder="e.g. 72" />
                <InputField label="Temperature"   name="temperature"   state={vitals} setState={setVitals} unit="°C"   placeholder="e.g. 36.6" />
                <InputField label="Weight"        name="weight"        state={vitals} setState={setVitals} unit="kg"   placeholder="e.g. 70" />
                <InputField label="Height"        name="height"        state={vitals} setState={setVitals} unit="cm"   placeholder="e.g. 165" />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Laboratory Results</h3>
              <div className="grid grid-cols-4 gap-4">
                <InputField label="Serum Creatinine" name="creatinine" state={labs} setState={setLabs} unit="mg/dL" />
                <InputField label="BUN"              name="bun"        state={labs} setState={setLabs} unit="mg/dL" />
                <InputField label="Blood Glucose"    name="glucose"    state={labs} setState={setLabs} unit="mg/dL" />
                <InputField label="Potassium"        name="potassium"  state={labs} setState={setLabs} unit="mEq/L" />
                <InputField label="Hemoglobin"       name="hemoglobin" state={labs} setState={setLabs} unit="g/dL" />
                <InputField label="Albumin"          name="albumin"    state={labs} setState={setLabs} unit="g/dL" />
                <InputField label="HbA1c"            name="hba1c"      state={labs} setState={setLabs} unit="%" />
                <InputField label="eGFR"             name="gfr"        state={labs} setState={setLabs} unit="mL/min" />
              </div>
              <div>
                <label className="label">Clinical Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  className="input-field resize-none" placeholder="Document clinical observations, treatment changes, or instructions..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={runPrediction} onChange={e => setRunPrediction(e.target.checked)}
                  className="w-4 h-4 accent-brand-600" />
                <span className="text-sm text-slate-700">Run CKD prediction after saving this visit</span>
              </label>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Visit Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-slate-700 mb-3">Patient</p>
                  <p className="text-slate-600">{patient?.firstName} {patient?.lastName} · {patient?.id}</p>
                  <p className="text-slate-500 mt-1">Visit type: {visitType}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-semibold text-slate-700 mb-3">Key Vitals</p>
                  <p className="text-slate-600">BP: {vitals.bp_systolic}/{vitals.bp_diastolic} mmHg</p>
                  <p className="text-slate-500 mt-1">Pulse: {vitals.pulse} bpm · Temp: {vitals.temperature}°C</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 col-span-2">
                  <p className="font-semibold text-slate-700 mb-3">Lab Results</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(labs).map(([k, v]) => v && (
                      <p key={k} className="text-slate-600 text-xs"><span className="text-slate-400 capitalize">{k}:</span> {v}</p>
                    ))}
                  </div>
                </div>
                {notes && (
                  <div className="bg-slate-50 rounded-lg p-4 col-span-2">
                    <p className="font-semibold text-slate-700 mb-1">Notes</p>
                    <p className="text-slate-600 text-sm">{notes}</p>
                  </div>
                )}
              </div>
              {runPrediction && (
                <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-sm text-brand-800 flex items-center gap-2">
                  <Brain className="w-4 h-4" /> CKD prediction will run after this visit is saved.
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="btn-secondary disabled:opacity-40">
              ← Previous
            </button>
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && (!selectedPatient || !visitType)} className="btn-primary disabled:opacity-40">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Visit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
