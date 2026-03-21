// =============================================================================
// NephroTrack — Patient Seed Script
// Inserts 5 demo patients with visits, lab results, and predictions.
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

// ── 5 demo patients (realistic Nigerian clinical profiles) ────────────────────
const DEMO_PATIENTS = [
  {
    // ── High risk — long-standing CKD with hypertension + diabetes ──────────
    first_name: 'Emeka',
    last_name:  'Adebayo',
    dob:        '1966-03-15',
    gender:     'Male',
    phone_code: '+234', phone: '08023456789',
    email:      'emeka.adebayo@gmail.com',
    address:    '12 Awolowo Road, Ikoyi, Lagos',
    blood_group: 'O+',
    nok_name: 'Ngozi Adebayo', nok_phone_code: '+234', nok_phone: '08134567890',
    nok_relationship: 'Wife', nok_address: '12 Awolowo Road, Ikoyi, Lagos',
    hypertension: 'Yes', diabetes: 'Yes',
    allergies: 'Penicillin',
    current_medications: 'Amlodipine 10mg, Metformin 500mg, Lisinopril 5mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: {
      visit_date: '2026-02-20', visit_type: 'Follow-up',
      bp_systolic: 168, bp_diastolic: 102, pulse: 88,
      temperature: 36.8, weight: 82.5, height: 175,
      notes: 'Patient reports fatigue and reduced urine output. BP remains elevated despite medication. Creatinine trending upward — consider nephrology referral.',
    },
    labs: { creatinine: 3.8, bun: 42, glucose: 185, potassium: 5.6, hemoglobin: 9.8, albumin: 3.1, hba1c: 8.2, gfr: 18 },
    prediction: {
      risk_score: 84, risk_level: 'high', ckd_stage: 'Stage 3b / Stage 4+',
      recommendation: 'High risk of CKD progression. Urgent nephrology consultation recommended. Close monitoring of GFR and creatinine required. Evaluate for renal replacement therapy preparation.',
      inputs: { age: 59, bpSystolic: 168, bpDiastolic: 102, glucose: 185, bun: 42, creatinine: 3.8, potassium: 5.6, hemoglobin: 9.8, albumin: 3.1, gfr: 18, hypertension: true, diabetes: true },
    },
  },

  {
    // ── Medium risk — hypertensive, early CKD signs ──────────────────────────
    first_name: 'Fatima',
    last_name:  'Bello',
    dob:        '1980-11-08',
    gender:     'Female',
    phone_code: '+234', phone: '08156781234',
    email:      'fatima.bello@yahoo.com',
    address:    '45 Sultan Road, Kaduna',
    blood_group: 'A+',
    nok_name: 'Aliyu Bello', nok_phone_code: '+234', nok_phone: '08067890123',
    nok_relationship: 'Husband', nok_address: '45 Sultan Road, Kaduna',
    hypertension: 'Yes', diabetes: 'No',
    allergies: null,
    current_medications: 'Losartan 50mg, Hydrochlorothiazide 12.5mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: {
      visit_date: '2026-02-18', visit_type: 'Routine',
      bp_systolic: 148, bp_diastolic: 94, pulse: 76,
      temperature: 36.5, weight: 68.0, height: 163,
      notes: 'Mild proteinuria noted on urinalysis. BP slightly above target. Advised dietary salt restriction and increased fluid intake.',
    },
    labs: { creatinine: 1.6, bun: 22, glucose: 98, potassium: 4.2, hemoglobin: 11.8, albumin: 3.8, hba1c: 5.6, gfr: 52 },
    prediction: {
      risk_score: 47, risk_level: 'medium', ckd_stage: 'Stage 2 / Stage 3a',
      recommendation: 'Moderate risk detected. Recommend quarterly monitoring, blood pressure control, dietary consultation. Consider nephrology referral if trend worsens.',
      inputs: { age: 45, bpSystolic: 148, bpDiastolic: 94, glucose: 98, bun: 22, creatinine: 1.6, potassium: 4.2, hemoglobin: 11.8, albumin: 3.8, gfr: 52, hypertension: true, diabetes: false },
    },
  },

  {
    // ── High risk — elderly, advanced CKD, multiple comorbidities ────────────
    first_name: 'Sunday',
    last_name:  'Okafor',
    dob:        '1954-07-22',
    gender:     'Male',
    phone_code: '+234', phone: '08098765432',
    email:      null,
    address:    '8 New Market Road, Onitsha, Anambra',
    blood_group: 'B+',
    nok_name: 'Chinyere Okafor', nok_phone_code: '+234', nok_phone: '08187654321',
    nok_relationship: 'Daughter', nok_address: '22 Zik Avenue, Awka, Anambra',
    hypertension: 'Yes', diabetes: 'Yes',
    allergies: 'Sulfonamides',
    current_medications: 'Nifedipine 20mg, Insulin (Mixtard 30), Furosemide 40mg, Calcium carbonate 500mg',
    ckd_stage: 'Stage 3b / Stage 4+', ckd_risk: 'high',
    visit: {
      visit_date: '2026-02-24', visit_type: 'Consultation',
      bp_systolic: 182, bp_diastolic: 110, pulse: 92,
      temperature: 37.1, weight: 74.0, height: 170,
      notes: 'Presenting with worsening oedema, shortness of breath on exertion. Urine output markedly reduced. Urgent nephrology review arranged. Patient and family counselled on stage 4 CKD management.',
    },
    labs: { creatinine: 5.2, bun: 68, glucose: 210, potassium: 6.1, hemoglobin: 8.4, albumin: 2.7, hba1c: 9.1, gfr: 11 },
    prediction: {
      risk_score: 95, risk_level: 'high', ckd_stage: 'Stage 3b / Stage 4+',
      recommendation: 'High risk of CKD progression. Urgent nephrology consultation recommended. Close monitoring of GFR and creatinine required. Evaluate for renal replacement therapy preparation.',
      inputs: { age: 71, bpSystolic: 182, bpDiastolic: 110, glucose: 210, bun: 68, creatinine: 5.2, potassium: 6.1, hemoglobin: 8.4, albumin: 2.7, gfr: 11, hypertension: true, diabetes: true },
    },
  },

  {
    // ── Medium risk — diabetic, moderate kidney involvement ──────────────────
    first_name: 'Aisha',
    last_name:  'Mustapha',
    dob:        '1978-04-30',
    gender:     'Female',
    phone_code: '+234', phone: '08145678901',
    email:      'aisha.mustapha@hotmail.com',
    address:    '31 Maiduguri Road, Damaturu, Yobe',
    blood_group: 'AB+',
    nok_name: 'Ibrahim Mustapha', nok_phone_code: '+234', nok_phone: '08056789012',
    nok_relationship: 'Husband', nok_address: '31 Maiduguri Road, Damaturu, Yobe',
    hypertension: 'No', diabetes: 'Yes',
    allergies: null,
    current_medications: 'Metformin 1000mg, Sitagliptin 100mg, Aspirin 75mg',
    ckd_stage: 'Stage 2 / Stage 3a', ckd_risk: 'medium',
    visit: {
      visit_date: '2026-02-22', visit_type: 'Follow-up',
      bp_systolic: 132, bp_diastolic: 84, pulse: 80,
      temperature: 36.6, weight: 72.5, height: 160,
      notes: 'HbA1c remains above target at 8.5%. Microalbuminuria on dipstick. GFR slightly reduced from last visit. Diabetes management plan reviewed and intensified.',
    },
    labs: { creatinine: 1.9, bun: 26, glucose: 162, potassium: 4.8, hemoglobin: 11.2, albumin: 3.6, hba1c: 8.5, gfr: 44 },
    prediction: {
      risk_score: 54, risk_level: 'medium', ckd_stage: 'Stage 2 / Stage 3a',
      recommendation: 'Moderate risk detected. Recommend quarterly monitoring, blood pressure control, dietary consultation. Consider nephrology referral if trend worsens.',
      inputs: { age: 47, bpSystolic: 132, bpDiastolic: 84, glucose: 162, bun: 26, creatinine: 1.9, potassium: 4.8, hemoglobin: 11.2, albumin: 3.6, gfr: 44, hypertension: false, diabetes: true },
    },
  },

  {
    // ── Low risk — young, healthy, annual screening ──────────────────────────
    first_name: 'Babatunde',
    last_name:  'Ojo',
    dob:        '1994-09-12',
    gender:     'Male',
    phone_code: '+234', phone: '08112345678',
    email:      'babatunde.ojo@gmail.com',
    address:    '7 Bodija Estate, Ibadan, Oyo',
    blood_group: 'O-',
    nok_name: 'Folake Ojo', nok_phone_code: '+234', nok_phone: '08023456781',
    nok_relationship: 'Mother', nok_address: '7 Bodija Estate, Ibadan, Oyo',
    hypertension: 'No', diabetes: 'No',
    allergies: null,
    current_medications: null,
    ckd_stage: 'No CKD / Stage 1', ckd_risk: 'low',
    visit: {
      visit_date: '2026-02-15', visit_type: 'Routine',
      bp_systolic: 118, bp_diastolic: 76, pulse: 68,
      temperature: 36.4, weight: 78.0, height: 180,
      notes: 'Annual kidney health screening. All parameters within normal range. Family history of hypertension noted — advised lifestyle monitoring and annual follow-up.',
    },
    labs: { creatinine: 0.9, bun: 14, glucose: 88, potassium: 3.9, hemoglobin: 15.2, albumin: 4.4, hba1c: 5.2, gfr: 95 },
    prediction: {
      risk_score: 14, risk_level: 'low', ckd_stage: 'No CKD / Stage 1',
      recommendation: 'Routine monitoring recommended. Maintain healthy lifestyle — adequate hydration, balanced diet, regular exercise. Annual kidney function screening.',
      inputs: { age: 31, bpSystolic: 118, bpDiastolic: 76, glucose: 88, bun: 14, creatinine: 0.9, potassium: 3.9, hemoglobin: 15.2, albumin: 4.4, gfr: 95, hypertension: false, diabetes: false },
    },
  },
];

