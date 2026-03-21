-- =============================================================================
-- NephroTrack Database Schema
-- PostgreSQL
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role       AS ENUM ('clinician', 'admin', 'records_officer', 'billing');
CREATE TYPE visit_type      AS ENUM ('Routine', 'Follow-up', 'Consultation', 'Emergency');
CREATE TYPE risk_level      AS ENUM ('low', 'medium', 'high');
CREATE TYPE invoice_status  AS ENUM ('pending', 'paid', 'overdue');
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
-- Core patient demographic and medical history record
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

  -- Medical History
  hypertension          yes_no_unknown  NOT NULL DEFAULT 'Unknown',
  diabetes              yes_no_unknown  NOT NULL DEFAULT 'Unknown',
  allergies             TEXT,
  current_medications   TEXT,

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

  creatinine    NUMERIC(6,2),           -- mg/dL   (Serum Creatinine)
  bun           NUMERIC(6,2),           -- mg/dL   (Blood Urea Nitrogen)
  glucose       NUMERIC(6,2),           -- mg/dL   (Blood Glucose)
  potassium     NUMERIC(4,2),           -- mEq/L
  hemoglobin    NUMERIC(4,1),           -- g/dL
  albumin       NUMERIC(4,2),           -- g/dL
  hba1c         NUMERIC(4,2),           -- %
  gfr           NUMERIC(6,2),           -- mL/min  (eGFR)

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

  -- Raw inputs used for this prediction
  input_age             INTEGER,
  input_bp_systolic     INTEGER,
  input_bp_diastolic    INTEGER,
  input_glucose         NUMERIC(6,2),
  input_bun             NUMERIC(6,2),
  input_creatinine      NUMERIC(6,2),
  input_potassium       NUMERIC(4,2),
  input_hemoglobin      NUMERIC(4,1),
  input_albumin         NUMERIC(4,2),
  input_gfr             NUMERIC(6,2),
  input_hypertension    BOOLEAN,
  input_diabetes        BOOLEAN,

  -- Prediction results
  risk_score        INTEGER       NOT NULL,   -- 0–100
  risk_level        risk_level    NOT NULL,
  ckd_stage         VARCHAR(30)   NOT NULL,
  recommendation    TEXT          NOT NULL,
  model_version     VARCHAR(20)   NOT NULL DEFAULT 'v1.0',

  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- TABLE 6: invoices
-- Billing records per patient
-- =============================================================================

CREATE TABLE invoices (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    VARCHAR(10)   NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  created_by    UUID          REFERENCES users(id) ON DELETE SET NULL,

  description   TEXT          NOT NULL,
  amount        NUMERIC(12,2) NOT NULL,       -- in ₦
  status        invoice_status NOT NULL DEFAULT 'pending',
  due_date      DATE,

  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
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
CREATE INDEX idx_invoices_patient     ON invoices(patient_id);
CREATE INDEX idx_invoices_status      ON invoices(status);


-- =============================================================================
-- AUTO-UPDATE updated_at  (patients + invoices)
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

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
