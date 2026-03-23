-- =============================================================================
-- NephroTrack Database Schema
-- PostgreSQL
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role       AS ENUM ('clinician', 'admin', 'records_officer');
CREATE TYPE visit_type      AS ENUM ('Routine', 'Follow-up', 'Consultation', 'Emergency');
CREATE TYPE risk_level      AS ENUM ('low', 'medium', 'high');
CREATE TYPE yes_no_unknown  AS ENUM ('Yes', 'No', 'Unknown');


-- =============================================================================
-- PATIENT ID SEQUENCE  (NT-0001, NT-0002, ...)
-- =============================================================================

CREATE SEQUENCE patient_id_seq START 1;


-- =============================================================================
-- TABLE 1: users
-- Staff accounts — clinicians, admins, records officers, billing
-- =============================================================================

CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          user_role     NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TABLE 2: patients
-- Core patient demographic, lifestyle, and medical history record
-- =============================================================================

CREATE TABLE patients (
  -- Identity
  id            VARCHAR(10)   PRIMARY KEY
                              DEFAULT ('NT-' || LPAD(nextval('patient_id_seq')::TEXT, 4, '0')),
  first_name    VARCHAR(100)  NOT NULL,
  last_name     VARCHAR(100)  NOT NULL,
  dob           DATE          NOT NULL,
  gender        VARCHAR(10)   NOT NULL,

  -- Contact
  phone_code    VARCHAR(10)   NOT NULL,
  phone         VARCHAR(20)   NOT NULL,
  email         VARCHAR(150),
  address       TEXT,

  -- Clinical
  blood_group   VARCHAR(5)    NOT NULL,

  -- Next of Kin
  nok_name          VARCHAR(100)  NOT NULL,
  nok_phone_code    VARCHAR(10)   NOT NULL,
  nok_phone         VARCHAR(20)   NOT NULL,
  nok_address       TEXT,
  nok_email         VARCHAR(150),
  nok_relationship  VARCHAR(50),

  -- Demographics (ML features)
  ethnicity                   INTEGER       DEFAULT 0,       -- 0=Caucasian, 1=African American, 2=Asian, 3=Other
  socioeconomic_status        INTEGER       DEFAULT 1,       -- 0=Low, 1=Middle, 2=High
  education_level             INTEGER       DEFAULT 1,       -- 0=None, 1=High School, 2=Bachelor's, 3=Higher

  -- Lifestyle
  bmi                         NUMERIC(5,2),
  smoking                     INTEGER       DEFAULT 0,       -- 0=No, 1=Yes
  alcohol_consumption         NUMERIC(5,2)  DEFAULT 0,       -- units/week
  physical_activity           NUMERIC(5,2)  DEFAULT 5,       -- hours/week
  diet_quality                NUMERIC(5,2)  DEFAULT 5,       -- 0–10 scale
  sleep_quality               NUMERIC(5,2)  DEFAULT 5,       -- 0–10 scale

  -- Medical History
  hypertension          yes_no_unknown  NOT NULL DEFAULT 'Unknown',
  diabetes              yes_no_unknown  NOT NULL DEFAULT 'Unknown',
  family_history_kidney_disease   INTEGER  DEFAULT 0,   -- 0=No, 1=Yes
  family_history_hypertension     INTEGER  DEFAULT 0,   -- 0=No, 1=Yes
  family_history_diabetes         INTEGER  DEFAULT 0,   -- 0=No, 1=Yes
  previous_acute_kidney_injury    INTEGER  DEFAULT 0,   -- 0=No, 1=Yes
  urinary_tract_infections        INTEGER  DEFAULT 0,   -- 0=No, 1=Yes
  allergies             TEXT,
  current_medications   TEXT,

  -- Medications (binary flags for ML)
  ace_inhibitors              INTEGER       DEFAULT 0,       -- 0=No, 1=Yes
  diuretics                   INTEGER       DEFAULT 0,
  nsaids_use                  NUMERIC(5,2)  DEFAULT 0,       -- frequency score
  statins                     INTEGER       DEFAULT 0,
  antidiabetic_medications    INTEGER       DEFAULT 0,

  -- Symptoms
  edema                       INTEGER       DEFAULT 0,       -- 0=No, 1=Yes
  fatigue_levels              NUMERIC(5,2)  DEFAULT 0,       -- 0–10 scale
  nausea_vomiting             NUMERIC(5,2)  DEFAULT 0,       -- 0–10 scale
  muscle_cramps               NUMERIC(5,2)  DEFAULT 0,       -- 0–10 scale
  itching                     NUMERIC(5,2)  DEFAULT 0,       -- 0–10 scale
  quality_of_life_score       NUMERIC(6,2)  DEFAULT 50,      -- 0–100

  -- Environmental / Social
  heavy_metals_exposure             INTEGER  DEFAULT 0,   -- 0=No, 1=Yes
  occupational_exposure_chemicals   INTEGER  DEFAULT 0,   -- 0=No, 1=Yes
  water_quality                     INTEGER  DEFAULT 1,   -- 0=Poor, 1=Good
  medical_checkups_frequency        NUMERIC(5,2)  DEFAULT 2,
  medication_adherence              NUMERIC(5,2)  DEFAULT 5,   -- 0–10
  health_literacy                   NUMERIC(5,2)  DEFAULT 5,   -- 0–10

  -- CKD Summary (updated after each prediction)
  ckd_stage     VARCHAR(30),
  ckd_risk      risk_level,

  -- Audit
  created_by    UUID          REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TABLE 3: visits
-- Clinical visit record — vitals only (lab results in separate table)
-- =============================================================================

CREATE TABLE visits (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    VARCHAR(10)   NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinician_id  UUID          REFERENCES users(id) ON DELETE SET NULL,
  visit_date    DATE          NOT NULL DEFAULT CURRENT_DATE,
  visit_type    visit_type    NOT NULL,

  -- Vitals
  bp_systolic   INTEGER,                -- mmHg
  bp_diastolic  INTEGER,                -- mmHg
  pulse         INTEGER,                -- bpm
  temperature   NUMERIC(4,1),           -- °C
  weight        NUMERIC(5,1),           -- kg
  height        NUMERIC(5,1),           -- cm

  notes         TEXT,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TABLE 4: lab_results
-- Lab results tied to a specific visit
-- =============================================================================

CREATE TABLE lab_results (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id      UUID          NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  patient_id    VARCHAR(10)   NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Core labs
  creatinine    NUMERIC(6,2),           -- mg/dL   (Serum Creatinine)
  bun           NUMERIC(6,2),           -- mg/dL   (Blood Urea Nitrogen)
  glucose       NUMERIC(6,2),           -- mg/dL   (Fasting Blood Sugar)
  potassium     NUMERIC(4,2),           -- mEq/L
  hemoglobin    NUMERIC(4,1),           -- g/dL
  albumin       NUMERIC(4,2),           -- g/dL
  hba1c         NUMERIC(4,2),           -- %
  gfr           NUMERIC(6,2),           -- mL/min  (eGFR)

  -- Extended labs (new model features)
  protein_in_urine        NUMERIC(6,2),  -- mg/dL
  acr                     NUMERIC(8,2),  -- mg/g    (Albumin-Creatinine Ratio)
  sodium                  NUMERIC(6,2),  -- mEq/L
  calcium                 NUMERIC(5,2),  -- mg/dL
  phosphorus              NUMERIC(5,2),  -- mg/dL
  cholesterol_total       NUMERIC(6,2),  -- mg/dL
  cholesterol_ldl         NUMERIC(6,2),  -- mg/dL
  cholesterol_hdl         NUMERIC(6,2),  -- mg/dL
  cholesterol_triglycerides NUMERIC(6,2),-- mg/dL

  recorded_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TABLE 5: predictions
-- CKD AI prediction — stores both raw inputs and results
-- =============================================================================

CREATE TABLE predictions (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    VARCHAR(10)   NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_id      UUID          REFERENCES visits(id) ON DELETE SET NULL,
  run_by        UUID          REFERENCES users(id) ON DELETE SET NULL,

  -- Raw inputs used for this prediction (all 51 features)
  -- Demographics
  input_age                     INTEGER,
  input_gender                  INTEGER,
  input_ethnicity               INTEGER,
  input_socioeconomic_status    INTEGER,
  input_education_level         INTEGER,
  input_bmi                     NUMERIC(5,2),

  -- Lifestyle
  input_smoking                 INTEGER,
  input_alcohol_consumption     NUMERIC(5,2),
  input_physical_activity       NUMERIC(5,2),
  input_diet_quality            NUMERIC(5,2),
  input_sleep_quality           NUMERIC(5,2),

  -- Medical history
  input_family_history_kidney   INTEGER,
  input_family_history_hypertension INTEGER,
  input_family_history_diabetes INTEGER,
  input_previous_aki            INTEGER,
  input_uti                     INTEGER,

  -- Vitals
  input_bp_systolic             INTEGER,
  input_bp_diastolic            INTEGER,

  -- Lab results
  input_fasting_blood_sugar     NUMERIC(6,2),
  input_hba1c                   NUMERIC(4,2),
  input_creatinine              NUMERIC(6,2),
  input_bun                     NUMERIC(6,2),
  input_gfr                     NUMERIC(6,2),
  input_protein_in_urine        NUMERIC(6,2),
  input_acr                     NUMERIC(8,2),
  input_sodium                  NUMERIC(6,2),
  input_potassium               NUMERIC(4,2),
  input_calcium                 NUMERIC(5,2),
  input_phosphorus              NUMERIC(5,2),
  input_hemoglobin              NUMERIC(4,1),
  input_cholesterol_total       NUMERIC(6,2),
  input_cholesterol_ldl         NUMERIC(6,2),
  input_cholesterol_hdl         NUMERIC(6,2),
  input_cholesterol_triglycerides NUMERIC(6,2),

  -- Medications
  input_ace_inhibitors          INTEGER,
  input_diuretics               INTEGER,
  input_nsaids_use              NUMERIC(5,2),
  input_statins                 INTEGER,
  input_antidiabetic_meds       INTEGER,

  -- Symptoms
  input_edema                   INTEGER,
  input_fatigue_levels          NUMERIC(5,2),
  input_nausea_vomiting         NUMERIC(5,2),
  input_muscle_cramps           NUMERIC(5,2),
  input_itching                 NUMERIC(5,2),
  input_quality_of_life         NUMERIC(6,2),

  -- Environmental
  input_heavy_metals_exposure   INTEGER,
  input_occupational_exposure   INTEGER,
  input_water_quality           INTEGER,
  input_checkups_frequency      NUMERIC(5,2),
  input_medication_adherence    NUMERIC(5,2),
  input_health_literacy         NUMERIC(5,2),

  -- Prediction results
  risk_score        INTEGER       NOT NULL,   -- 0–100
  risk_level        risk_level    NOT NULL,
  ckd_stage         VARCHAR(30)   NOT NULL,
  recommendation    TEXT          NOT NULL,
  model_version     VARCHAR(20)   NOT NULL DEFAULT 'v2.0',

  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- INDEXES  (for frequently queried columns)
-- =============================================================================

CREATE INDEX idx_patients_name        ON patients(last_name, first_name);
CREATE INDEX idx_visits_patient       ON visits(patient_id);
CREATE INDEX idx_visits_date          ON visits(visit_date);
CREATE INDEX idx_lab_results_visit    ON lab_results(visit_id);
CREATE INDEX idx_lab_results_patient  ON lab_results(patient_id);
CREATE INDEX idx_predictions_patient  ON predictions(patient_id);


-- =============================================================================
-- AUTO-UPDATE updated_at  (patients)
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
