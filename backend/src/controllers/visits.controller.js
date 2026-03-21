const pool = require('../config/db');

// ─── GET /api/visits ──────────────────────────────────────────────────────────
// Returns all visits across all patients (newest first).
// All authenticated roles can access.
const getAllVisits = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         v.id, v.patient_id, v.visit_date, v.visit_type,
         v.bp_systolic, v.bp_diastolic, v.pulse,
         v.temperature, v.weight, v.height, v.notes,
         v.created_at,
         p.first_name, p.last_name,
         u.name AS clinician_name
       FROM visits v
       LEFT JOIN patients p ON p.id = v.patient_id
       LEFT JOIN users    u ON u.id = v.clinician_id
       ORDER BY v.visit_date DESC, v.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) { next(err); }
};

// ─── GET /api/visits/patient/:patientId ───────────────────────────────────────
// Returns all visits for one patient, with their lab results attached.
const getVisitsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Check patient exists
    const patient = await pool.query('SELECT id FROM patients WHERE id = $1', [patientId]);
    if (!patient.rows[0]) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const visitsResult = await pool.query(
      `SELECT
         v.*,
         u.name AS clinician_name
       FROM visits v
       LEFT JOIN users u ON u.id = v.clinician_id
       WHERE v.patient_id = $1
       ORDER BY v.visit_date DESC, v.created_at DESC`,
      [patientId]
    );

    // Attach lab results to each visit
    const visits = await Promise.all(
      visitsResult.rows.map(async (visit) => {
        const labs = await pool.query(
          'SELECT * FROM lab_results WHERE visit_id = $1',
          [visit.id]
        );
        return { ...visit, labResults: labs.rows[0] ?? null };
      })
    );

    res.json(visits);
  } catch (err) { next(err); }
};

// ─── POST /api/visits ─────────────────────────────────────────────────────────
// Creates a visit record (vitals) and optionally saves lab results.
// Restricted to clinician + admin.
const createVisit = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const {
      patientId,
      visitDate,
      visitType,
      // Vitals (all optional)
      bp_systolic, bp_diastolic, pulse,
      temperature, weight, height,
      notes,
      // Lab results (all optional — saved only if at least one value is provided)
      creatinine, bun, glucose, potassium,
      hemoglobin, albumin, hba1c, gfr,
    } = req.body;

    // Validate required fields
    if (!patientId || !visitType) {
      return res.status(400).json({ message: 'patientId and visitType are required' });
    }

    // Validate patient exists
    const patient = await client.query('SELECT id FROM patients WHERE id = $1', [patientId]);
    if (!patient.rows[0]) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await client.query('BEGIN');

    // 1. Insert visit (vitals)
    const visitResult = await client.query(
      `INSERT INTO visits
         (patient_id, clinician_id, visit_date, visit_type,
          bp_systolic, bp_diastolic, pulse, temperature, weight, height, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        patientId,
        req.user.id,
        visitDate || new Date().toISOString().split('T')[0],
        visitType,
        bp_systolic    ? Number(bp_systolic)  : null,
        bp_diastolic   ? Number(bp_diastolic) : null,
        pulse          ? Number(pulse)        : null,
        temperature    ? Number(temperature)  : null,
        weight         ? Number(weight)       : null,
        height         ? Number(height)       : null,
        notes?.trim()  || null,
      ]
    );
    const visit = visitResult.rows[0];

    // 2. Insert lab results if any lab value was provided
    const labValues = { creatinine, bun, glucose, potassium, hemoglobin, albumin, hba1c, gfr };
    const hasLabs   = Object.values(labValues).some(v => v !== undefined && v !== '' && v !== null);

    let labs = null;
    if (hasLabs) {
      const labResult = await client.query(
        `INSERT INTO lab_results
           (visit_id, patient_id, creatinine, bun, glucose,
            potassium, hemoglobin, albumin, hba1c, gfr)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          visit.id,
          patientId,
          creatinine  ? Number(creatinine)  : null,
          bun         ? Number(bun)         : null,
          glucose     ? Number(glucose)     : null,
          potassium   ? Number(potassium)   : null,
          hemoglobin  ? Number(hemoglobin)  : null,
          albumin     ? Number(albumin)     : null,
          hba1c       ? Number(hba1c)       : null,
          gfr         ? Number(gfr)         : null,
        ]
      );
      labs = labResult.rows[0];
    }

    await client.query('COMMIT');

    res.status(201).json({ ...visit, labResults: labs });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

module.exports = { getAllVisits, getVisitsByPatient, createVisit };
