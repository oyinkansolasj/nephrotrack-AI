import json
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# ── Load model artifacts once at startup ─────────────────────────────────────
model   = joblib.load('ckd_artifacts/ckd_model.pkl')
scaler  = joblib.load('ckd_artifacts/ckd_scaler.pkl')

with open('ckd_artifacts/metadata.json') as f:
    metadata = json.load(f)

FEATURES = metadata['selected_features']

# ── App setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title='NephroTrack ML Service',
    description='CKD risk prediction — High / Medium / Low',
    version='2.0.0'
)

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*'],
)

# ── Request schema ────────────────────────────────────────────────────────────
class PatientData(BaseModel):
    # Demographics
    Age:                        Optional[float] = None
    Gender:                     Optional[float] = None
    Ethnicity:                  Optional[float] = None
    SocioeconomicStatus:        Optional[float] = None
    EducationLevel:             Optional[float] = None
    BMI:                        Optional[float] = None

    # Lifestyle
    Smoking:                    Optional[float] = None
    AlcoholConsumption:         Optional[float] = None
    PhysicalActivity:           Optional[float] = None
    DietQuality:                Optional[float] = None
    SleepQuality:               Optional[float] = None

    # Medical history
    FamilyHistoryKidneyDisease: Optional[float] = None
    FamilyHistoryHypertension:  Optional[float] = None
    FamilyHistoryDiabetes:      Optional[float] = None
    PreviousAcuteKidneyInjury:  Optional[float] = None
    UrinaryTractInfections:     Optional[float] = None

    # Vitals
    SystolicBP:                 Optional[float] = None
    DiastolicBP:                Optional[float] = None

    # Lab results
    FastingBloodSugar:          Optional[float] = None
    HbA1c:                      Optional[float] = None
    SerumCreatinine:             Optional[float] = None
    BUNLevels:                  Optional[float] = None
    GFR:                        Optional[float] = None
    ProteinInUrine:             Optional[float] = None
    ACR:                        Optional[float] = None
    SerumElectrolytesSodium:    Optional[float] = None
    SerumElectrolytesPotassium: Optional[float] = None
    SerumElectrolytesCalcium:   Optional[float] = None
    SerumElectrolytesPhosphorus:Optional[float] = None
    HemoglobinLevels:           Optional[float] = None
    CholesterolTotal:           Optional[float] = None
    CholesterolLDL:             Optional[float] = None
    CholesterolHDL:             Optional[float] = None
    CholesterolTriglycerides:   Optional[float] = None

    # Medications
    ACEInhibitors:              Optional[float] = None
    Diuretics:                  Optional[float] = None
    NSAIDsUse:                  Optional[float] = None
    Statins:                    Optional[float] = None
    AntidiabeticMedications:    Optional[float] = None

    # Symptoms
    Edema:                      Optional[float] = None
    FatigueLevels:              Optional[float] = None
    NauseaVomiting:             Optional[float] = None
    MuscleCramps:               Optional[float] = None
    Itching:                    Optional[float] = None
    QualityOfLifeScore:         Optional[float] = None

    # Environmental / Social
    HeavyMetalsExposure:        Optional[float] = None
    OccupationalExposureChemicals: Optional[float] = None
    WaterQuality:               Optional[float] = None
    MedicalCheckupsFrequency:   Optional[float] = None
    MedicationAdherence:        Optional[float] = None
    HealthLiteracy:             Optional[float] = None

# ── Clinical defaults (dataset medians) ──────────────────────────────────────
DEFAULTS = {
    'Age': 50.0,
    'Gender': 0.0,
    'Ethnicity': 0.0,
    'SocioeconomicStatus': 1.0,
    'EducationLevel': 1.0,
    'BMI': 30.0,
    'Smoking': 0.0,
    'AlcoholConsumption': 10.0,
    'PhysicalActivity': 5.0,
    'DietQuality': 5.0,
    'SleepQuality': 5.0,
    'FamilyHistoryKidneyDisease': 0.0,
    'FamilyHistoryHypertension': 0.0,
    'FamilyHistoryDiabetes': 0.0,
    'PreviousAcuteKidneyInjury': 0.0,
    'UrinaryTractInfections': 0.0,
    'SystolicBP': 120.0,
    'DiastolicBP': 80.0,
    'FastingBloodSugar': 100.0,
    'HbA1c': 5.7,
    'SerumCreatinine': 1.2,
    'BUNLevels': 20.0,
    'GFR': 60.0,
    'ProteinInUrine': 1.0,
    'ACR': 30.0,
    'SerumElectrolytesSodium': 140.0,
    'SerumElectrolytesPotassium': 4.5,
    'SerumElectrolytesCalcium': 9.5,
    'SerumElectrolytesPhosphorus': 3.5,
    'HemoglobinLevels': 13.0,
    'CholesterolTotal': 200.0,
    'CholesterolLDL': 100.0,
    'CholesterolHDL': 50.0,
    'CholesterolTriglycerides': 150.0,
    'ACEInhibitors': 0.0,
    'Diuretics': 0.0,
    'NSAIDsUse': 0.0,
    'Statins': 0.0,
    'AntidiabeticMedications': 0.0,
    'Edema': 0.0,
    'FatigueLevels': 5.0,
    'NauseaVomiting': 0.0,
    'MuscleCramps': 0.0,
    'Itching': 0.0,
    'QualityOfLifeScore': 50.0,
    'HeavyMetalsExposure': 0.0,
    'OccupationalExposureChemicals': 0.0,
    'WaterQuality': 1.0,
    'MedicalCheckupsFrequency': 2.0,
    'MedicationAdherence': 5.0,
    'HealthLiteracy': 5.0,
}

# ── Risk level logic ──────────────────────────────────────────────────────────
def assign_risk(probability: float) -> str:
    if probability >= 70:
        return 'High'
    elif probability >= 40:
        return 'Medium'
    else:
        return 'Low'

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get('/')
def root():
    return {
        'service': 'NephroTrack ML Service',
        'status':  'running',
        'model':   metadata['model_name'],
    }

@app.get('/health')
def health():
    return {'status': 'healthy'}

@app.post('/predict')
def predict(patient: PatientData):
    try:
        # Step 1: Build input row from patient data
        patient_dict = patient.model_dump()

        row_data = {
            f: patient_dict.get(f) if patient_dict.get(f) is not None else DEFAULTS.get(f, 0.0)
            for f in FEATURES
        }

        # Step 2: Create DataFrame and apply scaler
        row = pd.DataFrame([row_data])
        row_scaled = pd.DataFrame(
            scaler.transform(row),
            columns=FEATURES
        )

        # Step 3: Run prediction
        probability  = float(model.predict_proba(row_scaled)[0][1]) * 100
        risk_level   = assign_risk(probability)

        # Step 4: Get top contributing features
        importances  = model.feature_importances_
        top_factors  = dict(
            sorted(
                zip(FEATURES, [round(float(i), 4) for i in importances]),
                key=lambda x: x[1],
                reverse=True
            )[:5]
        )

        return {
            'probability': round(probability, 2),
            'risk_level':  risk_level,
            'top_factors': top_factors,
            'model':       metadata['model_name'],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/model/info')
def model_info():
    return {
        'model_name':  metadata['model_name'],
        'features':    FEATURES,
        'performance': metadata['performance'],
        'risk_levels': metadata['risk_levels'],
    }
