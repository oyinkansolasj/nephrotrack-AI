// =============================================================================
// NephroTrack — Patient Seed Script (50 UCI CKD Dataset-inspired Patients)
// Clinical values drawn from the UCI Chronic Kidney Disease dataset.
// Run:  node database/seed_patients.js
// =============================================================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// NOTE: labs.albumin uses UCI urinary albumin scale (0–5):
// 0=absent, 1=trace, 2=+1, 3=+2, 4=+3, 5=+4
// This matches what the ML model was trained on.

const PATIENTS = [

  // ════════════════════════════════════════════════════════════════════════════
  // HIGH RISK — Advanced CKD (20 patients)
  // ════════════════════════════════════════════════════════════════════════════

  {
    first_name: 'Olumide', last_name: 'Adeyinka',
    dob: '1978-04-12', gender: 'Male',
    phone_code: '+234', phone: '08023451122',
    email: 'olumide.adeyinka@gmail.com',
    address: '14 Adeniyi Jones Ave, Ikeja, Lagos',
    blood_group: 'O+',
    nok_name: 'Remi Adeyinka', nok_phone_code: '+234', nok_phone: '08134556677',
    nok_relationship: 'Wife', nok_address: '14 Adeniyi Jones Ave, Ikeja, Lagos',
    hypertension: 'Yes', diabetes: 'Yes', allergies: 'Penicillin',
    current_medications: 'Amlodipine 10mg, Metformin 500mg, Lisinopril 5mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-01-15', visit_type: 'Follow-up', bp_systolic: 160, bp_diastolic: 100, pulse: 90, temperature: 36.8, weight: 84.0, height: 174, notes: 'Worsening fatigue, reduced urine output. BP elevated. Nephrology referral arranged.' },
    labs: { creatinine: 7.8, bun: 121, glucose: 148, potassium: 4.1, hemoglobin: 10.5, albumin: 3, hba1c: 8.4, gfr: 18 },
  },

  {
    first_name: 'Fatimah', last_name: 'Balogun',
    dob: '1973-09-20', gender: 'Female',
    phone_code: '+234', phone: '08156781234',
    email: 'fatimah.balogun@yahoo.com',
    address: '45 Sultan Road, Kaduna',
    blood_group: 'A+',
    nok_name: 'Aliyu Balogun', nok_phone_code: '+234', nok_phone: '08067890123',
    nok_relationship: 'Husband', nok_address: '45 Sultan Road, Kaduna',
    hypertension: 'Yes', diabetes: 'No', allergies: null,
    current_medications: 'Losartan 50mg, Hydrochlorothiazide 12.5mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-01-22', visit_type: 'Consultation', bp_systolic: 150, bp_diastolic: 96, pulse: 82, temperature: 36.6, weight: 70.0, height: 162, notes: 'Proteinuria ++. Elevated creatinine. Dietary review initiated.' },
    labs: { creatinine: 5.2, bun: 98, glucose: 130, potassium: 3.9, hemoglobin: 9.2, albumin: 4, hba1c: 6.1, gfr: 22 },
  },

  {
    first_name: 'Emmanuel', last_name: 'Okonkwo',
    dob: '1963-02-07', gender: 'Male',
    phone_code: '+234', phone: '08098765432',
    email: null,
    address: '8 New Market Road, Onitsha, Anambra',
    blood_group: 'B+',
    nok_name: 'Chinyere Okonkwo', nok_phone_code: '+234', nok_phone: '08187654321',
    nok_relationship: 'Daughter', nok_address: '22 Zik Avenue, Awka, Anambra',
    hypertension: 'No', diabetes: 'No', allergies: 'Sulfonamides',
    current_medications: 'Furosemide 40mg, Calcium carbonate 500mg, Erythropoietin injection',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-03', visit_type: 'Consultation', bp_systolic: 170, bp_diastolic: 105, pulse: 94, temperature: 37.0, weight: 71.0, height: 168, notes: 'Oedema worsening, haemoglobin critically low. Dialysis preparation discussed.' },
    labs: { creatinine: 8.0, bun: 107, glucose: 140, potassium: 5.2, hemoglobin: 8.5, albumin: 5, hba1c: 5.8, gfr: 12 },
  },

  {
    first_name: 'Amina', last_name: 'Yusuf',
    dob: '1991-07-14', gender: 'Female',
    phone_code: '+234', phone: '08145678901',
    email: 'amina.yusuf@hotmail.com',
    address: '31 Maiduguri Road, Damaturu, Yobe',
    blood_group: 'AB+',
    nok_name: 'Ibrahim Yusuf', nok_phone_code: '+234', nok_phone: '08056789012',
    nok_relationship: 'Brother', nok_address: '31 Maiduguri Road, Damaturu, Yobe',
    hypertension: 'Yes', diabetes: 'No', allergies: null,
    current_medications: 'Enalapril 5mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-11', visit_type: 'Follow-up', bp_systolic: 145, bp_diastolic: 92, pulse: 78, temperature: 36.5, weight: 62.0, height: 158, notes: 'Young patient with progressive CKD. Proteinuria grade 2. Dietary protein restriction advised.' },
    labs: { creatinine: 4.0, bun: 56, glucose: 120, potassium: 4.5, hemoglobin: 11.0, albumin: 2, hba1c: 5.5, gfr: 28 },
  },

  {
    first_name: 'Chukwuemeka', last_name: 'Eze',
    dob: '1956-11-30', gender: 'Male',
    phone_code: '+234', phone: '08012345678',
    email: null,
    address: '3 Hospital Road, Enugu',
    blood_group: 'O-',
    nok_name: 'Obiageli Eze', nok_phone_code: '+234', nok_phone: '08123456789',
    nok_relationship: 'Wife', nok_address: '3 Hospital Road, Enugu',
    hypertension: 'Yes', diabetes: 'Yes', allergies: null,
    current_medications: 'Nifedipine 20mg, Insulin (Mixtard 30), Furosemide 40mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-18', visit_type: 'Follow-up', bp_systolic: 176, bp_diastolic: 108, pulse: 96, temperature: 37.2, weight: 75.0, height: 172, notes: 'Severe anaemia. BP markedly elevated. Renal replacement therapy discussion initiated.' },
    labs: { creatinine: 3.5, bun: 78, glucose: 200, potassium: 5.0, hemoglobin: 7.2, albumin: 4, hba1c: 9.2, gfr: 20 },
  },

  {
    first_name: 'Ngozi', last_name: 'Okeke',
    dob: '1981-05-19', gender: 'Female',
    phone_code: '+234', phone: '08167890234',
    email: 'ngozi.okeke@gmail.com',
    address: '19 Trans-Ekulu, Enugu',
    blood_group: 'A-',
    nok_name: 'Kelechi Okeke', nok_phone_code: '+234', nok_phone: '08078901345',
    nok_relationship: 'Husband', nok_address: '19 Trans-Ekulu, Enugu',
    hypertension: 'Yes', diabetes: 'Yes', allergies: null,
    current_medications: 'Amlodipine 5mg, Metformin 1000mg, Lisinopril 10mg, Aspirin 75mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-25', visit_type: 'Routine', bp_systolic: 165, bp_diastolic: 104, pulse: 88, temperature: 36.9, weight: 78.5, height: 165, notes: 'GFR declining steadily. Heavy proteinuria. Urgent nephrology referral.' },
    labs: { creatinine: 6.5, bun: 100, glucose: 156, potassium: 4.8, hemoglobin: 9.0, albumin: 3, hba1c: 8.8, gfr: 15 },
  },

  {
    first_name: 'Adaeze', last_name: 'Nwachukwu',
    dob: '1968-08-03', gender: 'Female',
    phone_code: '+234', phone: '08189012567',
    email: null,
    address: '55 Ogui Road, Enugu',
    blood_group: 'O+',
    nok_name: 'Chidi Nwachukwu', nok_phone_code: '+234', nok_phone: '08090123567',
    nok_relationship: 'Son', nok_address: '55 Ogui Road, Enugu',
    hypertension: 'Yes', diabetes: 'Yes', allergies: 'Ibuprofen',
    current_medications: 'Amlodipine 10mg, Insulin (Actrapid), Erythropoietin, Sodium bicarbonate',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-03-05', visit_type: 'Consultation', bp_systolic: 185, bp_diastolic: 112, pulse: 98, temperature: 37.3, weight: 66.0, height: 160, notes: 'GFR critically low. Anuria episodes reported. Fistula formation for haemodialysis discussed.' },
    labs: { creatinine: 9.1, bun: 132, glucose: 170, potassium: 5.5, hemoglobin: 8.0, albumin: 5, hba1c: 9.5, gfr: 10 },
  },

  {
    first_name: 'Musa', last_name: 'Garba',
    dob: '1960-03-09', gender: 'Male',
    phone_code: '+234', phone: '08165432109',
    email: null,
    address: '5 Kofar Wambai, Kano',
    blood_group: 'O+',
    nok_name: 'Hadiza Garba', nok_phone_code: '+234', nok_phone: '08076543210',
    nok_relationship: 'Wife', nok_address: '5 Kofar Wambai, Kano',
    hypertension: 'Yes', diabetes: 'Yes', allergies: null,
    current_medications: 'Amlodipine 5mg, Glibenclamide 5mg, Atorvastatin 20mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-01-30', visit_type: 'Follow-up', bp_systolic: 158, bp_diastolic: 98, pulse: 86, temperature: 36.9, weight: 78.0, height: 170, notes: 'Persistent proteinuria, creatinine rising. Nephrology referral arranged.' },
    labs: { creatinine: 6.2, bun: 110, glucose: 178, potassium: 5.3, hemoglobin: 8.8, albumin: 4, hba1c: 9.0, gfr: 16 },
  },

  {
    first_name: 'Abdullahi', last_name: 'Sule',
    dob: '1969-11-14', gender: 'Male',
    phone_code: '+234', phone: '08187654320',
    email: null,
    address: '3 Zaria Road, Kaduna',
    blood_group: 'A+',
    nok_name: 'Ramatu Sule', nok_phone_code: '+234', nok_phone: '08098765320',
    nok_relationship: 'Wife', nok_address: '3 Zaria Road, Kaduna',
    hypertension: 'Yes', diabetes: 'Yes', allergies: null,
    current_medications: 'Nifedipine 20mg, Metformin 500mg, Furosemide 40mg, EPO injection',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-03-10', visit_type: 'Consultation', bp_systolic: 178, bp_diastolic: 110, pulse: 94, temperature: 37.1, weight: 80.0, height: 174, notes: 'Advanced CKD. Severe anaemia requiring EPO. Dialysis access planning underway.' },
    labs: { creatinine: 7.4, bun: 118, glucose: 162, potassium: 5.6, hemoglobin: 7.8, albumin: 5, hba1c: 8.7, gfr: 13 },
  },

  {
    first_name: 'Kehinde', last_name: 'Adeleke',
    dob: '1958-06-25', gender: 'Male',
    phone_code: '+234', phone: '08101239874',
    email: null,
    address: '10 Oke-Bola Road, Ibadan, Oyo',
    blood_group: 'B+',
    nok_name: 'Taiwo Adeleke', nok_phone_code: '+234', nok_phone: '08021239874',
    nok_relationship: 'Son', nok_address: '10 Oke-Bola Road, Ibadan, Oyo',
    hypertension: 'Yes', diabetes: 'Yes', allergies: 'Codeine',
    current_medications: 'Amlodipine 10mg, Glibenclamide 5mg, Furosemide 80mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-01-20', visit_type: 'Follow-up', bp_systolic: 172, bp_diastolic: 106, pulse: 92, temperature: 37.0, weight: 79.0, height: 173, notes: 'Advanced CKD with severe hypertension. Creatinine at 8.3. Urgent review.' },
    labs: { creatinine: 8.3, bun: 125, glucose: 190, potassium: 5.4, hemoglobin: 8.2, albumin: 5, hba1c: 9.1, gfr: 11 },
  },

  {
    first_name: 'Hajiya', last_name: 'Binta',
    dob: '1965-01-17', gender: 'Female',
    phone_code: '+234', phone: '08112340987',
    email: null,
    address: '12 Sultan Bello Way, Sokoto',
    blood_group: 'O+',
    nok_name: 'Alh. Binta', nok_phone_code: '+234', nok_phone: '08032340987',
    nok_relationship: 'Husband', nok_address: '12 Sultan Bello Way, Sokoto',
    hypertension: 'Yes', diabetes: 'No', allergies: null,
    current_medications: 'Lisinopril 20mg, Amlodipine 10mg, Furosemide 40mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-02', visit_type: 'Consultation', bp_systolic: 162, bp_diastolic: 102, pulse: 88, temperature: 36.8, weight: 68.0, height: 160, notes: 'BP poorly controlled. Severe proteinuria. GFR critically reduced.' },
    labs: { creatinine: 7.0, bun: 115, glucose: 135, potassium: 5.1, hemoglobin: 9.5, albumin: 4, hba1c: 6.0, gfr: 17 },
  },

  {
    first_name: 'Patrick', last_name: 'Obiechina',
    dob: '1962-10-08', gender: 'Male',
    phone_code: '+234', phone: '08123450987',
    email: 'patrick.obiechina@gmail.com',
    address: '7 Awka Road, Onitsha, Anambra',
    blood_group: 'AB+',
    nok_name: 'Rose Obiechina', nok_phone_code: '+234', nok_phone: '08043450987',
    nok_relationship: 'Wife', nok_address: '7 Awka Road, Onitsha, Anambra',
    hypertension: 'Yes', diabetes: 'Yes', allergies: null,
    current_medications: 'Nifedipine 30mg, Insulin NPH, Erythropoietin 4000IU',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-09', visit_type: 'Routine', bp_systolic: 168, bp_diastolic: 104, pulse: 90, temperature: 37.0, weight: 82.0, height: 175, notes: 'Stage 4 CKD. Anaemia worsening. EPO dose increased.' },
    labs: { creatinine: 5.8, bun: 102, glucose: 188, potassium: 5.2, hemoglobin: 8.6, albumin: 4, hba1c: 9.3, gfr: 14 },
  },

  {
    first_name: 'Rukayat', last_name: 'Afolabi',
    dob: '1972-03-14', gender: 'Female',
    phone_code: '+234', phone: '08134561098',
    email: 'rukayat.afolabi@yahoo.com',
    address: '25 Ring Road, Ibadan, Oyo',
    blood_group: 'A+',
    nok_name: 'Hakeem Afolabi', nok_phone_code: '+234', nok_phone: '08054561098',
    nok_relationship: 'Husband', nok_address: '25 Ring Road, Ibadan, Oyo',
    hypertension: 'Yes', diabetes: 'Yes', allergies: 'NSAIDs',
    current_medications: 'Losartan 100mg, Metformin 1000mg, Spironolactone 25mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-16', visit_type: 'Follow-up', bp_systolic: 155, bp_diastolic: 98, pulse: 84, temperature: 36.7, weight: 76.0, height: 163, notes: 'Diabetic nephropathy advancing. Foot oedema noted. Dietary referral made.' },
    labs: { creatinine: 4.5, bun: 82, glucose: 195, potassium: 5.0, hemoglobin: 9.8, albumin: 3, hba1c: 9.8, gfr: 19 },
  },

  {
    first_name: 'Uchenna', last_name: 'Obi',
    dob: '1960-07-29', gender: 'Male',
    phone_code: '+234', phone: '08145672109',
    email: null,
    address: '18 Nnewi Road, Awka, Anambra',
    blood_group: 'O+',
    nok_name: 'Adaobi Obi', nok_phone_code: '+234', nok_phone: '08065672109',
    nok_relationship: 'Wife', nok_address: '18 Nnewi Road, Awka, Anambra',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: 'Sodium bicarbonate, Phosphate binders',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-24', visit_type: 'Consultation', bp_systolic: 166, bp_diastolic: 104, pulse: 92, temperature: 37.2, weight: 73.0, height: 172, notes: 'Uraemia symptoms. Nausea and fatigue. Stage 5 CKD nearing dialysis indication.' },
    labs: { creatinine: 9.5, bun: 138, glucose: 145, potassium: 5.7, hemoglobin: 7.5, albumin: 5, hba1c: 5.6, gfr: 8 },
  },

  {
    first_name: 'Aminu', last_name: 'Lawal',
    dob: '1971-09-03', gender: 'Male',
    phone_code: '+234', phone: '08156783210',
    email: 'aminu.lawal@gmail.com',
    address: '9 Emir Palace Road, Katsina',
    blood_group: 'B-',
    nok_name: 'Zainab Lawal', nok_phone_code: '+234', nok_phone: '08076783210',
    nok_relationship: 'Wife', nok_address: '9 Emir Palace Road, Katsina',
    hypertension: 'Yes', diabetes: 'No', allergies: null,
    current_medications: 'Amlodipine 10mg, Furosemide 40mg, Erythropoietin 3000IU',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-03-04', visit_type: 'Routine', bp_systolic: 160, bp_diastolic: 100, pulse: 86, temperature: 36.9, weight: 77.0, height: 174, notes: 'Hypertensive nephropathy. GFR 21 — stable but low. Protein restriction initiated.' },
    labs: { creatinine: 4.8, bun: 88, glucose: 122, potassium: 4.9, hemoglobin: 9.3, albumin: 3, hba1c: 5.9, gfr: 21 },
  },

  {
    first_name: 'Perpetua', last_name: 'Ogbonna',
    dob: '1967-12-11', gender: 'Female',
    phone_code: '+234', phone: '08167894320',
    email: null,
    address: '4 Market Road, Abakaliki, Ebonyi',
    blood_group: 'A+',
    nok_name: 'Sunday Ogbonna', nok_phone_code: '+234', nok_phone: '08087894320',
    nok_relationship: 'Husband', nok_address: '4 Market Road, Abakaliki, Ebonyi',
    hypertension: 'Yes', diabetes: 'Yes', allergies: 'Sulfa drugs',
    current_medications: 'Lisinopril 10mg, Glibenclamide 5mg, Furosemide 80mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-01-26', visit_type: 'Consultation', bp_systolic: 170, bp_diastolic: 108, pulse: 94, temperature: 37.1, weight: 74.0, height: 161, notes: 'Advanced CKD. Double morbidity. Prognosis discussed with family.' },
    labs: { creatinine: 6.8, bun: 112, glucose: 175, potassium: 5.3, hemoglobin: 8.4, albumin: 5, hba1c: 9.4, gfr: 14 },
  },

  {
    first_name: 'Godwin', last_name: 'Nzekwe',
    dob: '1955-04-20', gender: 'Male',
    phone_code: '+234', phone: '08178905431',
    email: null,
    address: '2 Oguta Road, Owerri, Imo',
    blood_group: 'O+',
    nok_name: 'Vera Nzekwe', nok_phone_code: '+234', nok_phone: '08098905431',
    nok_relationship: 'Daughter', nok_address: '2 Oguta Road, Owerri, Imo',
    hypertension: 'Yes', diabetes: 'No', allergies: null,
    current_medications: 'Nifedipine 20mg, Furosemide 40mg, Calcium acetate',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-07', visit_type: 'Follow-up', bp_systolic: 175, bp_diastolic: 108, pulse: 96, temperature: 37.0, weight: 70.0, height: 169, notes: 'Stage 5 CKD. Peritoneal dialysis initiated last month — review appointment.' },
    labs: { creatinine: 8.8, bun: 130, glucose: 138, potassium: 5.6, hemoglobin: 7.9, albumin: 5, hba1c: 5.7, gfr: 9 },
  },

  {
    first_name: 'Zainab', last_name: 'Aliyu',
    dob: '1976-02-28', gender: 'Female',
    phone_code: '+234', phone: '08189016542',
    email: 'zainab.aliyu@outlook.com',
    address: '16 Bompai Road, Kano',
    blood_group: 'B+',
    nok_name: 'Auwal Aliyu', nok_phone_code: '+234', nok_phone: '08109016542',
    nok_relationship: 'Husband', nok_address: '16 Bompai Road, Kano',
    hypertension: 'Yes', diabetes: 'Yes', allergies: null,
    current_medications: 'Amlodipine 10mg, Insulin (Actrapid), Furosemide 40mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-13', visit_type: 'Follow-up', bp_systolic: 155, bp_diastolic: 97, pulse: 86, temperature: 36.8, weight: 67.0, height: 159, notes: 'Worsening diabetic nephropathy. GFR 19. Weight gain from fluid retention.' },
    labs: { creatinine: 5.5, bun: 96, glucose: 185, potassium: 5.1, hemoglobin: 9.1, albumin: 4, hba1c: 9.6, gfr: 19 },
  },

  {
    first_name: 'Taiwo', last_name: 'Olusanya',
    dob: '1961-08-16', gender: 'Male',
    phone_code: '+234', phone: '08110127654',
    email: null,
    address: '33 Obafemi Awolowo Way, Osogbo, Osun',
    blood_group: 'A-',
    nok_name: 'Kehinde Olusanya', nok_phone_code: '+234', nok_phone: '08020127654',
    nok_relationship: 'Twin Brother', nok_address: '33 Obafemi Awolowo Way, Osogbo, Osun',
    hypertension: 'Yes', diabetes: 'Yes', allergies: 'Aspirin',
    current_medications: 'Losartan 100mg, Metformin 500mg, Erythropoietin 4000IU',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-02-20', visit_type: 'Consultation', bp_systolic: 163, bp_diastolic: 103, pulse: 90, temperature: 37.1, weight: 81.0, height: 176, notes: 'Stage 4 CKD, poorly controlled hypertension. Medication compliance issues identified.' },
    labs: { creatinine: 6.0, bun: 105, glucose: 160, potassium: 5.2, hemoglobin: 8.7, albumin: 4, hba1c: 8.9, gfr: 16 },
  },

  {
    first_name: 'Olanrewaju', last_name: 'Fasanya',
    dob: '1970-05-05', gender: 'Male',
    phone_code: '+234', phone: '08121238765',
    email: 'fasanya.ola@gmail.com',
    address: '20 Oshodi-Apapa Expressway, Lagos',
    blood_group: 'O+',
    nok_name: 'Nike Fasanya', nok_phone_code: '+234', nok_phone: '08041238765',
    nok_relationship: 'Wife', nok_address: '20 Oshodi-Apapa Expressway, Lagos',
    hypertension: 'Yes', diabetes: 'No', allergies: null,
    current_medications: 'Amlodipine 5mg, Losartan 50mg, Furosemide 40mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: { visit_date: '2026-01-28', visit_type: 'Routine', bp_systolic: 157, bp_diastolic: 99, pulse: 84, temperature: 36.7, weight: 83.0, height: 177, notes: 'GFR trending down over 12 months. Heavy proteinuria persists. Specialist review scheduled.' },
    labs: { creatinine: 5.0, bun: 92, glucose: 128, potassium: 4.9, hemoglobin: 9.5, albumin: 3, hba1c: 5.8, gfr: 23 },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // MEDIUM RISK — Early / Moderate CKD (10 patients)
  // ════════════════════════════════════════════════════════════════════════════

  {
    first_name: 'Ibrahim', last_name: 'Musa',
    dob: '1998-03-25', gender: 'Male',
    phone_code: '+234', phone: '08178901456',
    email: 'ibrahim.musa@outlook.com',
    address: '7 Sokoto Road, Kano',
    blood_group: 'B-',
    nok_name: 'Hafsat Musa', nok_phone_code: '+234', nok_phone: '08089012456',
    nok_relationship: 'Mother', nok_address: '7 Sokoto Road, Kano',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-03-01', visit_type: 'Routine', bp_systolic: 130, bp_diastolic: 84, pulse: 74, temperature: 36.4, weight: 68.0, height: 176, notes: 'Early CKD detected incidentally. Trace proteinuria. 3-month follow-up arranged.' },
    labs: { creatinine: 2.8, bun: 45, glucose: 110, potassium: 4.0, hemoglobin: 12.0, albumin: 1, hba1c: 5.3, gfr: 35 },
  },

  {
    first_name: 'Blessing', last_name: 'Uchenna',
    dob: '1975-06-22', gender: 'Female',
    phone_code: '+234', phone: '08176543210',
    email: 'blessing.uchenna@gmail.com',
    address: '14 Owerri Road, Orlu, Imo',
    blood_group: 'B+',
    nok_name: 'Emeka Uchenna', nok_phone_code: '+234', nok_phone: '08087654321',
    nok_relationship: 'Husband', nok_address: '14 Owerri Road, Orlu, Imo',
    hypertension: 'Yes', diabetes: 'No', allergies: 'Aspirin',
    current_medications: 'Lisinopril 10mg, Furosemide 20mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-02-06', visit_type: 'Consultation', bp_systolic: 142, bp_diastolic: 90, pulse: 80, temperature: 36.7, weight: 72.0, height: 164, notes: 'Moderate CKD with hypertension. Quarterly monitoring plan initiated.' },
    labs: { creatinine: 3.1, bun: 52, glucose: 115, potassium: 4.3, hemoglobin: 11.5, albumin: 2, hba1c: 5.7, gfr: 32 },
  },

  {
    first_name: 'Grace', last_name: 'Taiwo',
    dob: '1983-09-07', gender: 'Female',
    phone_code: '+234', phone: '08109876543',
    email: 'grace.taiwo@yahoo.com',
    address: '61 Agbowo Estate, Ibadan, Oyo',
    blood_group: 'O+',
    nok_name: 'Sunday Taiwo', nok_phone_code: '+234', nok_phone: '08120987654',
    nok_relationship: 'Husband', nok_address: '61 Agbowo Estate, Ibadan, Oyo',
    hypertension: 'No', diabetes: 'Yes', allergies: null,
    current_medications: 'Insulin (Mixtard 30), Sitagliptin 100mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-02-28', visit_type: 'Follow-up', bp_systolic: 128, bp_diastolic: 82, pulse: 76, temperature: 36.6, weight: 74.0, height: 162, notes: 'Diabetic nephropathy developing. HbA1c above target. Insulin regimen adjusted.' },
    labs: { creatinine: 2.2, bun: 38, glucose: 168, potassium: 4.5, hemoglobin: 11.8, albumin: 2, hba1c: 8.3, gfr: 40 },
  },

  {
    first_name: 'Toluwani', last_name: 'Adegoke',
    dob: '1987-04-18', gender: 'Female',
    phone_code: '+234', phone: '08132108765',
    email: 'toluwani.adegoke@gmail.com',
    address: '8 Eko Bridge Road, Lagos',
    blood_group: 'A+',
    nok_name: 'Adekunle Adegoke', nok_phone_code: '+234', nok_phone: '08052108765',
    nok_relationship: 'Husband', nok_address: '8 Eko Bridge Road, Lagos',
    hypertension: 'Yes', diabetes: 'No', allergies: null,
    current_medications: 'Enalapril 5mg, Amlodipine 5mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-02-04', visit_type: 'Routine', bp_systolic: 138, bp_diastolic: 88, pulse: 76, temperature: 36.5, weight: 68.0, height: 165, notes: 'Mild CKD noted on routine check. Proteinuria grade 1. 6-month monitoring plan.' },
    labs: { creatinine: 1.8, bun: 32, glucose: 108, potassium: 4.2, hemoglobin: 12.5, albumin: 1, hba1c: 5.8, gfr: 48 },
  },

  {
    first_name: 'Shehu', last_name: 'Umar',
    dob: '1980-11-29', gender: 'Male',
    phone_code: '+234', phone: '08143219876',
    email: null,
    address: '6 Maiduguri Road, Gombe',
    blood_group: 'O+',
    nok_name: 'Fanna Umar', nok_phone_code: '+234', nok_phone: '08063219876',
    nok_relationship: 'Wife', nok_address: '6 Maiduguri Road, Gombe',
    hypertension: 'No', diabetes: 'Yes', allergies: null,
    current_medications: 'Metformin 1000mg, Glibenclamide 5mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-02-19', visit_type: 'Follow-up', bp_systolic: 132, bp_diastolic: 85, pulse: 78, temperature: 36.6, weight: 76.0, height: 172, notes: 'Diabetic nephropathy early stage. Microalbuminuria confirmed. Tighter glucose control advised.' },
    labs: { creatinine: 2.0, bun: 36, glucose: 152, potassium: 4.6, hemoglobin: 12.2, albumin: 2, hba1c: 8.0, gfr: 44 },
  },

  {
    first_name: 'Ifeoma', last_name: 'Eze',
    dob: '1990-07-08', gender: 'Female',
    phone_code: '+234', phone: '08154330987',
    email: 'ifeoma.eze@gmail.com',
    address: '11 Presidential Road, Enugu',
    blood_group: 'B+',
    nok_name: 'Chukwudi Eze', nok_phone_code: '+234', nok_phone: '08074330987',
    nok_relationship: 'Brother', nok_address: '11 Presidential Road, Enugu',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-03-07', visit_type: 'Consultation', bp_systolic: 126, bp_diastolic: 80, pulse: 70, temperature: 36.3, weight: 60.0, height: 162, notes: 'Mild CKD found during pre-employment screening. No comorbidities. 6-month review.' },
    labs: { creatinine: 1.6, bun: 28, glucose: 98, potassium: 3.9, hemoglobin: 12.8, albumin: 1, hba1c: 5.4, gfr: 52 },
  },

  {
    first_name: 'Bola', last_name: 'Adewumi',
    dob: '1977-02-12', gender: 'Male',
    phone_code: '+234', phone: '08165441098',
    email: 'bola.adewumi@yahoo.com',
    address: '40 Ikorodu Road, Lagos',
    blood_group: 'A-',
    nok_name: 'Yetunde Adewumi', nok_phone_code: '+234', nok_phone: '08085441098',
    nok_relationship: 'Wife', nok_address: '40 Ikorodu Road, Lagos',
    hypertension: 'Yes', diabetes: 'No', allergies: 'Penicillin',
    current_medications: 'Losartan 50mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-01-24', visit_type: 'Follow-up', bp_systolic: 140, bp_diastolic: 90, pulse: 80, temperature: 36.6, weight: 82.0, height: 178, notes: 'Mild-moderate CKD with hypertension. GFR 45. Salt restriction reinforced.' },
    labs: { creatinine: 1.9, bun: 34, glucose: 112, potassium: 4.1, hemoglobin: 12.4, albumin: 1, hba1c: 5.9, gfr: 45 },
  },

  {
    first_name: 'Yahaya', last_name: 'Dankolo',
    dob: '1985-08-23', gender: 'Male',
    phone_code: '+234', phone: '08176552109',
    email: null,
    address: '2 Ribadu Road, Yola, Adamawa',
    blood_group: 'O+',
    nok_name: 'Hauwa Dankolo', nok_phone_code: '+234', nok_phone: '08096552109',
    nok_relationship: 'Wife', nok_address: '2 Ribadu Road, Yola, Adamawa',
    hypertension: 'Yes', diabetes: 'Yes', allergies: null,
    current_medications: 'Enalapril 10mg, Metformin 500mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-02-22', visit_type: 'Routine', bp_systolic: 136, bp_diastolic: 87, pulse: 78, temperature: 36.5, weight: 74.0, height: 174, notes: 'Both hypertension and early diabetes noted. CKD Stage 3a. Close monitoring essential.' },
    labs: { creatinine: 2.4, bun: 42, glucose: 145, potassium: 4.4, hemoglobin: 11.9, albumin: 2, hba1c: 7.8, gfr: 38 },
  },

  {
    first_name: 'Stella', last_name: 'Ochukwu',
    dob: '1982-12-04', gender: 'Female',
    phone_code: '+234', phone: '08187663210',
    email: 'stella.ochukwu@gmail.com',
    address: '17 Agbani Road, Enugu',
    blood_group: 'O-',
    nok_name: 'Eze Ochukwu', nok_phone_code: '+234', nok_phone: '08107663210',
    nok_relationship: 'Husband', nok_address: '17 Agbani Road, Enugu',
    hypertension: 'No', diabetes: 'Yes', allergies: null,
    current_medications: 'Metformin 1000mg, Linagliptin 5mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-03-14', visit_type: 'Follow-up', bp_systolic: 124, bp_diastolic: 80, pulse: 72, temperature: 36.4, weight: 65.0, height: 163, notes: 'Diabetic CKD Stage 3a. Glucose improving with new regimen. Continue quarterly monitoring.' },
    labs: { creatinine: 1.7, bun: 30, glucose: 138, potassium: 4.1, hemoglobin: 12.6, albumin: 1, hba1c: 7.5, gfr: 50 },
  },

  {
    first_name: 'Kunle', last_name: 'Fasanya',
    dob: '1979-06-17', gender: 'Male',
    phone_code: '+234', phone: '08198774321',
    email: 'kunle.fasanya@gmail.com',
    address: '28 Ojoo Road, Ibadan, Oyo',
    blood_group: 'B+',
    nok_name: 'Sola Fasanya', nok_phone_code: '+234', nok_phone: '08018774321',
    nok_relationship: 'Wife', nok_address: '28 Ojoo Road, Ibadan, Oyo',
    hypertension: 'Yes', diabetes: 'No', allergies: null,
    current_medications: 'Amlodipine 5mg, Irbesartan 150mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: { visit_date: '2026-01-31', visit_type: 'Routine', bp_systolic: 144, bp_diastolic: 92, pulse: 82, temperature: 36.7, weight: 79.0, height: 175, notes: 'Hypertensive CKD Stage 3a. BP improved on current regimen. Maintain current treatment.' },
    labs: { creatinine: 2.1, bun: 40, glucose: 106, potassium: 4.0, hemoglobin: 12.1, albumin: 1, hba1c: 5.6, gfr: 42 },
  },

  // ════════════════════════════════════════════════════════════════════════════
  // LOW RISK — No CKD / Stage 1 (20 patients)
  // ════════════════════════════════════════════════════════════════════════════

  {
    first_name: 'Tunde', last_name: 'Abiodun',
    dob: '1994-06-18', gender: 'Male',
    phone_code: '+234', phone: '08101234567',
    email: 'tunde.abiodun@gmail.com',
    address: '7 Bodija Estate, Ibadan, Oyo',
    blood_group: 'O+',
    nok_name: 'Folake Abiodun', nok_phone_code: '+234', nok_phone: '08021234567',
    nok_relationship: 'Mother', nok_address: '7 Bodija Estate, Ibadan, Oyo',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-10', visit_type: 'Routine', bp_systolic: 118, bp_diastolic: 76, pulse: 68, temperature: 36.4, weight: 76.0, height: 180, notes: 'Annual kidney screening. All parameters normal. Family history of hypertension — annual follow-up.' },
    labs: { creatinine: 0.8, bun: 20, glucose: 95, potassium: 4.1, hemoglobin: 14.5, albumin: 0, hba1c: 5.1, gfr: 90 },
  },

  {
    first_name: 'Chioma', last_name: 'Nwosu',
    dob: '1999-12-05', gender: 'Female',
    phone_code: '+234', phone: '08112345670',
    email: 'chioma.nwosu@gmail.com',
    address: '12 Awolowo Road, Ikoyi, Lagos',
    blood_group: 'A+',
    nok_name: 'Emeka Nwosu', nok_phone_code: '+234', nok_phone: '08032345670',
    nok_relationship: 'Father', nok_address: '12 Awolowo Road, Ikoyi, Lagos',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-14', visit_type: 'Routine', bp_systolic: 112, bp_diastolic: 72, pulse: 65, temperature: 36.3, weight: 58.0, height: 165, notes: 'Routine check-up. Kidney function entirely normal.' },
    labs: { creatinine: 0.9, bun: 18, glucose: 88, potassium: 4.3, hemoglobin: 13.8, albumin: 0, hba1c: 4.9, gfr: 95 },
  },

  {
    first_name: 'Babajide', last_name: 'Ogundimu',
    dob: '1984-01-22', gender: 'Male',
    phone_code: '+234', phone: '08123456780',
    email: 'babajide.ogundimu@yahoo.com',
    address: '22 Allen Avenue, Ikeja, Lagos',
    blood_group: 'B+',
    nok_name: 'Shade Ogundimu', nok_phone_code: '+234', nok_phone: '08043456780',
    nok_relationship: 'Wife', nok_address: '22 Allen Avenue, Ikeja, Lagos',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-03-08', visit_type: 'Routine', bp_systolic: 122, bp_diastolic: 78, pulse: 70, temperature: 36.5, weight: 80.0, height: 177, notes: 'Annual health check. All kidney markers normal.' },
    labs: { creatinine: 1.0, bun: 25, glucose: 102, potassium: 4.2, hemoglobin: 14.2, albumin: 0, hba1c: 5.4, gfr: 85 },
  },

  {
    first_name: 'Onyeka', last_name: 'Obiora',
    dob: '1988-10-30', gender: 'Female',
    phone_code: '+234', phone: '08134567890',
    email: 'onyeka.obiora@gmail.com',
    address: '9 Independence Layout, Enugu',
    blood_group: 'AB+',
    nok_name: 'Uche Obiora', nok_phone_code: '+234', nok_phone: '08054567890',
    nok_relationship: 'Husband', nok_address: '9 Independence Layout, Enugu',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-03-12', visit_type: 'Routine', bp_systolic: 116, bp_diastolic: 74, pulse: 66, temperature: 36.4, weight: 62.0, height: 163, notes: 'Kidney screening — family history of CKD. All results normal.' },
    labs: { creatinine: 0.7, bun: 22, glucose: 92, potassium: 4.0, hemoglobin: 13.5, albumin: 0, hba1c: 5.0, gfr: 88 },
  },

  {
    first_name: 'Sade', last_name: 'Oduya',
    dob: '1995-03-11', gender: 'Female',
    phone_code: '+234', phone: '08145678012',
    email: 'sade.oduya@gmail.com',
    address: '15 Ife Road, Ile-Ife, Osun',
    blood_group: 'O+',
    nok_name: 'Bisi Oduya', nok_phone_code: '+234', nok_phone: '08065678012',
    nok_relationship: 'Mother', nok_address: '15 Ife Road, Ile-Ife, Osun',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-01-18', visit_type: 'Routine', bp_systolic: 110, bp_diastolic: 70, pulse: 64, temperature: 36.3, weight: 55.0, height: 163, notes: 'Pre-marital health screening. All systems normal.' },
    labs: { creatinine: 0.7, bun: 16, glucose: 86, potassium: 3.9, hemoglobin: 13.2, albumin: 0, hba1c: 4.8, gfr: 100 },
  },

  {
    first_name: 'Chike', last_name: 'Okafor',
    dob: '1993-08-07', gender: 'Male',
    phone_code: '+234', phone: '08156789123',
    email: 'chike.okafor@gmail.com',
    address: '5 Nkwo Nike Road, Enugu',
    blood_group: 'A+',
    nok_name: 'Ngozi Okafor', nok_phone_code: '+234', nok_phone: '08076789123',
    nok_relationship: 'Mother', nok_address: '5 Nkwo Nike Road, Enugu',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-01', visit_type: 'Routine', bp_systolic: 120, bp_diastolic: 78, pulse: 68, temperature: 36.4, weight: 72.0, height: 178, notes: 'Routine screening. No concerns. Normal kidney function.' },
    labs: { creatinine: 0.9, bun: 19, glucose: 94, potassium: 4.2, hemoglobin: 14.8, albumin: 0, hba1c: 5.2, gfr: 92 },
  },

  {
    first_name: 'Femi', last_name: 'Adesanya',
    dob: '1991-01-14', gender: 'Male',
    phone_code: '+234', phone: '08167890234',
    email: 'femi.adesanya@outlook.com',
    address: '30 Agodi Road, Ibadan, Oyo',
    blood_group: 'B-',
    nok_name: 'Yemi Adesanya', nok_phone_code: '+234', nok_phone: '08087890234',
    nok_relationship: 'Wife', nok_address: '30 Agodi Road, Ibadan, Oyo',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-08', visit_type: 'Routine', bp_systolic: 116, bp_diastolic: 74, pulse: 66, temperature: 36.4, weight: 74.0, height: 175, notes: 'Employer-mandated annual check. All parameters within normal range.' },
    labs: { creatinine: 0.8, bun: 21, glucose: 90, potassium: 4.0, hemoglobin: 14.9, albumin: 0, hba1c: 5.1, gfr: 96 },
  },

  {
    first_name: 'Halima', last_name: 'Usman',
    dob: '1996-05-20', gender: 'Female',
    phone_code: '+234', phone: '08178901345',
    email: 'halima.usman@yahoo.com',
    address: '8 Tudun Wada, Jos, Plateau',
    blood_group: 'O+',
    nok_name: 'Abubakar Usman', nok_phone_code: '+234', nok_phone: '08098901345',
    nok_relationship: 'Father', nok_address: '8 Tudun Wada, Jos, Plateau',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-17', visit_type: 'Routine', bp_systolic: 108, bp_diastolic: 68, pulse: 62, temperature: 36.2, weight: 52.0, height: 160, notes: 'Health screening for student visa. All results normal.' },
    labs: { creatinine: 0.6, bun: 15, glucose: 84, potassium: 3.8, hemoglobin: 12.9, albumin: 0, hba1c: 4.7, gfr: 105 },
  },

  {
    first_name: 'Emeka', last_name: 'Igwe',
    dob: '1989-11-25', gender: 'Male',
    phone_code: '+234', phone: '08189012456',
    email: 'emeka.igwe@gmail.com',
    address: '3 Uruagu Road, Nnewi, Anambra',
    blood_group: 'AB-',
    nok_name: 'Adaeze Igwe', nok_phone_code: '+234', nok_phone: '08109012456',
    nok_relationship: 'Wife', nok_address: '3 Uruagu Road, Nnewi, Anambra',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-26', visit_type: 'Routine', bp_systolic: 124, bp_diastolic: 80, pulse: 72, temperature: 36.5, weight: 78.0, height: 176, notes: 'Routine screening. No issues identified. Annual follow-up advised.' },
    labs: { creatinine: 1.0, bun: 22, glucose: 97, potassium: 4.1, hemoglobin: 14.0, albumin: 0, hba1c: 5.3, gfr: 87 },
  },

  {
    first_name: 'Kemi', last_name: 'Oladipo',
    dob: '1997-07-09', gender: 'Female',
    phone_code: '+234', phone: '08110123567',
    email: 'kemi.oladipo@gmail.com',
    address: '21 Secretariat Road, Akure, Ondo',
    blood_group: 'A+',
    nok_name: 'Sola Oladipo', nok_phone_code: '+234', nok_phone: '08030123567',
    nok_relationship: 'Mother', nok_address: '21 Secretariat Road, Akure, Ondo',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-03-03', visit_type: 'Routine', bp_systolic: 106, bp_diastolic: 68, pulse: 60, temperature: 36.3, weight: 54.0, height: 162, notes: 'Requested general health check. Kidney function entirely normal.' },
    labs: { creatinine: 0.7, bun: 17, glucose: 88, potassium: 3.9, hemoglobin: 13.1, albumin: 0, hba1c: 4.9, gfr: 102 },
  },

  {
    first_name: 'Balarabe', last_name: 'Shehu',
    dob: '1986-04-03', gender: 'Male',
    phone_code: '+234', phone: '08121234678',
    email: null,
    address: '10 Kawo Road, Kaduna',
    blood_group: 'O+',
    nok_name: 'Rabi Shehu', nok_phone_code: '+234', nok_phone: '08041234678',
    nok_relationship: 'Wife', nok_address: '10 Kawo Road, Kaduna',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-01-16', visit_type: 'Routine', bp_systolic: 120, bp_diastolic: 76, pulse: 68, temperature: 36.5, weight: 75.0, height: 174, notes: 'Pre-employment medical check. All values within normal limits.' },
    labs: { creatinine: 0.9, bun: 20, glucose: 96, potassium: 4.2, hemoglobin: 14.6, albumin: 0, hba1c: 5.2, gfr: 91 },
  },

  {
    first_name: 'Ada', last_name: 'Eze',
    dob: '2000-02-14', gender: 'Female',
    phone_code: '+234', phone: '08132345789',
    email: 'ada.eze@gmail.com',
    address: '6 Trans Ekulu, Enugu',
    blood_group: 'B+',
    nok_name: 'Charles Eze', nok_phone_code: '+234', nok_phone: '08052345789',
    nok_relationship: 'Father', nok_address: '6 Trans Ekulu, Enugu',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-21', visit_type: 'Routine', bp_systolic: 110, bp_diastolic: 70, pulse: 63, temperature: 36.3, weight: 56.0, height: 164, notes: 'University medical. No issues. Healthy young female.' },
    labs: { creatinine: 0.7, bun: 14, glucose: 82, potassium: 3.8, hemoglobin: 13.4, albumin: 0, hba1c: 4.8, gfr: 103 },
  },

  {
    first_name: 'Rotimi', last_name: 'Badmus',
    dob: '1992-09-30', gender: 'Male',
    phone_code: '+234', phone: '08143456890',
    email: 'rotimi.badmus@yahoo.com',
    address: '17 Oke Ado Road, Ibadan, Oyo',
    blood_group: 'A+',
    nok_name: 'Tosin Badmus', nok_phone_code: '+234', nok_phone: '08063456890',
    nok_relationship: 'Wife', nok_address: '17 Oke Ado Road, Ibadan, Oyo',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-03-09', visit_type: 'Routine', bp_systolic: 118, bp_diastolic: 74, pulse: 67, temperature: 36.4, weight: 77.0, height: 179, notes: 'Annual well-man check. Kidney function excellent.' },
    labs: { creatinine: 0.8, bun: 19, glucose: 93, potassium: 4.1, hemoglobin: 15.0, albumin: 0, hba1c: 5.0, gfr: 94 },
  },

  {
    first_name: 'Jamila', last_name: 'Abdullahi',
    dob: '1998-06-22', gender: 'Female',
    phone_code: '+234', phone: '08154568901',
    email: 'jamila.abdullahi@gmail.com',
    address: '4 GRA Maiduguri, Borno',
    blood_group: 'O-',
    nok_name: 'Falmata Abdullahi', nok_phone_code: '+234', nok_phone: '08074568901',
    nok_relationship: 'Mother', nok_address: '4 GRA Maiduguri, Borno',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-01-23', visit_type: 'Routine', bp_systolic: 108, bp_diastolic: 68, pulse: 61, temperature: 36.2, weight: 53.0, height: 161, notes: 'NGO health screening camp. Normal findings.' },
    labs: { creatinine: 0.6, bun: 16, glucose: 85, potassium: 3.9, hemoglobin: 13.0, albumin: 0, hba1c: 4.8, gfr: 106 },
  },

  {
    first_name: 'Ikenna', last_name: 'Nweze',
    dob: '1990-03-18', gender: 'Male',
    phone_code: '+234', phone: '08165679012',
    email: 'ikenna.nweze@outlook.com',
    address: '9 Umuawulu Road, Awka, Anambra',
    blood_group: 'B+',
    nok_name: 'Obioma Nweze', nok_phone_code: '+234', nok_phone: '08085679012',
    nok_relationship: 'Wife', nok_address: '9 Umuawulu Road, Awka, Anambra',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-05', visit_type: 'Routine', bp_systolic: 122, bp_diastolic: 78, pulse: 70, temperature: 36.5, weight: 76.0, height: 177, notes: 'Routine check at request of patient. All within normal range.' },
    labs: { creatinine: 1.0, bun: 23, glucose: 99, potassium: 4.3, hemoglobin: 14.3, albumin: 0, hba1c: 5.3, gfr: 88 },
  },

  {
    first_name: 'Toyin', last_name: 'Adeleke',
    dob: '1993-11-08', gender: 'Female',
    phone_code: '+234', phone: '08176790123',
    email: 'toyin.adeleke@gmail.com',
    address: '50 Gbagura Street, Abeokuta, Ogun',
    blood_group: 'A-',
    nok_name: 'Lekan Adeleke', nok_phone_code: '+234', nok_phone: '08096790123',
    nok_relationship: 'Husband', nok_address: '50 Gbagura Street, Abeokuta, Ogun',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-27', visit_type: 'Routine', bp_systolic: 112, bp_diastolic: 72, pulse: 65, temperature: 36.3, weight: 58.0, height: 162, notes: 'Routine annual screening. No abnormalities detected.' },
    labs: { creatinine: 0.8, bun: 18, glucose: 90, potassium: 4.0, hemoglobin: 13.3, albumin: 0, hba1c: 5.0, gfr: 97 },
  },

  {
    first_name: 'Suleiman', last_name: 'Bawa',
    dob: '1987-07-13', gender: 'Male',
    phone_code: '+234', phone: '08187801234',
    email: null,
    address: '1 Dutse Road, Jigawa',
    blood_group: 'O+',
    nok_name: 'Hauwa Bawa', nok_phone_code: '+234', nok_phone: '08107801234',
    nok_relationship: 'Wife', nok_address: '1 Dutse Road, Jigawa',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-03-15', visit_type: 'Routine', bp_systolic: 118, bp_diastolic: 76, pulse: 68, temperature: 36.4, weight: 73.0, height: 173, notes: 'Annual health check. No issues found.' },
    labs: { creatinine: 0.9, bun: 21, glucose: 94, potassium: 4.2, hemoglobin: 14.7, albumin: 0, hba1c: 5.2, gfr: 90 },
  },

  {
    first_name: 'Chinwe', last_name: 'Obi',
    dob: '2001-04-02', gender: 'Female',
    phone_code: '+234', phone: '08198912345',
    email: 'chinwe.obi@gmail.com',
    address: '13 Asata Road, Enugu',
    blood_group: 'B+',
    nok_name: 'Chukwudi Obi', nok_phone_code: '+234', nok_phone: '08018912345',
    nok_relationship: 'Father', nok_address: '13 Asata Road, Enugu',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-01-21', visit_type: 'Routine', bp_systolic: 106, bp_diastolic: 66, pulse: 60, temperature: 36.2, weight: 52.0, height: 163, notes: 'Youth health camp screening. Excellent kidney function.' },
    labs: { creatinine: 0.6, bun: 14, glucose: 84, potassium: 3.8, hemoglobin: 12.8, albumin: 0, hba1c: 4.7, gfr: 104 },
  },

  {
    first_name: 'Deji', last_name: 'Olawale',
    dob: '1985-10-16', gender: 'Male',
    phone_code: '+234', phone: '08110023456',
    email: 'deji.olawale@yahoo.com',
    address: '32 Lagos-Badagry Expressway, Lagos',
    blood_group: 'AB+',
    nok_name: 'Ola Olawale', nok_phone_code: '+234', nok_phone: '08030023456',
    nok_relationship: 'Wife', nok_address: '32 Lagos-Badagry Expressway, Lagos',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-03-17', visit_type: 'Routine', bp_systolic: 120, bp_diastolic: 78, pulse: 70, temperature: 36.5, weight: 80.0, height: 178, notes: 'Routine annual check. No health concerns reported.' },
    labs: { creatinine: 0.9, bun: 22, glucose: 97, potassium: 4.1, hemoglobin: 14.4, albumin: 0, hba1c: 5.2, gfr: 89 },
  },

  {
    first_name: 'Aisha', last_name: 'Sani',
    dob: '2002-08-27', gender: 'Female',
    phone_code: '+234', phone: '08121134567',
    email: 'aisha.sani@gmail.com',
    address: '7 Buk Road, Kano',
    blood_group: 'O+',
    nok_name: 'Sanusi Sani', nok_phone_code: '+234', nok_phone: '08041134567',
    nok_relationship: 'Father', nok_address: '7 Buk Road, Kano',
    hypertension: 'No', diabetes: 'No', allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: { visit_date: '2026-02-12', visit_type: 'Routine', bp_systolic: 104, bp_diastolic: 66, pulse: 60, temperature: 36.2, weight: 50.0, height: 160, notes: 'University admission medical. Normal results across the board.' },
    labs: { creatinine: 0.6, bun: 13, glucose: 82, potassium: 3.8, hemoglobin: 12.6, albumin: 0, hba1c: 4.7, gfr: 107 },
  },

];

