const pool = require('../config/db');

// ── POST /api/predictions ─────────────────────────────────────────────────────
// Receives mock-scored result from frontend, persists to DB,
// and updates patient's ckd_stage + ckd_risk summary columns.
const runPrediction = async (req, res, next) => {
  try {
    const {
      patientId,
      riskScore,
      riskLevel,      // 'Low' | 'Medium' | 'High'  (frontend capitalised)
      ckdStage,
      recommendation,
      inputs,         // { age, bpSystolic, bpDiastolic, glucose, bun, creatinine,
                      //   potassium, hemoglobin, albumin, gfr, hypertension, diabetes }
    } = req.body;

    if (!patientId || riskScore === undefined || !riskLevel || !ckdStage || !recommendation) {
      return res.status(400).json({ message: 'Missing required prediction fields' });
    }

    const riskLevelLower = riskLevel.toLowerCase(); // DB enum: 'low' | 'medium' | 'high'

    // ── Insert prediction record ──────────────────────────────────────────────
    const { rows } = await pool.query(
      `INSERT INTO predictions (
         patient_id, run_by,
         input_age, input_bp_systolic, input_bp_diastolic,
         input_glucose, input_bun, input_creatinine,
         input_potassium, input_hemoglobin, input_albumin, input_gfr,
         input_hypertension, input_diabetes,
         risk_score, risk_level, ckd_stage, recommendation
       ) VALUES (
         $1,  $2,  $3,  $4,  $5,
         $6,  $7,  $8,  $9,  $10,
         $11, $12, $13, $14,
         $15, $16, $17, $18
       ) RETURNING *`,
      [
        patientId,
        req.user.id,
        inputs?.age             ?? null,
        inputs?.bpSystolic      ?? null,
        inputs?.bpDiastolic     ?? null,
        inputs?.glucose         ?? null,
        inputs?.bun             ?? null,
        inputs?.creatinine      ?? null,
        inputs?.potassium       ?? null,
        inputs?.hemoglobin      ?? null,
        inputs?.albumin         ?? null,
        inputs?.gfr             ?? null,
        inputs?.hypertension    != null ? inputs.hypertension    : null,
        inputs?.diabetes        != null ? inputs.diabetes        : null,
        riskScore,
        riskLevelLower,
        ckdStage,
        recommendation,
      ]
    );

    // ── Update patient CKD summary ────────────────────────────────────────────
    await pool.query(
      `UPDATE patients SET ckd_stage = $1, ckd_risk = $2 WHERE id = $3`,
      [ckdStage, riskLevelLower, patientId]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// ── GET /api/predictions/patient/:patientId ───────────────────────────────────
const getPredictionsByPatient = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS run_by_name
         FROM predictions p
         LEFT JOIN users u ON p.run_by = u.id
        WHERE p.patient_id = $1
        ORDER BY p.created_at DESC`,
      [req.params.patientId]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

module.exports = { runPrediction, getPredictionsByPatient };
