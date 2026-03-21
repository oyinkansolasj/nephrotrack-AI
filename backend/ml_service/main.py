import json
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# ── Load model artifacts once at startup ─────────────────────────────────────
model        = joblib.load('ckd_artifacts/ckd_model.pkl')
num_imputer  = joblib.load('ckd_artifacts/num_imputer.pkl')

with open('ckd_artifacts/metadata.json') as f:
    metadata = json.load(f)

FEATURES = metadata['selected_features']

# ── App setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title='NephroTrack ML Service',
    description='CKD risk prediction — High / Medium / Low',
    version='1.0.0'
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
    age:                Optional[float] = None
    blood_pressure:     Optional[float] = None
    blood_glucose:      Optional[float] = None
    blood_urea:         Optional[float] = None
    serum_creatinine:   Optional[float] = None
    potassium:          Optional[float] = None
    hemoglobin:         Optional[float] = None
    albumin:            Optional[float] = None
    packed_cell_volume: Optional[float] = None
    hypertension:       Optional[float] = None
    diabetes_mellitus:  Optional[float] = None

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
        # Step 1: Build input row using the features the model was trained on
        input_dict = {
            'age':                patient.age,
            'blood_pressure':     patient.blood_pressure,
            'blood_glucose_random': patient.blood_glucose,
            'blood_urea':         patient.blood_urea,
            'serum_creatinine':   patient.serum_creatinine,
            'potassium':          patient.potassium,
            'hemoglobin':         patient.hemoglobin,
            'albumin':            patient.albumin,
            'packed_cell_volume': patient.packed_cell_volume,
            'hypertension':       patient.hypertension,
            'diabetes_mellitus':  patient.diabetes_mellitus,
        }

        # Step 2: Create DataFrame with correct feature columns
        # Fill missing values with clinical median defaults
        DEFAULTS = {
            'hemoglobin':          13.0,
            'packed_cell_volume':  40.0,
            'serum_creatinine':    1.2,
            'red_blood_cell_count': 4.7,
            'albumin':             0.0,
            'hypertension':        0.0,
            'diabetes_mellitus':   0.0,
            'sodium':              135.0,
            'blood_urea':          35.0,
            'blood_glucose_random': 120.0,
            'age':                 45.0,
            'blood_pressure':      80.0,
        }

        row = pd.DataFrame([{
            f: input_dict.get(f) if input_dict.get(f) is not None else DEFAULTS.get(f, 0.0)
            for f in FEATURES
        }])

        # Step 3: Run prediction
        probability  = float(model.predict_proba(row)[0][1]) * 100
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
        'model_name': metadata['model_name'],
        'features':   FEATURES,
        'performance': metadata['performance'],
        'risk_levels': metadata['risk_levels'],
    }
