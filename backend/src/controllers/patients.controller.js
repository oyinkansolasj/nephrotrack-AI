const pool = require('../config/db');

// ─── GET /api/patients ────────────────────────────────────────────────────────
// Returns all patients, ordered alphabetically.
// All authenticated roles can access.
const getAllPatients = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         id, first_name, last_name, dob, gender,
         phone_code, phone, email,
         blood_group, ckd_stage, ckd_risk,
         created_at
       FROM patients
       ORDER BY last_name, first_name`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/patients/:id ────────────────────────────────────────────────────
// Returns full patient record + most recent visit + most recent lab results.
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Core patient record
    const patientResult = await pool.query(
      `SELECT * FROM patients WHERE id = $1`,
      [id]
    );
    const patient = patientResult.rows[0];
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // 2. Most recent visit
    const visitResult = await pool.query(
      `SELECT * FROM visits
       WHERE patient_id = $1
       ORDER BY visit_date DESC, created_at DESC
       LIMIT 1`,
      [id]
    );

    // 3. Most recent lab results
    const labResult = await pool.query(
      `SELECT * FROM lab_results
       WHERE patient_id = $1
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [id]
    );

    // 4. Most recent prediction
    const predResult = await pool.query(
      `SELECT risk_score, risk_level, ckd_stage, recommendation, created_at
       FROM predictions
       WHERE patient_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    );

    res.json({
      ...patient,
      lastVisit:       visitResult.rows[0]  ?? null,
      lastLabResults:  labResult.rows[0]    ?? null,
      lastPrediction:  predResult.rows[0]   ?? null,
    });
  } catch (err) { next(err); }
};

// ─── POST /api/patients ───────────────────────────────────────────────────────
// Creates a new patient. Restricted to admin + records_officer.
const createPatient = async (req, res, next) => {
  try {
    const {
      // Personal
      firstName, lastName, dob, gender,
      // Contact
      phoneCode, phone, email, address,
      // Clinical
      bloodGroup,
      // Next of kin
      nextOfKinName, nextOfKinPhoneCode, nextOfKinPhone,
      nextOfKinAddress, nextOfKinEmail, nextOfKinRelationship,
      // Medical history
      hypertension, diabetes, allergies, currentMedications,
    } = req.body;

    // Validate required fields
    const required = { firstName, lastName, dob, gender, phone, bloodGroup, nextOfKinName, nextOfKinPhone };
    const missing = Object.entries(required)
      .filter(([, v]) => !v || String(v).trim() === '')
      .map(([k]) => k);

    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    const { rows } = await pool.query(
      `INSERT INTO patients (
         first_name, last_name, dob, gender,
         phone_code, phone, email, address,
         blood_group,
         nok_name, nok_phone_code, nok_phone,
         nok_address, nok_email, nok_relationship,
         hypertension, diabetes, allergies, current_medications,
         created_by
       ) VALUES (
         $1,  $2,  $3,  $4,
         $5,  $6,  $7,  $8,
         $9,
         $10, $11, $12,
         $13, $14, $15,
         $16, $17, $18, $19,
         $20
       )
       RETURNING *`,
      [
        firstName.trim(), lastName.trim(), dob, gender,
        phoneCode || '+234', phone.trim(), email?.trim() || null, address?.trim() || null,
        bloodGroup,
        nextOfKinName.trim(), nextOfKinPhoneCode || '+234', nextOfKinPhone.trim(),
        nextOfKinAddress?.trim() || null, nextOfKinEmail?.trim() || null, nextOfKinRelationship || null,
        hypertension || 'Unknown', diabetes || 'Unknown',
        allergies?.trim() || null, currentMedications?.trim() || null,
        req.user.id,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// ─── PUT /api/patients/:id ────────────────────────────────────────────────────
// Updates patient demographics and medical history.
// ckd_stage / ckd_risk are NOT updated here — those come from predictions.
// Restricted to admin + records_officer.
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check patient exists
    const exists = await pool.query('SELECT id FROM patients WHERE id = $1', [id]);
    if (!exists.rows[0]) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const {
      firstName, lastName, dob, gender,
      phoneCode, phone, email, address,
      bloodGroup,
      nextOfKinName, nextOfKinPhoneCode, nextOfKinPhone,
      nextOfKinAddress, nextOfKinEmail, nextOfKinRelationship,
      hypertension, diabetes, allergies, currentMedications,
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE patients SET
         first_name          = COALESCE($1,  first_name),
         last_name           = COALESCE($2,  last_name),
         dob                 = COALESCE($3,  dob),
         gender              = COALESCE($4,  gender),
         phone_code          = COALESCE($5,  phone_code),
         phone               = COALESCE($6,  phone),
         email               = COALESCE($7,  email),
         address             = COALESCE($8,  address),
         blood_group         = COALESCE($9,  blood_group),
         nok_name            = COALESCE($10, nok_name),
         nok_phone_code      = COALESCE($11, nok_phone_code),
         nok_phone           = COALESCE($12, nok_phone),
         nok_address         = COALESCE($13, nok_address),
         nok_email           = COALESCE($14, nok_email),
         nok_relationship    = COALESCE($15, nok_relationship),
         hypertension        = COALESCE($16, hypertension),
         diabetes            = COALESCE($17, diabetes),
         allergies           = COALESCE($18, allergies),
         current_medications = COALESCE($19, current_medications)
       WHERE id = $20
       RETURNING *`,
      [
        firstName?.trim()     || null,
        lastName?.trim()      || null,
        dob                   || null,
        gender                || null,
        phoneCode             || null,
        phone?.trim()         || null,
        email?.trim()         || null,
        address?.trim()       || null,
        bloodGroup            || null,
        nextOfKinName?.trim() || null,
        nextOfKinPhoneCode    || null,
        nextOfKinPhone?.trim()|| null,
        nextOfKinAddress?.trim()    || null,
        nextOfKinEmail?.trim()      || null,
        nextOfKinRelationship       || null,
        hypertension          || null,
        diabetes              || null,
        allergies?.trim()     || null,
        currentMedications?.trim()  || null,
        id,
      ]
    );

    res.json(rows[0]);
  } catch (err) { next(err); }
};

module.exports = { getAllPatients, getPatientById, createPatient, updatePatient };
