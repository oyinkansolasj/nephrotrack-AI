# NephroTrack — AI- Kidney Disease Prediction 

A full-stack clinical decision support system for managing Kidney Disease in patients, built as a research/academic project.

## Overview

NephroTrack helps clinicians screen, monitor, and assess Kidney Disease risk for patients using an AI prediction model trained on clinical datasets.

**Disclaimer:** This system is for clinical decision support only and must not replace professional medical diagnosis.

---

## Project Structure (Monorepo)

```
nephrotrack-AI/
├── frontend/       ← React + Vite + Tailwind CSS 
├── backend/        ← Node.js + Express API 
├── ml-service/     ← Python + FastAPI prediction service 
├── docs/           ← Architecture, API specs, runbooks 
└── infra/          ← Docker, deployment configs
```

---

## Frontend

### Tech Stack
- **React 18** with Vite
- **Tailwind CSS v3** — utility-first styling
- **React Router v6** — client-side routing
- **Lucide React** — icons

### Pages & Features
| Page | Description |
|------|-------------|
| Login | Role-based authentication with demo accounts |
| Dashboard | Role-specific stats, high-risk patients, today's schedule |
| Patient Registry (List) | Search, filter, and view all patients(with their details) |
| Patient Registration | Multi-section form to register new patients |
| Patient Profile | Demographics, vitals, lab results, visit timeline, prediction history |
| Clinical Visit | 4-step form: patient info → vitals → labs → summary |
| CKD Prediction | AI risk assessment with feature importance breakdown |
| Reports | Risk distribution, demographics, filterable patient risk list |
| Billing | Invoice management and payment tracking (₦) |
| Admin / User Management | RBAC matrix, user list, invite users |

### User Roles
| Role | Access |
|------|--------|
| **Clinician** | Dashboard, Patients, New Visit, CKD Prediction, Reports |
| **Admin** | Dashboard, Patients, Reports, User Management |
| **Records Officer** | Dashboard, Patient List, Register Patient |
| **Billing** | Dashboard, Billing, Reports |

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Demo Login Credentials
| Role | Email | Password |
|------|-------|----------|
| Clinician | amara@nephrotrack.ng | demo123 |
| Admin | tunde@nephrotrack.ng | demo123 |
| Records Officer | ngozi@nephrotrack.ng | demo123 |
| Billing | emeka@nephrotrack.ng | demo123 |

---

## Development Stages

- [x] Stage 0 — Scope & production definition
- [x] Stage 1 — Requirements & workflows
- [x] Stage 8 — Frontend UI (current)
- [ ] Stage 3 — System architecture & repo setup
- [ ] Stage 4 — Database design (PostgreSQL)
- [ ] Stage 5 — Backend (Node.js + Express)
- [ ] Stage 6 — ML pipeline (Python + scikit-learn)
- [ ] Stage 7 — ML service (FastAPI)
- [ ] Stage 9 — Integration & E2E testing
- [ ] Stage 11 — Production deployment

---

## Author

Oyinkansola Sojirin — Research Project