// ── Seed function ─────────────────────────────────────────────────────────────
async function seedPatients() {
  console.log('🌱  Seeding 5 demo patients...\n');

  const client = await pool.connect();

  try {
    // Get the clinician and records_officer user IDs
    const { rows: users } = await client.query(
      `SELECT id, name, role FROM users WHERE role IN ('clinician', 'records_officer') LIMIT 2`
    );
    const clinician      = users.find(u => u.role === 'clinician')       || users[0];
    const recordsOfficer = users.find(u => u.role === 'records_officer') || users[0];

    console.log(`  Using clinician:       ${clinician?.name}`);
    console.log(`  Using records officer: ${recordsOfficer?.name}\n`);

    for (const p of DEMO_PATIENTS) {
      await client.query('BEGIN');

      // ── 1. Insert patient ──────────────────────────────────────────────────
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

      // ── 2. Insert visit ────────────────────────────────────────────────────
      const { rows: visitRows } = await client.query(
        `INSERT INTO visits (
           patient_id, clinician_id, visit_date, visit_type,
           bp_systolic, bp_diastolic, pulse, temperature, weight, height, notes
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [
          patientId, clinician?.id, p.visit.visit_date, p.visit.visit_type,
          p.visit.bp_systolic, p.visit.bp_diastolic, p.visit.pulse,
          p.visit.temperature, p.visit.weight, p.visit.height, p.visit.notes,
        ]
      );
      const visitId = visitRows[0].id;

      // ── 3. Insert lab results ──────────────────────────────────────────────
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

      // ── 4. Insert prediction ───────────────────────────────────────────────
      await client.query(
        `INSERT INTO predictions (
           patient_id, visit_id, run_by,
           input_age, input_bp_systolic, input_bp_diastolic,
           input_glucose, input_bun, input_creatinine,
           input_potassium, input_hemoglobin, input_albumin, input_gfr,
           input_hypertension, input_diabetes,
           risk_score, risk_level, ckd_stage, recommendation
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
         )`,
        [
          patientId, visitId, clinician?.id,
          p.prediction.inputs.age,
          p.prediction.inputs.bpSystolic,
          p.prediction.inputs.bpDiastolic,
          p.prediction.inputs.glucose,
          p.prediction.inputs.bun,
          p.prediction.inputs.creatinine,
          p.prediction.inputs.potassium,
          p.prediction.inputs.hemoglobin,
          p.prediction.inputs.albumin,
          p.prediction.inputs.gfr,
          p.prediction.inputs.hypertension,
          p.prediction.inputs.diabetes,
          p.prediction.risk_score,
          p.prediction.risk_level,
          p.prediction.ckd_stage,
          p.prediction.recommendation,
        ]
      );

      await client.query('COMMIT');

      const riskEmoji = p.ckd_risk === 'high' ? '🔴' : p.ckd_risk === 'medium' ? '🟡' : '🟢';
      console.log(`  ${riskEmoji}  ${patientId}  │  ${(p.first_name + ' ' + p.last_name).padEnd(22)}  │  ${p.ckd_stage}  (${p.prediction.risk_score}%)`);
    }

    console.log('\n✔  5 patients seeded — each with visit, labs & prediction.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedPatients();
