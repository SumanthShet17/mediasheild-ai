#!/bin/bash
set -e

ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.env"
+
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a
  . "$ENV_FILE"
  set +a
fi

PROJECT_ID="${PROJECT_ID:-your-gcp-project-id}"
REGION="${REGION:-us-central1}"
DATASET_ID="${DATASET_ID:-mediashield}"

printf "Deploying log-asset...\n"
gcloud functions deploy log-asset \
  --gen2 \
  --region ${REGION} \
  --runtime nodejs20 \
  --entry-point logAsset \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars "PROJECT_ID=${PROJECT_ID},DATASET_ID=${DATASET_ID}" \
  --source "cloud-functions/log-asset"

printf "Deploying log-violation...\n"
gcloud functions deploy log-violation \
  --gen2 \
  --region ${REGION} \
  --runtime nodejs20 \
  --entry-point logViolation \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars "PROJECT_ID=${PROJECT_ID},DATASET_ID=${DATASET_ID}" \
  --source "cloud-functions/log-violation"

printf "Function URLs:\n"
gcloud functions describe log-asset --gen2 --region ${REGION} --format "value(serviceConfig.uri)"
gcloud functions describe log-violation --gen2 --region ${REGION} --format "value(serviceConfig.uri)"
