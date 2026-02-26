import { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle, Info, Loader, RotateCcw, FileDown } from 'lucide-react';
import Header from '../components/layout/Header';
import { predictionFeatures } from '../config/predictionConfig';

// TODO: Replace with → GET /api/patients (for auto-fill dropdown)
//                       POST /api/predictions (to run & save prediction)
const patients = [];

export default function CKDPrediction() {
  const [formValues, setFormValues] = useState({});
  const [selectedPatient, setSelectedPatient] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handlePatientSelect = (e) => {
    const id = e.target.value;
    setSelectedPatient(id);
    if (id) {
      const p = patients.find(pt => pt.id === id);
      if (p) {
        const [sys, dia] = p.vitals.bloodPressure.split('/');
        setFormValues({
          Age: p.age || new Date().getFullYear() - new Date(p.dob).getFullYear(),
          'Blood Pressure (Systolic)':  parseInt(sys),
          'Blood Pressure (Diastolic)': parseInt(dia),
          'Blood Glucose':  p.labResults.glucose,
          'Blood Urea (BUN)': p.labResults.bun,
          'Serum Creatinine': p.labResults.creatinine,
          Potassium:   p.labResults.potassium,
          Hemoglobin:  p.labResults.hemoglobin,
          Albumin:     p.labResults.albumin,
          eGFR:        p.labResults.gfr,
          Hypertension:       parseInt(sys) > 140 ? 'Yes' : 'No',
          'Diabetes Mellitus': p.labResults.hba1c > 6.5 ? 'Yes' : 'No',
        });
      }
    } else {
      setFormValues({});
    }
    setResult(null);
  };

  const handleChange = (name, value) => {
    setFormValues(f => ({ ...f, [name]: value }));
    setResult(null);
  };

  const runPrediction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const creatinine   = parseFloat(formValues['Serum Creatinine']) || 1.0;
      const age          = parseInt(formValues['Age']) || 40;
      const systolic     = parseInt(formValues['Blood Pressure (Systolic)']) || 120;
      const glucose      = parseInt(formValues['Blood Glucose']) || 100;
      const bun          = parseInt(formValues['Blood Urea (BUN)']) || 15;
      const gfr          = parseFloat(formValues['eGFR']) || 90;
      const hemoglobin   = parseFloat(formValues['Hemoglobin']) || 13;
      const albumin      = parseFloat(formValues['Albumin']) || 4.0;
      const hasDiabetes  = formValues['Diabetes Mellitus'] === 'Yes';
      const hasHypert    = formValues['Hypertension'] === 'Yes';

      let score = 0;
      score += Math.min((creatinine / 5)        * 28, 28);
      score += Math.min(((age - 18) / 82)       * 12, 12);
      score += Math.min(((systolic - 80) / 120) * 12, 12);
      score += Math.min(((glucose - 70) / 430)  *  8,  8);
      score += Math.min(((bun - 5) / 95)        *  8,  8);
      score += Math.min(((90 - gfr) / 90)       * 12, 12);
      score += hemoglobin < 12 ? 5 : 0;
      score += albumin < 3.5   ? 5 : 0;
      score += hasDiabetes     ? 8 : 0;
      score += hasHypert       ? 7 : 0;
      score = Math.round(Math.min(Math.max(score, 5), 98));

      const missing = predictionFeatures.filter(f => !formValues[f.name] && formValues[f.name] !== 0);

      let riskLevel, stage, recommendation;
      if (score < 30) {
        riskLevel = 'Low'; stage = 'No CKD / Stage 1';
        recommendation = 'Routine monitoring recommended. Maintain healthy lifestyle — adequate hydration, balanced diet, regular exercise. Annual kidney function screening.';
      } else if (score < 60) {
        riskLevel = 'Medium'; stage = 'Stage 2 / Stage 3a';
        recommendation = 'Moderate risk detected. Recommend quarterly monitoring, blood pressure control, dietary consultation. Consider nephrology referral if trend worsens.';
      } else {
        riskLevel = 'High'; stage = 'Stage 3b / Stage 4+';
        recommendation = 'High risk of CKD progression. Urgent nephrology consultation recommended. Close monitoring of GFR and creatinine required. Evaluate for renal replacement therapy preparation.';
      }

      const featureImportance = [
        { feature: 'Serum Creatinine', importance: 0.26, value: creatinine },
        { feature: 'eGFR',             importance: 0.22, value: gfr },
        { feature: 'Blood Glucose',    importance: 0.14, value: glucose },
        { feature: 'Blood Pressure',   importance: 0.12, value: systolic },
        { feature: 'BUN',              importance: 0.10, value: bun },
        { feature: 'Age',              importance: 0.08, value: age },
        { feature: 'Diabetes',         importance: 0.05, value: hasDiabetes ? 'Yes' : 'No' },
        { feature: 'Hypertension',     importance: 0.03, value: hasHypert ? 'Yes' : 'No' },
      ];

      setResult({ score, riskLevel, stage, recommendation, featureImportance, missing });
      setIsProcessing(false);
    }, 2000);
  };

  const resetForm = () => { setFormValues({}); setSelectedPatient(''); setResult(null); };

  const ringColor = {
    High:   'border-red-400 bg-red-50',
    Medium: 'border-amber-400 bg-amber-50',
    Low:    'border-green-400 bg-green-50',
  };
  const textColor = { High: 'text-red-600', Medium: 'text-amber-600', Low: 'text-green-600' };
  const recColor  = { High: 'bg-red-50 border-red-200', Medium: 'bg-amber-50 border-amber-200', Low: 'bg-green-50 border-green-200' };

  return (
    <div className="min-h-screen">
      <Header title="CKD Risk Prediction" subtitle="AI-powered chronic kidney disease risk assessment" />
      <div className="p-8">
        {/* Disclaimer */}
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-brand-900">About This Prediction Model</p>
            <p className="text-sm text-brand-700 mt-1">
              This module uses a supervised machine learning model trained on clinical CKD datasets.
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
              <select value={selectedPatient} onChange={handlePatientSelect} className="input-field w-64">
                <option value="">— Auto-fill from patient —</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.id} – {p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {predictionFeatures.map(feature => (
                <div key={feature.name}>
                  <label className="label">{feature.name}</label>
                  {feature.type === 'select' ? (
                    <select value={formValues[feature.name] || ''} onChange={e => handleChange(feature.name, e.target.value)} className="input-field">
                      <option value="">Select</option>
                      {feature.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="number" step="any" value={formValues[feature.name] ?? ''} onChange={e => handleChange(feature.name, e.target.value)}
                      className="input-field" placeholder={feature.range} />
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

              {result && (
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
                            <div className={`h-1.5 rounded-full ${f.importance > 0.2 ? 'bg-red-400' : f.importance > 0.1 ? 'bg-amber-400' : 'bg-brand-400'}`}
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
