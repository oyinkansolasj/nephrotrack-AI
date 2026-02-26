// ─── Users ────────────────────────────────────────────────────────────────────
export const users = [
  { id: 'U001', name: 'Dr. Amara Nwosu',    email: 'amara@nephrotrack.ng',   role: 'clinician',       status: 'active',   lastLogin: '2026-02-25' },
  { id: 'U002', name: 'Tunde Adeyemi',      email: 'tunde@nephrotrack.ng',   role: 'admin',           status: 'active',   lastLogin: '2026-02-25' },
  { id: 'U003', name: 'Ngozi Okafor',       email: 'ngozi@nephrotrack.ng',   role: 'records_officer', status: 'active',   lastLogin: '2026-02-24' },
  { id: 'U004', name: 'Emeka Chukwu',       email: 'emeka@nephrotrack.ng',   role: 'billing',         status: 'active',   lastLogin: '2026-02-23' },
  { id: 'U005', name: 'Dr. Fatima Bello',   email: 'fatima@nephrotrack.ng',  role: 'clinician',       status: 'active',   lastLogin: '2026-02-22' },
  { id: 'U006', name: 'Kemi Afolabi',       email: 'kemi@nephrotrack.ng',    role: 'records_officer', status: 'inactive', lastLogin: '2026-01-10' },
];

