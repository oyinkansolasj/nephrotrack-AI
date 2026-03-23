const pool = require('../config/db');

// ── POST /api/predictions ─────────────────────────────────────────────────────
// Receives ML prediction result from frontend, persists to DB,
// and updates patient's ckd_stage + ckd_risk summary columns.
const runPrediction = async (req, res, next) => {
  try {
    const {
      patientId,
      riskScore,
      riskLevel,      // 'Low' | 'Medium' | 'High'  (frontend capitalised)
      ckdStage,
      recommendation,
      inputs,         // all 51 ML feature values (numeric)
    } = req.body;

    if (!patientId || riskScore === undefined || !riskLevel || !ckdStage || !recommendation) {
      return res.status(400).json({ message: 'Missing required prediction fields' });
    }

    const riskLevelLower = riskLevel.toLowerCase(); // DB enum: 'low' | 'medium' | 'high'

    // ── Insert prediction record ──────────────────────────────────────────────
    const { rows } = await pool.query(
      `INSERT INTO predictions (
         patient_id, run_by,
         -- Demographics
         input_age, input_gender, input_ethnicity,
         input_socioeconomic_status, input_education_level, input_bmi,
         -- Lifestyle
         input_smoking, input_alcohol_consumption,
         input_physical_activity, input_diet_quality, input_sleep_quality,
         -- Medical history
         input_family_history_kidney, input_family_history_hypertension,
         input_family_history_diabetes, input_previous_aki, input_uti,
         -- Vitals
         input_bp_systolic, input_bp_diastolic,
         -- Lab results
         input_fasting_blood_sugar, input_hba1c, input_creatinine,
         input_bun, input_gfr, input_protein_in_urine, input_acr,
         input_sodium, input_potassium, input_calcium, input_phosphorus,
         input_hemoglobin,
         -- Cholesterol
         input_cholesterol_total, input_cholesterol_ldl,
         input_cholesterol_hdl, input_cholesterol_triglycerides,
         -- Medications
         input_ace_inhibitors, input_diuretics, input_nsaids_use,
         input_statins, input_antidiabetic_meds,
         -- Symptoms
         input_edema, input_fatigue_levels, input_nausea_vomiting,
         input_muscle_cramps, input_itching, input_quality_of_life,
         -- Environmental
         input_heavy_metals_exposure, input_occupational_exposure,
         input_water_quality, input_checkups_frequency,
         input_medication_adherence, input_health_literacy,
         -- Results
         risk_score, risk_level, ckd_stage, recommendation
       ) VALUES (
         $1,  $2,
         $3,  $4,  $5,  $6,  $7,  $8,
         $9,  $10, $11, $12, $13,
         $14, $15, $16, $17, $18,
         $19, $20,
         $21, $22, $23, $24, $25, $26, $27,
         $28, $29, $30, $31, $32,
         $33, $34, $35, $36,
         $37, $38, $39, $40, $41,
         $42, $43, $44, $45, $46, $47,
         $48, $49, $50, $51, $52, $53,
         $54, $55, $56, $57
       ) RETURNING *`,
      [
        patientId,
        req.user.id,
        // Demographics
        inputs?.Age                     ?? null,
        inputs?.Gender                  ?? null,
        inputs?.Ethnicity               ?? null,
        inputs?.SocioeconomicStatus     ?? null,
        inputs?.EducationLevel          ?? null,
        inputs?.BMI                     ?? null,
        // Lifestyle
        inputs?.Smoking                 ?? null,
        inputs?.AlcoholConsumption      ?? null,
        inputs?.PhysicalActivity        ?? null,
        inputs?.DietQuality             ?? null,
        inputs?.SleepQuality            ?? null,
        // Medical history
        inputs?.FamilyHistoryKidneyDisease ?? null,
        inputs?.FamilyHistoryHypertension  ?? null,
        inputs?.FamilyHistoryDiabetes      ?? null,
        inputs?.PreviousAcuteKidneyInjury  ?? null,
        inputs?.UrinaryTractInfections     ?? null,
        // Vitals
        inputs?.SystolicBP              ?? null,
        inputs?.DiastolicBP             ?? null,
        // Lab results
        inputs?.FastingBloodSugar       ?? null,
        inputs?.HbA1c                   ?? null,
        inputs?.SerumCreatinine         ?? null,
        inputs?.BUNLevels               ?? null,
        inputs?.GFR                     ?? null,
        inputs?.ProteinInUrine          ?? null,
        inputs?.ACR                     ?? null,
        inputs?.SerumElectrolytesSodium    ?? null,
        inputs?.SerumElectrolytesPotassium ?? null,
        inputs?.SerumElectrolytesCalcium   ?? null,
        inputs?.SerumElectrolytesPhosphorus?? null,
        inputs?.HemoglobinLevels          ?? null,
        // Cholesterol
        inputs?.CholesterolTotal          ?? null,
        inputs?.CholesterolLDL            ?? null,
        inputs?.CholesterolHDL            ?? null,
        inputs?.CholesterolTriglycerides  ?? null,
        // Medications
        inputs?.ACEInhibitors             ?? null,
        inputs?.Diuretics                 ?? null,
        inputs?.NSAIDsUse                 ?? null,
        inputs?.Statins                   ?? null,
        inputs?.AntidiabeticMedications   ?? null,
        // Symptoms
        inputs?.Edema                     ?? null,
        inputs?.FatigueLevels             ?? null,
        inputs?.NauseaVomiting            ?? null,
        inputs?.MuscleCramps              ?? null,
        inputs?.Itching                   ?? null,
        inputs?.QualityOfLifeScore        ?? null,
        // Environmental
        inputs?.HeavyMetalsExposure            ?? null,
        inputs?.OccupationalExposureChemicals   ?? null,
        inputs?.WaterQuality                   ?? null,
        inputs?.MedicalCheckupsFrequency       ?? null,
        inputs?.MedicationAdherence            ?? null,
        inputs?.HealthLiteracy                 ?? null,
        // Results
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
