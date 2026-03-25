import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Brain, AlertTriangle, CheckCircle, Loader, Loader2, RotateCcw, FileDown, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';
import Header from '../components/layout/Header';
import { predictionSections, predictionFeatures, featureLabels } from '../config/predictionConfig';
import { useAuth } from '../context/AuthContext';
import { API_BASE, ML_API_BASE } from '../config/api';

const API    = API_BASE;
const ML_API = ML_API_BASE;

// ── Map select options to numeric values for ML ─────────────────────────────
const SELECT_MAP = {
  Gender:                     { Male: 0, Female: 1 },
  Ethnicity:                  { Caucasian: 0, 'African American': 1, Asian: 2, Other: 3 },
  SocioeconomicStatus:        { Low: 0, Middle: 1, High: 2 },
  EducationLevel:             { None: 0, 'High School': 1, "Bachelor's": 2, Higher: 3 },
  Smoking:                    { Yes: 1, No: 0 },
  FamilyHistoryKidneyDisease: { Yes: 1, No: 0 },
  FamilyHistoryHypertension:  { Yes: 1, No: 0 },
  FamilyHistoryDiabetes:      { Yes: 1, No: 0 },
  PreviousAcuteKidneyInjury:  { Yes: 1, No: 0 },
  UrinaryTractInfections:     { Yes: 1, No: 0 },
  ACEInhibitors:              { Yes: 1, No: 0 },
  Diuretics:                  { Yes: 1, No: 0 },
  Statins:                    { Yes: 1, No: 0 },
  AntidiabeticMedications:    { Yes: 1, No: 0 },
  Edema:                      { Yes: 1, No: 0 },
  HeavyMetalsExposure:        { Yes: 1, No: 0 },
  OccupationalExposureChemicals: { Yes: 1, No: 0 },
  WaterQuality:               { Good: 1, Poor: 0 },
};

// ── Reverse map for display (numeric DB value → label) ──────────────────────
const REVERSE_MAP = {};
for (const [field, mapping] of Object.entries(SELECT_MAP)) {
  REVERSE_MAP[field] = {};
  for (const [label, num] of Object.entries(mapping)) {
    REVERSE_MAP[field][num] = label;
  }
}