// ─── Demo login credentials ───────────────────────────────────────────────────
export const demoAccounts = {
  clinician:       { email: 'amara@nephrotrack.ng',  password: 'demo123', userId: 'U001' },
  admin:           { email: 'tunde@nephrotrack.ng',  password: 'demo123', userId: 'U002' },
  records_officer: { email: 'ngozi@nephrotrack.ng',  password: 'demo123', userId: 'U003' },
  billing:         { email: 'emeka@nephrotrack.ng',  password: 'demo123', userId: 'U004' },
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patients = [
  {
    id: 'P001', firstName: 'Chioma', lastName: 'Eze',
    dob: '1968-03-14', gender: 'Female', phone: '080-1234-5678',
    email: 'chioma.eze@mail.com', address: '12 Aba Road, Port Harcourt',
    bloodGroup: 'O+', registeredOn: '2025-06-01', status: 'active',
    vitals: { bloodPressure: '158/96', pulse: 84, temperature: 36.8, weight: 72, height: 162 },
    labResults: { creatinine: 3.2, bun: 42, glucose: 186, potassium: 5.1, hemoglobin: 10.2, albumin: 3.1, hba1c: 7.8, gfr: 22 },
    ckdRisk: 'high', ckdStage: 'Stage 4', lastVisit: '2026-02-20',
  },
  {
    id: 'P002', firstName: 'Babatunde', lastName: 'Ogundimu',
    dob: '1975-07-22', gender: 'Male', phone: '080-9876-5432',
    email: 'babs.ogundimu@mail.com', address: '5 Lagos-Ibadan Expressway, Lagos',
    bloodGroup: 'A+', registeredOn: '2025-07-15', status: 'active',
    vitals: { bloodPressure: '138/88', pulse: 76, temperature: 36.5, weight: 85, height: 175 },
    labResults: { creatinine: 1.8, bun: 24, glucose: 148, potassium: 4.6, hemoglobin: 12.4, albumin: 3.8, hba1c: 6.9, gfr: 48 },
    ckdRisk: 'medium', ckdStage: 'Stage 3a', lastVisit: '2026-02-18',
  },
  {
    id: 'P003', firstName: 'Adaeze', lastName: 'Nnamdi',
    dob: '1990-11-05', gender: 'Female', phone: '081-2233-4455',
    email: 'adaeze@mail.com', address: '9 Enugu Expressway, Enugu',
    bloodGroup: 'B+', registeredOn: '2025-08-10', status: 'active',
    vitals: { bloodPressure: '120/78', pulse: 70, temperature: 36.6, weight: 60, height: 165 },
    labResults: { creatinine: 0.9, bun: 14, glucose: 95, potassium: 4.1, hemoglobin: 13.8, albumin: 4.2, hba1c: 5.4, gfr: 88 },
    ckdRisk: 'low', ckdStage: 'No CKD', lastVisit: '2026-01-30',
  },
  {
    id: 'P004', firstName: 'Musa', lastName: 'Aliyu',
    dob: '1955-01-30', gender: 'Male', phone: '070-5566-7788',
    email: 'musa.aliyu@mail.com', address: '3 Kano Road, Kano',
    bloodGroup: 'AB+', registeredOn: '2025-09-02', status: 'active',
    vitals: { bloodPressure: '165/100', pulse: 88, temperature: 37.1, weight: 90, height: 172 },
    labResults: { creatinine: 4.5, bun: 58, glucose: 210, potassium: 5.8, hemoglobin: 9.1, albumin: 2.8, hba1c: 9.2, gfr: 14 },
    ckdRisk: 'high', ckdStage: 'Stage 5', lastVisit: '2026-02-22',
  },
  {
    id: 'P005', firstName: 'Ngozi', lastName: 'Ikpeama',
    dob: '1982-05-18', gender: 'Female', phone: '090-1122-3344',
    email: 'ngozi.i@mail.com', address: '20 Onitsha Road, Anambra',
    bloodGroup: 'O-', registeredOn: '2025-10-20', status: 'active',
    vitals: { bloodPressure: '128/82', pulse: 72, temperature: 36.7, weight: 65, height: 160 },
    labResults: { creatinine: 1.2, bun: 18, glucose: 112, potassium: 4.3, hemoglobin: 12.9, albumin: 4.0, hba1c: 5.9, gfr: 68 },
    ckdRisk: 'medium', ckdStage: 'Stage 2', lastVisit: '2026-02-10',
  },
  {
    id: 'P006', firstName: 'Emeka', lastName: 'Obi',
    dob: '1963-09-12', gender: 'Male', phone: '080-6677-8899',
    email: 'emeka.obi@mail.com', address: '7 Asaba Road, Delta',
    bloodGroup: 'A-', registeredOn: '2025-11-05', status: 'active',
    vitals: { bloodPressure: '145/92', pulse: 80, temperature: 36.9, weight: 78, height: 168 },
    labResults: { creatinine: 2.6, bun: 35, glucose: 165, potassium: 5.0, hemoglobin: 11.0, albumin: 3.4, hba1c: 7.2, gfr: 30 },
    ckdRisk: 'high', ckdStage: 'Stage 3b', lastVisit: '2026-02-15',
  },
];

// ─── Visits ───────────────────────────────────────────────────────────────────
export const visits = [
  { id: 'V001', patientId: 'P001', date: '2026-02-20', clinician: 'Dr. Amara Nwosu', type: 'Follow-up', notes: 'Patient reports fatigue and reduced urine output. BP elevated. Adjusted antihypertensives.', predictionId: 'PR001' },
  { id: 'V002', patientId: 'P001', date: '2026-01-15', clinician: 'Dr. Amara Nwosu', type: 'Follow-up', notes: 'Creatinine rising. Referred to nephrologist for RRT planning.', predictionId: 'PR002' },
  { id: 'V003', patientId: 'P002', date: '2026-02-18', clinician: 'Dr. Fatima Bello', type: 'Routine',   notes: 'Stable. Continue current medications. Diet counseling given.', predictionId: null },
  { id: 'V004', patientId: 'P003', date: '2026-01-30', clinician: 'Dr. Amara Nwosu', type: 'Routine',   notes: 'Healthy markers. Annual screening. No concerns.', predictionId: null },
  { id: 'V005', patientId: 'P004', date: '2026-02-22', clinician: 'Dr. Amara Nwosu', type: 'Emergency', notes: 'Acute episode. GFR critically low. Urgent dialysis discussion initiated.', predictionId: 'PR003' },
  { id: 'V006', patientId: 'P006', date: '2026-02-15', clinician: 'Dr. Fatima Bello', type: 'Follow-up', notes: 'Progressive decline. Dietary protein restriction advised.', predictionId: 'PR004' },
];

// ─── Predictions ──────────────────────────────────────────────────────────────
export const predictions = [
  { id: 'PR001', patientId: 'P001', visitId: 'V001', date: '2026-02-20', score: 87, riskLevel: 'high',   stage: 'Stage 4', modelVersion: 'v1.0.0' },
  { id: 'PR002', patientId: 'P001', visitId: 'V002', date: '2026-01-15', score: 79, riskLevel: 'high',   stage: 'Stage 3b', modelVersion: 'v1.0.0' },
  { id: 'PR003', patientId: 'P004', visitId: 'V005', date: '2026-02-22', score: 96, riskLevel: 'high',   stage: 'Stage 5', modelVersion: 'v1.0.0' },
  { id: 'PR004', patientId: 'P006', visitId: 'V006', date: '2026-02-15', score: 72, riskLevel: 'high',   stage: 'Stage 3b', modelVersion: 'v1.0.0' },
];

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointments = [
  { id: 'A001', patientId: 'P001', patientName: 'Chioma Eze',       date: '2026-02-28', time: '09:00', type: 'Follow-up',    clinician: 'Dr. Amara Nwosu',  status: 'confirmed' },
  { id: 'A002', patientId: 'P002', patientName: 'Babatunde Ogundimu', date: '2026-02-28', time: '10:30', type: 'Routine',     clinician: 'Dr. Fatima Bello', status: 'confirmed' },
  { id: 'A003', patientId: 'P005', patientName: 'Ngozi Ikpeama',    date: '2026-02-28', time: '11:00', type: 'Consultation', clinician: 'Dr. Amara Nwosu',  status: 'pending' },
  { id: 'A004', patientId: 'P003', patientName: 'Adaeze Nnamdi',    date: '2026-03-01', time: '14:00', type: 'Routine',      clinician: 'Dr. Fatima Bello', status: 'confirmed' },
  { id: 'A005', patientId: 'P004', patientName: 'Musa Aliyu',       date: '2026-03-01', time: '08:30', type: 'Emergency',    clinician: 'Dr. Amara Nwosu',  status: 'confirmed' },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoices = [
  { id: 'INV001', patientId: 'P001', patientName: 'Chioma Eze',         date: '2026-02-20', amount: 25000, paid: 25000, status: 'paid',    items: ['Consultation', 'Lab Tests', 'CKD Prediction'] },
  { id: 'INV002', patientId: 'P002', patientName: 'Babatunde Ogundimu', date: '2026-02-18', amount: 18000, paid: 0,     status: 'unpaid',  items: ['Consultation', 'Lab Tests'] },
  { id: 'INV003', patientId: 'P004', patientName: 'Musa Aliyu',         date: '2026-02-22', amount: 45000, paid: 20000, status: 'partial', items: ['Emergency Consultation', 'Lab Tests', 'CKD Prediction', 'Dialysis Prep'] },
  { id: 'INV004', patientId: 'P003', patientName: 'Adaeze Nnamdi',      date: '2026-01-30', amount: 12000, paid: 12000, status: 'paid',    items: ['Routine Checkup', 'Lab Tests'] },
  { id: 'INV005', patientId: 'P005', patientName: 'Ngozi Ikpeama',      date: '2026-02-10', amount: 20000, paid: 0,     status: 'unpaid',  items: ['Consultation', 'Lab Tests', 'CKD Prediction'] },
  { id: 'INV006', patientId: 'P006', patientName: 'Emeka Obi',          date: '2026-02-15', amount: 22000, paid: 22000, status: 'paid',    items: ['Consultation', 'Lab Tests', 'CKD Prediction'] },
];

// ─── Dashboard stats ──────────────────────────────────────────────────────────
export const dashboardStats = {
  totalPatients: 248,
  highRiskCount: 42,
  todayAppointments: 12,
  predictionsThisMonth: 94,
  avgRiskScore: 58,
  pendingLabReviews: 7,
};

// ─── Prediction features (for the CKD form) ───────────────────────────────────
export const predictionFeatures = [
  { name: 'Age',                         type: 'number', range: '18–100',   description: 'Patient age in years' },
  { name: 'Blood Pressure (Systolic)',   type: 'number', range: '80–200',   description: 'mmHg' },
  { name: 'Blood Pressure (Diastolic)', type: 'number', range: '50–130',   description: 'mmHg' },
  { name: 'Blood Glucose',              type: 'number', range: '70–500',   description: 'mg/dL (fasting)' },
  { name: 'Blood Urea (BUN)',           type: 'number', range: '5–100',    description: 'mg/dL' },
  { name: 'Serum Creatinine',           type: 'number', range: '0.4–15',   description: 'mg/dL' },
  { name: 'Potassium',                  type: 'number', range: '2.5–7.0',  description: 'mEq/L' },
  { name: 'Hemoglobin',                 type: 'number', range: '5–18',     description: 'g/dL' },
  { name: 'Albumin',                    type: 'number', range: '1.5–5.5',  description: 'g/dL' },
  { name: 'eGFR',                       type: 'number', range: '0–120',    description: 'mL/min/1.73m²' },
  { name: 'Hypertension',              type: 'select', options: ['Yes', 'No'], description: 'Diagnosed hypertension' },
  { name: 'Diabetes Mellitus',         type: 'select', options: ['Yes', 'No'], description: 'Diagnosed diabetes' },
];
