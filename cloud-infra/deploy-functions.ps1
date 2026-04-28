function Import-DotEnv($path) {
  if (-not (Test-Path $path)) {
    return
  }

  Get-Content $path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $pair = $line -split "=", 2
    if ($pair.Length -ne 2) { return }
    $name = $pair[0].Trim()
    $value = $pair[1].Trim().Trim('"')
    if ($name) {
      [Environment]::SetEnvironmentVariable($name, $value)
    }
  }
}

$envPath = Join-Path $PSScriptRoot ".env"
Import-DotEnv $envPath

$ProjectId = $env:PROJECT_ID
$Region = $env:REGION
$DatasetId = $env:DATASET_ID

if (-not $ProjectId) { $ProjectId = "your-gcp-project-id" }
if (-not $Region) { $Region = "us-central1" }
if (-not $DatasetId) { $DatasetId = "mediashield" }

Write-Host "Deploying log-asset..."
gcloud functions deploy log-asset `
  --gen2 `
  --region $Region `
  --runtime nodejs20 `
  --entry-point logAsset `
  --trigger-http `
  --allow-unauthenticated `
  --set-env-vars "PROJECT_ID=$ProjectId,DATASET_ID=$DatasetId" `
  --source "cloud-functions/log-asset"

Write-Host "Deploying log-violation..."
gcloud functions deploy log-violation `
  --gen2 `
  --region $Region `
  --runtime nodejs20 `
  --entry-point logViolation `
  --trigger-http `
  --allow-unauthenticated `
  --set-env-vars "PROJECT_ID=$ProjectId,DATASET_ID=$DatasetId" `
  --source "cloud-functions/log-violation"

Write-Host "Function URLs:"
gcloud functions describe log-asset --gen2 --region $Region --format "value(serviceConfig.uri)"
gcloud functions describe log-violation --gen2 --region $Region --format "value(serviceConfig.uri)"
