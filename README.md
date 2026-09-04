# BhuDrishti_SIH26

AI-powered land record digitization, validation, human verification, and GIS visualization platform for SIH 2026.

## Overview

BhuDrishti converts scanned land records into structured digital records using OCR and AI-assisted field extraction. Records pass through validation and human verification before approved data is persisted and made available through the records registry, application GIS view, and JSON export.

## Workflow

Upload -> Preprocess -> OCR -> AI Field Extraction -> Multi-Tier Validation -> Human Verification -> Approved Digital Record -> GIS / Export

## Architecture

- React, TypeScript, Vite, React Router, and Lucide React frontend
- FastAPI and Python backend
- OpenCV preprocessing
- PyMuPDF PDF rendering
- Tesseract OCR through pytesseract
- SQLAlchemy with SQLite for development persistence
- Leaflet and React Leaflet application-level GIS visualization

## Project Structure

```text
src/                 React application, pages, components, layouts, and API service
backend/app/         FastAPI application, models, schemas, and pipeline services
backend/requirements.txt
public/              Static frontend assets
```

## Setup

### Frontend

```powershell
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

### Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m uvicorn backend.app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`. Health check: `GET /api/health`.

Install Tesseract OCR separately on Windows. The current backend expects the executable at `C:\Program Files\Tesseract-OCR\tesseract.exe` unless the OCR configuration is changed.

### Environment

Copy `.env.example` to a local `.env` when needed. Do not commit local environment files or secrets.

## API Workflow

The backend provides upload, preprocessing, OCR, extraction, validation, human review, approved-record, records, GIS, and export endpoints under `/api`.

## GIS Disclaimer

The current GIS view is an application-level verified-record map. It uses deterministic demonstration coordinates and small parcel polygons when authoritative coordinates are unavailable. These locations are not official cadastral coordinates.

BhuDrishti does not currently claim live integration with DILRMP, ULPIN/Bhu-Aadhaar, NGDRS, RCCMS, e-Courts, or government cadastral GIS services. Those are future integration possibilities.

## Security and Runtime Data

Local uploads, processed pages, SQLite databases, virtual environments, build output, caches, logs, and environment files are excluded through `.gitignore`. Never commit real citizens' land records, personally identifiable documents, credentials, or private keys.
