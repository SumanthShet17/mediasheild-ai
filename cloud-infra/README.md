# Cloud Infra (Member 3)

This folder keeps all backend/cloud work separate from frontend `src/`.

## What is included

- Cloud Functions for logging assets and violations to BigQuery
- Deployment scripts
- Config template for required values

## Required GCP resources

- Project ID
- BigQuery dataset: `mediashield`
- Tables: `assets`, `violations`
- Cloud Storage bucket for assets/evidence
- APIs enabled: Cloud Functions, BigQuery, Storage, Cloud Build, Cloud Run

## Maps setup

- Enable **Maps JavaScript API**
- Create a Maps API key
- Restrict the key to HTTP referrers (your domains)

## Configure

1) Copy the template and fill values:

```bash
cp config.example.env .env
```

2) Keep the Vite keys aligned with frontend/AI:

- `VITE_PROJECT_ID`
- `VITE_DATASET_ID`
- `VITE_BUCKET_NAME`
- `VITE_LOG_ASSET_URL`
- `VITE_LOG_VIOLATION_URL`
- `VITE_GEMINI_API_KEY`
- `VITE_GOOGLE_CLOUD_API_KEY`
- `VITE_MAPS_API_KEY`

## Deploy functions

PowerShell:

```powershell
cd cloud-infra
.\deploy-functions.ps1
```

Bash:

```bash
cd cloud-infra
bash deploy-functions.sh
```

After deploy, update `.env` (and the frontend/AI `.env`) with:

- `VITE_LOG_ASSET_URL`
- `VITE_LOG_VIOLATION_URL`

## Integration notes (frontend)

No frontend files are modified here. The frontend can call:

- `POST $VITE_LOG_ASSET_URL` with asset payload
- `POST $VITE_LOG_VIOLATION_URL` with violation payload

Example payloads are in `cloud-infra/examples/`.