async function seedPatients() {
  console.log('Seeding 50 UCI-based patients...\n');

  const client = await pool.connect();
  try {
    const { rows: users } = await client.query(
      `SELECT id, name, role FROM users WHERE role IN ('clinician', 'records_officer') LIMIT 2`
    );
    const clinician      = users.find(u => u.role === 'clinician')       || users[0];
    const recordsOfficer = users.find(u => u.role === 'records_officer') || users[0];

    console.log(`  Clinician:        ${clinician?.name}`);
    console.log(`  Records Officer:  ${recordsOfficer?.name}\n`);

    // Clear existing patients (cascade deletes visits, labs, predictions)
    await client.query('DELETE FROM patients');
    await client.query('ALTER SEQUENCE patient_id_seq RESTART WITH 1');
    console.log('  Cleared existing patients.\n');

    // Shuffle so patient IDs are not grouped by risk level
    for (let i = PATIENTS.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [PATIENTS[i], PATIENTS[j]] = [PATIENTS[j], PATIENTS[i]];
    }

    for (const p of PATIENTS) {
      await client.query('BEGIN');

      // 1. Insert patient
      const { rows: patRows } = await client.query(
        `INSERT INTO patients (
           first_name, last_name, dob, gender,
           phone_code, phone, email, address, blood_group,
           nok_name, nok_phone_code, nok_phone, nok_relationship, nok_address,
           hypertension, diabetes, allergies, current_medications,
           ckd_stage, ckd_risk, created_by
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,
           $10,$11,$12,$13,$14,
           $15,$16,$17,$18,
           $19,$20,$21
         ) RETURNING id`,
        [
          p.first_name, p.last_name, p.dob, p.gender,
          p.phone_code, p.phone, p.email, p.address, p.blood_group,
          p.nok_name, p.nok_phone_code, p.nok_phone, p.nok_relationship, p.nok_address,
          p.hypertension, p.diabetes, p.allergies, p.current_medications,
          p.ckd_stage, p.ckd_risk, recordsOfficer?.id,
        ]
      );
      const patientId = patRows[0].id;

      // 2. Insert visit
      const { rows: visitRows } = await client.query(
        `INSERT INTO visits (
           patient_id, clinician_id, visit_date, visit_type,
           bp_systolic, bp_diastolic, pulse, temperature, weight, height, notes
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          patientId, clinician?.id,
          p.visit.visit_date, p.visit.visit_type,
          p.visit.bp_systolic, p.visit.bp_diastolic, p.visit.pulse,
          p.visit.temperature, p.visit.weight, p.visit.height, p.visit.notes,
        ]
      );
      const visitId = visitRows[0].id;

      // 3. Insert lab results
      await client.query(
        `INSERT INTO lab_results (
           visit_id, patient_id,
           creatinine, bun, glucose, potassium, hemoglobin, albumin, hba1c, gfr
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          visitId, patientId,
          p.labs.creatinine, p.labs.bun, p.labs.glucose, p.labs.potassium,
          p.labs.hemoglobin, p.labs.albumin, p.labs.hba1c, p.labs.gfr,
        ]
      );

      await client.query('COMMIT');

      const icon = p.ckd_risk === 'high' ? 'HIGH  ' : p.ckd_risk === 'medium' ? 'MED   ' : 'LOW   ';
      console.log(`  [${icon}]  ${patientId}  ${(p.first_name + ' ' + p.last_name).padEnd(26)}  Creat: ${String(p.labs.creatinine).padEnd(5)}  Hb: ${String(p.labs.hemoglobin).padEnd(5)}  GFR: ${p.labs.gfr}`);
    }

    console.log('\n  50 UCI-based patients seeded successfully.');
    console.log('  20 High risk  |  10 Medium risk  |  20 Low risk\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPatients();
