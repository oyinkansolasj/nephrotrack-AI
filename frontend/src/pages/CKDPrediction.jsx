import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle, Info, Loader, Loader2, RotateCcw, FileDown } from 'lucide-react';
import Header from '../components/layout/Header';
import { predictionFeatures } from '../config/predictionConfig';
import { useAuth } from '../context/AuthContext';

const API    = 'http://localhost:5000/api';
const ML_API = 'http://localhost:8000';        // FastAPI ML service

export default function CKDPrediction() {
  const { getToken } = useAuth();

  const [patients,        setPatients]        = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [formValues,      setFormValues]      = useState({});
  const [selectedPatient, setSelectedPatient] = useState('');
  const [isProcessing,    setIsProcessing]    = useState(false);
  const [result,          setResult]          = useState(null);
  const [saving,          setSaving]          = useState(false);
  const [saved,           setSaved]           = useState(false);

  // ── Load patient list for dropdown ─────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/patients`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => setPatients(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setPatientsLoading(false));
  }, [getToken]);

  // ── Auto-fill form when a patient is selected ───────────────────────────────
  const handlePatientSelect = async (e) => {
    const id = e.target.value;
    setSelectedPatient(id);
    setResult(null);
    setSaved(false);
    if (!id) { setFormValues({}); return; }

    try {
      const res = await fetch(`${API}/patients/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const p = await res.json();
      const labs = p.lastLabResults || {};
      const lastV = p.lastVisit    || {};

      // Calculate age from date of birth
      const age = p.dob
        ? Math.floor((Date.now() - new Date(p.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : '';

      setFormValues({
        'Age':                          age || '',
        'Blood Pressure (Systolic)':    lastV.bp_systolic  || '',
        'Blood Pressure (Diastolic)':   lastV.bp_diastolic || '',
        'Blood Glucose':                labs.glucose       || '',
        'Blood Urea (BUN)':             labs.bun           || '',
        'Serum Creatinine':             labs.creatinine    || '',
        'Potassium':                    labs.potassium     || '',
        'Hemoglobin':                   labs.hemoglobin    || '',
        'Albumin':                      labs.albumin       || '',
        'eGFR':                         labs.gfr           || '',
        'Hypertension':                 p.hypertension === 'Yes' ? 'Yes' : (p.hypertension === 'No' ? 'No' : ''),
        'Diabetes Mellitus':            p.diabetes === 'Yes' ? 'Yes' : (p.diabetes === 'No' ? 'No' : ''),
      });
    } catch {
      setFormValues({});
    }
  };

  const handleChange = (name, value) => {
    setFormValues(f => ({ ...f, [name]: value }));
    setResult(null);
    setSaved(false);
  };

  // ── Call the real ML prediction API ─────────────────────────────────────────
  const runPrediction = async () => {
    setIsProcessing(true);
    setSaved(false);

    try {
      const missing = predictionFeatures.filter(f => !formValues[f.name] && formValues[f.name] !== 0);

      // Send form values to ML backend
      const mlRes = await fetch(`${ML_API}/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age:              parseFloat(formValues['Age'])                         || null,
          blood_pressure:   parseFloat(formValues['Blood Pressure (Systolic)'])  || null,
          blood_glucose:    parseFloat(formValues['Blood Glucose'])               || null,
          blood_urea:       parseFloat(formValues['Blood Urea (BUN)'])            || null,
          serum_creatinine: parseFloat(formValues['Serum Creatinine'])            || null,
          potassium:        parseFloat(formValues['Potassium'])                   || null,
          hemoglobin:       parseFloat(formValues['Hemoglobin'])                  || null,
          albumin:          parseFloat(formValues['Albumin'])                     || null,
          packed_cell_volume: parseFloat(formValues['eGFR'])                     || null,
          hypertension:     formValues['Hypertension']     === 'Yes' ? 1 : 0,
          diabetes_mellitus: formValues['Diabetes Mellitus'] === 'Yes' ? 1 : 0,
        }),
      });

      if (!mlRes.ok) throw new Error('ML service error');

      const ml = await mlRes.json();

      // ml returns: { probability, risk_level, top_factors }
      const score     = Math.round(ml.probability);
      const riskLevel = ml.risk_level;  // 'High' | 'Medium' | 'Low'

      const stageMap = {
        High:   'Stage 3b / Stage 4+',
        Medium: 'Stage 2 / Stage 3a',
        Low:    'No CKD / Stage 1',
      };
      const recommendationMap = {
        High:   'High risk of CKD progression. Urgent nephrology consultation recommended. Close monitoring of GFR and creatinine required. Evaluate for renal replacement therapy preparation.',
        Medium: 'Moderate risk detected. Recommend quarterly monitoring, blood pressure control, dietary consultation. Consider nephrology referral if trend worsens.',
        Low:    'Routine monitoring recommended. Maintain healthy lifestyle — adequate hydration, balanced diet, regular exercise. Annual kidney function screening.',
      };

      const featureImportance = Object.entries(ml.top_factors || {}).map(([feature, importance]) => ({
        feature,
        importance,
        value: formValues[feature] ?? '—',
      }));

      setResult({
        score,
        riskLevel,
        stage:          stageMap[riskLevel],
        recommendation: recommendationMap[riskLevel],
        featureImportance,
        missing,
      });

      // ── Save to DB if a patient is selected ────────────────────────────────
      if (selectedPatient) {
        setSaving(true);
        try {
          await fetch(`${API}/predictions`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify({
              patientId:      selectedPatient,
              riskScore:      score,
              riskLevel:      riskLevel,
              ckdStage:       stageMap[riskLevel],
              recommendation: recommendationMap[riskLevel],
              inputs:         formValues,
            }),
          });
          setSaved(true);
        } catch {
          // Result is still displayed — DB save is best-effort
        } finally {
          setSaving(false);
        }
      }

    } catch {
      setResult({ error: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormValues({});
    setSelectedPatient('');
    setResult(null);
    setSaved(false);
  };

  const ringColor = {
    High:   'border-red-400 bg-red-50',
    Medium: 'border-amber-400 bg-amber-50',
    Low:    'border-green-400 bg-green-50',
  };
  const textColor = { High: 'text-red-600', Medium: 'text-amber-600', Low: 'text-green-600' };
  const recColor  = { High: 'bg-red-50 border-red-200', Medium: 'bg-amber-50 border-amber-200', Low: 'bg-green-50 border-green-200' };

  return (
    <div className="min-h-screen">
      <Header title="CKD Risk Prediction" subtitle="AI-assisted kidney disease risk assessment" />
      <div className="p-8">
        {/* Disclaimer */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-900">About This Prediction Model</p>
            <p className="text-sm text-brand-700 mt-1">
              This module uses a supervised machine learning model trained on clinical kidney disease datasets.
              Results are for <strong>clinical decision support only</strong> and must be interpreted alongside professional medical judgment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Input form */}
          <div className="col-span-2 card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-slate-800">Patient Clinical Data</h3>
              </div>
              {/* Patient auto-fill dropdown */}
              {patientsLoading ? (
                <div className="input-field w-64 flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading patients…
                </div>
              ) : (
                <select value={selectedPatient} onChange={handlePatientSelect} className="input-field w-64">
                  <option value="">— Auto-fill from patient —</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.id} – {p.first_name} {p.last_name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {predictionFeatures.map(feature => (
                <div key={feature.name}>
                  <label className="label">{feature.name}</label>
                  {feature.type === 'select' ? (
                    <select
                      value={formValues[feature.name] || ''}
                      onChange={e => handleChange(feature.name, e.target.value)}
                      className="input-field">
                      <option value="">Select</option>
                      {feature.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type="number" step="any"
                      value={formValues[feature.name] ?? ''}
                      onChange={e => handleChange(feature.name, e.target.value)}
                      className="input-field"
                      placeholder={feature.range} />
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
              <button onClick={runPrediction} disabled={isProcessing} className="btn-primary flex items-center gap-2">
                {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                {isProcessing ? 'Analysing...' : 'Run AI Prediction'}
              </button>
              <button onClick={resetForm} className="btn-secondary flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              {/* Saved indicator */}
              {saving && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving to record…
                </span>
              )}
              {saved && !saving && (
                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved to patient record
                </span>
              )}
            </div>
          </div>

          {/* Result panel */}
          <div className="col-span-1">
            <div className="card p-6 sticky top-8">
              <h3 className="font-semibold text-slate-800 mb-4">Prediction Result</h3>

              {isProcessing && (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-slate-500">Analysing clinical data...</p>
                  <p className="text-xs text-slate-400 mt-1">Running ML pipeline</p>
                </div>
              )}

              {!isProcessing && !result && (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Enter patient data and</p>
                  <p className="text-sm text-slate-500">click "Run AI Prediction"</p>
                </div>
              )}

              {result?.error && (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-red-600">ML Service Unavailable</p>
                  <p className="text-xs text-slate-400 mt-1">Make sure the prediction server is running on port 8000</p>
                </div>
              )}

              {result && !result.error && (
                <div className="space-y-5">
                  {/* Score ring */}
                  <div className="text-center">
                    <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mx-auto ${ringColor[result.riskLevel]}`}>
                      <div>
                        <p className={`text-3xl font-bold ${textColor[result.riskLevel]}`}>{result.score}%</p>
                        <p className="text-xs text-slate-500">Risk Score</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col items-center gap-1">
                      <span className={result.riskLevel === 'High' ? 'badge-high' : result.riskLevel === 'Medium' ? 'badge-medium' : 'badge-low'}>
                        {result.riskLevel === 'High' ? <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> : <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
                        {result.riskLevel} Risk
                      </span>
                      <p className="text-xs text-slate-500">Predicted: {result.stage}</p>
                    </div>
                  </div>

                  {/* Missing data warning */}
                  {result.missing?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                      <strong>⚠ {result.missing.length} field(s) missing</strong> — prediction confidence may be reduced.
                    </div>
                  )}

                  {/* Recommendation */}
                  <div className={`p-3 rounded-lg border text-xs text-slate-700 ${recColor[result.riskLevel]}`}>
                    <p className="font-semibold mb-1">Clinical Recommendation</p>
                    <p>{result.recommendation}</p>
                  </div>

                  {/* Feature importance */}
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-3">Key Risk Factors</p>
                    <div className="space-y-2">
                      {result.featureImportance.map(f => (
                        <div key={f.feature}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="text-slate-600">{f.feature}</span>
                            <span className="text-slate-400">{(f.importance * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${f.importance > 0.2 ? 'bg-red-400' : f.importance > 0.1 ? 'bg-amber-400' : 'bg-brand-400'}`}
                              style={{ width: `${Math.min(f.importance * 300, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button className="w-full btn-secondary flex items-center justify-center gap-2 text-xs">
                    <FileDown className="w-3.5 h-3.5" /> Export PDF Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
