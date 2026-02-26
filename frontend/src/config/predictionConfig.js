// ─── CKD Prediction form field definitions ────────────────────────────────────
// These are static configuration, not mock data.
// Values will be entered by the clinician at runtime.

export const predictionFeatures = [
  { name: 'Age',                        type: 'number', range: '18–100',   description: 'Patient age in years' },
  { name: 'Blood Pressure (Systolic)',  type: 'number', range: '80–200',   description: 'mmHg' },
  { name: 'Blood Pressure (Diastolic)', type: 'number', range: '50–130',   description: 'mmHg' },
  { name: 'Blood Glucose',             type: 'number', range: '70–500',   description: 'mg/dL (fasting)' },
  { name: 'Blood Urea (BUN)',          type: 'number', range: '5–100',    description: 'mg/dL' },
  { name: 'Serum Creatinine',          type: 'number', range: '0.4–15',   description: 'mg/dL' },
  { name: 'Potassium',                 type: 'number', range: '2.5–7.0',  description: 'mEq/L' },
  { name: 'Hemoglobin',               type: 'number', range: '5–18',     description: 'g/dL' },
  { name: 'Albumin',                  type: 'number', range: '1.5–5.5',  description: 'g/dL' },
  { name: 'eGFR',                     type: 'number', range: '0–120',    description: 'mL/min/1.73m²' },
  { name: 'Hypertension',             type: 'select', options: ['Yes', 'No'], description: 'Diagnosed hypertension' },
  { name: 'Diabetes Mellitus',        type: 'select', options: ['Yes', 'No'], description: 'Diagnosed diabetes' },
];