export default function CKDPrediction() {
  const { getToken, currentUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [patients,        setPatients]        = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [formValues,      setFormValues]      = useState({});
  const [selectedPatient, setSelectedPatient] = useState('');
  const [isProcessing,    setIsProcessing]    = useState(false);
  const [result,          setResult]          = useState(null);
  const [saving,          setSaving]          = useState(false);
  const [saved,           setSaved]           = useState(false);
  const [collapsed,       setCollapsed]       = useState({});
  const [patientSearch,   setPatientSearch]   = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ── Close patient dropdown on click outside ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredPatients = patients.filter(p => {
    const q = patientSearch.toLowerCase();
    return !q || p.first_name.toLowerCase().includes(q) || p.last_name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  // ── Load patient list for dropdown ─────────────────────────────────────────
  useEffect(() => {
    fetch(`${API}/patients`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setPatients(list);
        // Auto-select patient from URL param (e.g. /prediction?patient=abc-123)
        const urlPatientId = searchParams.get('patient');
        const urlPatient = list.find(p => p.id === urlPatientId);
        if (urlPatient) {
          setPatientSearch(`${urlPatient.first_name} ${urlPatient.last_name}`);
          fillPatientData(urlPatientId);
        }
      })
      .catch(() => {})
      .finally(() => setPatientsLoading(false));
  }, [getToken]);

  // ── Fetch and fill patient data by ID ──────────────────────────────────────
  const fillPatientData = async (id) => {
    setSelectedPatient(id);
    setResult(null);
    setSaved(false);
    if (!id) { setFormValues({}); return; }

    try {
      const res = await fetch(`${API}/patients/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const p = await res.json();
      const labs  = p.lastLabResults || {};
      const lastV = p.lastVisit      || {};

      // Calculate age from date of birth
      const age = p.dob
        ? Math.floor((Date.now() - new Date(p.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        : '';

      setFormValues({
        // Demographics
        'Age':                  age || '',
        'Gender':               p.gender === 'Male' ? 'Male' : p.gender === 'Female' ? 'Female' : '',
        'Ethnicity':            REVERSE_MAP.Ethnicity?.[p.ethnicity] || '',
        'SocioeconomicStatus':  REVERSE_MAP.SocioeconomicStatus?.[p.socioeconomic_status] || '',
        'EducationLevel':       REVERSE_MAP.EducationLevel?.[p.education_level] || '',
        'BMI':                  p.bmi || '',

        // Lifestyle
        'Smoking':              p.smoking === 1 ? 'Yes' : p.smoking === 0 ? 'No' : '',
        'AlcoholConsumption':   p.alcohol_consumption ?? '',
        'PhysicalActivity':     p.physical_activity ?? '',
        'DietQuality':          p.diet_quality ?? '',
        'SleepQuality':         p.sleep_quality ?? '',

        // Medical history
        'FamilyHistoryKidneyDisease': p.family_history_kidney_disease === 1 ? 'Yes' : p.family_history_kidney_disease === 0 ? 'No' : '',
        'FamilyHistoryHypertension':  p.family_history_hypertension === 1 ? 'Yes' : p.family_history_hypertension === 0 ? 'No' : '',
        'FamilyHistoryDiabetes':      p.family_history_diabetes === 1 ? 'Yes' : p.family_history_diabetes === 0 ? 'No' : '',
        'PreviousAcuteKidneyInjury':  p.previous_acute_kidney_injury === 1 ? 'Yes' : p.previous_acute_kidney_injury === 0 ? 'No' : '',
        'UrinaryTractInfections':     p.urinary_tract_infections === 1 ? 'Yes' : p.urinary_tract_infections === 0 ? 'No' : '',

        // Vitals
        'SystolicBP':           lastV.bp_systolic  || '',
        'DiastolicBP':          lastV.bp_diastolic || '',

        // Lab results
        'FastingBloodSugar':    labs.glucose    || '',
        'HbA1c':                labs.hba1c      || '',
        'SerumCreatinine':      labs.creatinine || '',
        'BUNLevels':            labs.bun        || '',
        'GFR':                  labs.gfr        || '',
        'ProteinInUrine':       labs.protein_in_urine || '',
        'ACR':                  labs.acr        || '',

        // Electrolytes
        'SerumElectrolytesSodium':    labs.sodium    || '',
        'SerumElectrolytesPotassium': labs.potassium || '',
        'SerumElectrolytesCalcium':   labs.calcium   || '',
        'SerumElectrolytesPhosphorus':labs.phosphorus || '',
        'HemoglobinLevels':           labs.hemoglobin || '',

        // Cholesterol
        'CholesterolTotal':         labs.cholesterol_total || '',
        'CholesterolLDL':           labs.cholesterol_ldl   || '',
        'CholesterolHDL':           labs.cholesterol_hdl   || '',
        'CholesterolTriglycerides': labs.cholesterol_triglycerides || '',

        // Medications
        'ACEInhibitors':          p.ace_inhibitors === 1 ? 'Yes' : p.ace_inhibitors === 0 ? 'No' : '',
        'Diuretics':             p.diuretics === 1 ? 'Yes' : p.diuretics === 0 ? 'No' : '',
        'NSAIDsUse':             p.nsaids_use ?? '',
        'Statins':               p.statins === 1 ? 'Yes' : p.statins === 0 ? 'No' : '',
        'AntidiabeticMedications': p.antidiabetic_medications === 1 ? 'Yes' : p.antidiabetic_medications === 0 ? 'No' : '',

        // Symptoms
        'Edema':                 p.edema === 1 ? 'Yes' : p.edema === 0 ? 'No' : '',
        'FatigueLevels':         p.fatigue_levels ?? '',
        'NauseaVomiting':        p.nausea_vomiting ?? '',
        'MuscleCramps':          p.muscle_cramps ?? '',
        'Itching':               p.itching ?? '',
        'QualityOfLifeScore':    p.quality_of_life_score ?? '',

        // Environmental
        'HeavyMetalsExposure':           p.heavy_metals_exposure === 1 ? 'Yes' : p.heavy_metals_exposure === 0 ? 'No' : '',
        'OccupationalExposureChemicals': p.occupational_exposure_chemicals === 1 ? 'Yes' : p.occupational_exposure_chemicals === 0 ? 'No' : '',
        'WaterQuality':                  p.water_quality === 1 ? 'Good' : p.water_quality === 0 ? 'Poor' : '',
        'MedicalCheckupsFrequency':      p.medical_checkups_frequency ?? '',
        'MedicationAdherence':           p.medication_adherence ?? '',
        'HealthLiteracy':                p.health_literacy ?? '',
      });
    } catch {
      setFormValues({});
    }
  };

  const handlePatientSelect = (e) => fillPatientData(e.target.value);

  const handleChange = (name, value) => {
    setFormValues(f => ({ ...f, [name]: value }));
    setResult(null);
    setSaved(false);
  };

  const toggleSection = (title) => {
    setCollapsed(c => ({ ...c, [title]: !c[title] }));
  };

  // ── Call the real ML prediction API ─────────────────────────────────────────
  const runPrediction = async () => {
    setIsProcessing(true);
    setSaved(false);

    try {
      const missing = predictionFeatures.filter(f => !formValues[f.name] && formValues[f.name] !== 0);

      // Convert form values to numeric for ML API
      const mlPayload = {};
      for (const feature of predictionFeatures) {
        const val = formValues[feature.name];
        if (val === '' || val === undefined || val === null) {
          mlPayload[feature.name] = null;
        } else if (SELECT_MAP[feature.name]) {
          mlPayload[feature.name] = SELECT_MAP[feature.name][val] ?? null;
        } else {
          mlPayload[feature.name] = parseFloat(val) || null;
        }
      }

      // Fetch with timeout (90s for cold start on free tier)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000);

      const mlRes = await fetch(`${ML_API}/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mlPayload),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!mlRes.ok) throw new Error('ML service error');

      const ml = await mlRes.json();

      const score     = Math.round(ml.probability);
      const riskLevel = ml.risk_level;

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
        feature: featureLabels[feature] || feature,
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
              inputs:         mlPayload,
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
    setPatientSearch('');
    setResult(null);
    setSaved(false);
  };

  // ── Export PDF ───────────────────────────────────────────────────────────────
  const exportPDF = () => {
    if (!result || result.error) return;

    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const patientName = selectedPatient
      ? patients.find(p => p.id === selectedPatient)
      : null;
    const nameStr = patientName ? `${patientName.first_name} ${patientName.last_name} (${patientName.id})` : 'Manual Entry';

    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('NephroTrack', 105, y, { align: 'center' });
    y += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('CKD Risk Prediction Report', 105, y, { align: 'center' });
    y += 5;
    doc.setDrawColor(200);
    doc.line(20, y, 190, y);
    y += 10;

    // Patient info
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(nameStr, 50, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(now, 50, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Assessed by:', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(currentUser?.name || 'Clinician', 50, y);
    y += 12;

    // Risk result box
    const riskColors = { High: [220, 38, 38], Medium: [217, 119, 6], Low: [22, 163, 74] };
    const [r, g, b] = riskColors[result.riskLevel] || [0, 0, 0];
    doc.setFillColor(r, g, b);
    doc.roundedRect(20, y, 170, 28, 3, 3, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.score}% — ${result.riskLevel} Risk`, 105, y + 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Predicted Stage: ${result.stage}`, 105, y + 21, { align: 'center' });
    y += 38;

    // Recommendation
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Recommendation', 20, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const recLines = doc.splitTextToSize(result.recommendation, 170);
    doc.text(recLines, 20, y);
    y += recLines.length * 4.5 + 8;

    // Key Risk Factors
    if (result.featureImportance?.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Risk Factors', 20, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      result.featureImportance.forEach(f => {
        doc.text(`${f.feature}`, 25, y);
        doc.text(`${(f.importance * 100).toFixed(1)}%`, 120, y);
        // Draw bar
        doc.setFillColor(200, 200, 200);
        doc.rect(140, y - 3, 40, 4, 'F');
        doc.setFillColor(r, g, b);
        doc.rect(140, y - 3, Math.min(f.importance * 120, 40), 4, 'F');
        y += 6;
      });
      y += 6;
    }

    // Clinical inputs summary
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Clinical Input Summary', 20, y);
    y += 7;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const filledFields = predictionSections.flatMap(s => s.fields)
      .filter(f => formValues[f.name] !== '' && formValues[f.name] !== undefined && formValues[f.name] !== null);

    let col = 0;
    filledFields.forEach(f => {
      if (y > 270) { doc.addPage(); y = 20; }
      const x = col === 0 ? 20 : 110;
      const label = featureLabels[f.name] || f.name;
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, x, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${formValues[f.name]}`, x + 45, y);
      if (col === 1) { y += 5; col = 0; } else { col = 1; }
    });
    if (col === 1) y += 5;
    y += 8;

    // Footer
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setDrawColor(200);
    doc.line(20, y, 190, y);
    y += 5;
    doc.setFontSize(7);
    doc.setTextColor(130);
    doc.text('This report is generated by NephroTrack for clinical decision support only.', 105, y, { align: 'center' });
    y += 4;
    doc.text('It must not replace professional medical diagnosis or clinical judgment.', 105, y, { align: 'center' });

    // Save
    const fileName = patientName
      ? `CKD_Report_${patientName.id}_${new Date().toISOString().slice(0, 10)}.pdf`
      : `CKD_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
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
      <div className="p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Input form */}
          <div className="lg:col-span-2 card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-brand-600" />
                <h3 className="font-semibold text-slate-800">Patient Clinical Data</h3>
              </div>
              {/* Patient auto-fill dropdown */}
              {patientsLoading ? (
                <div className="input-field w-full sm:w-64 flex items-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading patients…
                </div>
              ) : (
                <div className="relative w-full sm:w-64" ref={dropdownRef}>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={e => { setPatientSearch(e.target.value); setShowPatientDropdown(true); if (!e.target.value) { setSelectedPatient(''); setFormValues({}); } }}
                      onFocus={() => setShowPatientDropdown(true)}
                      className="input-field pl-9"
                      placeholder="Search patient..."
                    />
                  </div>
                  {showPatientDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredPatients.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-slate-400">No patients found</div>
                      ) : (
                        filteredPatients.map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { setPatientSearch(`${p.first_name} ${p.last_name}`); setShowPatientDropdown(false); fillPatientData(p.id); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-50 transition-colors ${selectedPatient === p.id ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-700'}`}
                          >
                            {p.id} – {p.first_name} {p.last_name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Grouped sections */}
            <div className="space-y-4">
              {predictionSections.map(section => (
                <div key={section.title} className="border border-slate-200 rounded-lg">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-t-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-700">{section.title}</span>
                    {collapsed[section.title]
                      ? <ChevronDown className="w-4 h-4 text-slate-400" />
                      : <ChevronUp className="w-4 h-4 text-slate-400" />
                    }
                  </button>
                  {!collapsed[section.title] && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.fields.map(feature => (
                        <div key={feature.name}>
                          <label className="label">{featureLabels[feature.name] || feature.name}</label>
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
                  )}
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
            <div className="card p-4 sm:p-6 sticky top-8">
              <h3 className="font-semibold text-slate-800 mb-4">Prediction Result</h3>

              {isProcessing && (
                <div className="text-center py-12">
                  <Loader className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
                  <p className="text-sm text-slate-500">Analysing clinical data...</p>
                  <p className="text-xs text-slate-400 mt-1">Running ML pipeline — this may take up to a minute on first use</p>
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
                  <p className="text-xs text-slate-400 mt-1">The prediction service may be waking up from inactivity.</p>
                  <button onClick={runPrediction} className="mt-3 btn-primary text-xs px-4 py-1.5">
                    Try Again
                  </button>
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

                  <button onClick={exportPDF} className="w-full btn-secondary flex items-center justify-center gap-2 text-xs">
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
