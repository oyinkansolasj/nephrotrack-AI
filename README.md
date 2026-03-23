# NephroTrack — AI-Powered Kidney Disease Prediction System

A full-stack clinical decision support system for managing Chronic Kidney Disease (CKD) in patients, built as an academic research project.

## Overview

NephroTrack helps clinicians screen, monitor, and assess CKD risk for patients using a **Tuned Random Forest** model trained on a 1,659-patient dataset with 51 clinical features. The system provides AI-driven risk predictions, patient management, visit tracking, and clinical reporting.

**Disclaimer:** This system is for clinical decision support only and must not replace professional medical diagnosis.

---

## Project Structure

```
nephrotrack-AI/
├── frontend/                ← React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/      ← Reusable UI components (Sidebar, Header)
│   │   ├── config/          ← Prediction form configuration (51 features)
│   │   ├── context/         ← Authentication context
│   │   └── pages/           ← All application pages
│   └── ...
├── backend/
│   ├── database/            ← PostgreSQL schema + seed scripts
│   ├── ml_service/          ← FastAPI ML prediction service
│   │   ├── ckd_artifacts/   ← Trained model, scaler, metadata
│   │   └── main.py          ← Prediction API endpoint
│   └── src/                 ← Node.js + Express API
│       ├── controllers/     ← Route handlers
│       ├── middleware/      ← Auth & error handling
│       └── routes/          ← API route definitions
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons, jsPDF |
| Backend API | Node.js, Express.js |
| ML Service | Python, FastAPI, scikit-learn |
| Database | PostgreSQL |
| ML Model | Tuned Random Forest (91.87% accuracy, 51 features) |
| Authentication | JWT (JSON Web Tokens), bcrypt |

---

## Features

### Pages
| Page | Description |
|------|-------------|
| Login | Secure role-based authentication |
| Dashboard | Role-specific stats, high-risk patients list, recent visits |
| Patient Registry | Search, filter, and view all patients |
| Patient Registration | Multi-section form to register new patients |
| Patient Profile | Demographics, vitals, lab results, visit timeline, prediction history |
| Clinical Visit | 4-step form: patient selection → vitals → labs → summary |
| CKD Prediction | 51-feature AI risk assessment with PDF report export |
| Reports | Risk distribution, demographics, filterable patient list, CSV export |
| User Management | Admin panel for managing staff accounts |

### User Roles
| Role | Access |
|------|--------|
| **Clinician** | Dashboard, Patients, New Visit, CKD Prediction, Reports |
| **Admin** | Dashboard, Patients, Reports, User Management |
| **Records Officer** | Dashboard, Patient Registry, Register Patient |

### ML Model
- **Algorithm:** Tuned Random Forest (GridSearchCV, 216 combinations)
- **Dataset:** 1,659 patients, 51 clinical features
- **Performance:** 91.87% Accuracy, 92.38% Precision, 99.34% Recall, 95.73% F1-Score
- **Class Balancing:** SMOTE (original: 92% CKD vs 8% non-CKD)
- **Feature Categories:** Demographics, Lifestyle, Medical History, Vitals, Lab Results, Electrolytes, Cholesterol, Medications, Symptoms, Environmental

---

## Running Locally

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- PostgreSQL 14+

### 1. Database Setup
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE nephrotrack;"

# Run the schema
psql -U postgres -d nephrotrack -f backend/database/schema.sql

# Seed staff accounts
cd backend
cp .env.example .env   # Edit with your DB credentials
npm install
node database/seed.js

# Seed patient data
node database/seed_patients.js
```

### 2. Backend API (Port 5000)
```bash
cd backend
npm install
npm run dev
```

### 3. ML Service (Port 8000)
```bash
cd backend/ml_service
python3 -m venv venv
source venv/bin/activate
pip install uvicorn fastapi joblib scikit-learn pandas
uvicorn main:app --reload --port 8000
```

### 4. Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Login Credentials
Three staff accounts are seeded with role-based access. Credentials are available from the project administrator.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User authentication |
| GET | /api/patients | List all patients |
| GET | /api/patients/:id | Patient detail with visits & labs |
| POST | /api/patients | Register new patient |
| GET | /api/visits | List all visits |
| POST | /api/visits | Record a clinical visit |
| POST | /api/predictions | Save prediction result |
| GET | /api/predictions/patient/:id | Patient prediction history |
| POST | /predict (ML Service) | Run CKD risk prediction |

---

## Author

Oyinkansola Sojirin — Final Year Research Project
