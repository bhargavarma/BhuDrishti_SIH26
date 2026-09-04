# BhuDrishti_SIH26

AI-Powered Land Record Intelligence and Validation System

BhuDrishti digitizes scanned land records using OCR and AI-assisted extraction, validates extracted information, supports human verification, stores approved digital records, and provides a GIS visualization layer for verified land parcels.

## Overview

This project combines a React + TypeScript + Vite frontend with a FastAPI Python backend to manage the end-to-end flow for land-record processing:

- Upload scanned land record documents
- Preprocess document images for OCR readiness
- Extract structured fields from scanned text
- Validate extracted information against rules
- Support human verification workflows
- Store approved records in a local SQLite database for development
- Visualize verified records on a GIS map layer

## Workflow

Upload
→ Preprocess
→ OCR
→ AI Field Extraction
→ Multi-Tier Validation
→ Human Verification
→ Approved Digital Record
→ GIS / Export

## Architecture

- Frontend: React + TypeScript + Vite
- Backend: FastAPI + Python
- OCR: Tesseract + OpenCV + PyMuPDF
- Data layer: SQLAlchemy + SQLite (development)
- GIS: frontend map visualization using deterministic demo parcel coordinates
- Validation: rule-based validation and review workflow

## GIS Disclaimer

The current GIS visualization is an application-level verified-record map using deterministic demonstration coordinates where actual cadastral coordinates are unavailable. This project is not a live integration with DILRMP, ULPIN, Bhu-Aadhaar, NGDRS, RCCMS, or e-Courts. Any such integrations are planned future enhancements and are not implemented in the current codebase.

## Project Structure

```text
intelliland-ai/
├── src/                     # React frontend source
├── public/                  # Static frontend assets
├── backend/
│   ├── app/
│   │   ├── core/            # Database config and bootstrapping
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic/API schemas
│   │   ├── services/        # OCR, extraction, preprocessing, validation
│   │   └── main.py          # FastAPI application entrypoint
│   ├── data/               # Local runtime data (ignored in Git)
│   ├── uploads/            # Uploaded documents (ignored in Git)
│   ├── processed/          # Processed files (ignored in Git)
│   └── requirements.txt    # Python backend dependencies
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── .env.example            # Example environment variables
├── .gitignore
├── README.md
└── package-lock.json
```

## Frontend Setup

```bash
npm install
npm run dev
```

Frontend URL:

- http://localhost:5173

## Backend Setup

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m uvicorn backend.app.main:app --reload
```

Backend API base URL:

- http://127.0.0.1:8000

Health check:

- http://127.0.0.1:8000/api/health

## OCR Requirement

Tesseract OCR must be installed on Windows and configured appropriately for the backend to extract text from scanned land records.

## Notes

- This repository intentionally excludes local runtime artifacts, generated data, virtual environments, secrets, and machine-specific files.
- The source code remains committed so the project can be recreated locally and run with the provided setup steps.
