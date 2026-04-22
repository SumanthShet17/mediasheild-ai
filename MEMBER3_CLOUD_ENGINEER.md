# 👤 MEMBER 3 — Cloud/Backend Engineer (GCP Infrastructure + Data)

## Your Role
You build the **cloud backbone** — Cloud Run deployment, Cloud Storage for assets, BigQuery for violation logging, Cloud Functions for enforcement actions, and wire up the event-driven pipeline. You make the system **production-grade** and **deployed live on the internet**.

**Depends on**: Member 1 (frontend code to deploy), Member 2 (API keys and configurations)
**Others depend on you**: Everyone — they need the deployed URL, storage functions, and data logging

---

## 🎯 Your Deliverables

| # | File | Purpose |
|---|---|---|
| 1 | `Dockerfile` | Container image for Cloud Run deployment |
| 2 | `nginx.conf` | Nginx config for SPA routing in the container |
| 3 | `.dockerignore` | Exclude node_modules, .env from image |
| 4 | `cloudbuild.yaml` | Cloud Build config (optional, for CI/CD) |
| 5 | `src/services/storage.js` | Cloud Storage operations (upload/download assets) |
| 6 | `src/services/bigquery.js` | BigQuery logging (log violations, query analytics) |
| 7 | `src/data/store.js` | IndexedDB local cache (for offline/demo mode) |
| 8 | `src/data/mock-detections.js` | Realistic simulated detection data |
| 9 | `src/data/mock-propagation.js` | Realistic simulated propagation network data |
| 10 | `deploy.sh` | One-command deployment script |

---

## ☁️ GCP Project Setup (Do This FIRST)

### Step 1: Create GCP Project
```bash
# Install gcloud CLI if not installed
# https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Create project (or use existing)
gcloud projects create mediashield-ai --name="MediaShield AI"
gcloud config set project mediashield-ai

# Enable billing (required — use free trial $300 credit)
# Do this in console: https://console.cloud.google.com/billing
```

### Step 2: Enable All Required APIs
```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  vision.googleapis.com \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  bigquery.googleapis.com \
  cloudfunctions.googleapis.com \
  pubsub.googleapis.com \
  cloudscheduler.googleapis.com \
  maps-backend.googleapis.com
```

### Step 3: Create API Keys
```bash
# Create an API key for client-side API access
# Go to: console.cloud.google.com → APIs & Services → Credentials → Create API Key

# Restrict the key to:
# - Cloud Vision API
# - Maps JavaScript API
# - Generative Language API (for Gemini)
```

### Step 4: Create Cloud Storage Bucket
```bash
gcloud storage buckets create gs://mediashield-assets-YOUR_PROJECT_ID \
  --location=us-central1 \
  --uniform-bucket-level-access

# Enable public read for demo (or use signed URLs in production)
gcloud storage buckets add-iam-policy-binding gs://mediashield-assets-YOUR_PROJECT_ID \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

### Step 5: Create BigQuery Dataset & Tables
```bash
# Create dataset
bq mk --dataset mediashield

# Create assets table
bq mk --table mediashield.assets \
  asset_id:STRING,org_id:STRING,upload_timestamp:TIMESTAMP,storage_uri:STRING,gemini_description:STRING,sport_type:STRING,content_type:STRING,labels:STRING,hashes_phash:STRING,hashes_dhash:STRING,hashes_ahash:STRING,credential_hash:STRING,status:STRING

# Create violations table
bq mk --table mediashield.violations \
  violation_id:STRING,asset_id:STRING,detected_timestamp:TIMESTAMP,source_url:STRING,source_platform:STRING,similarity_score:FLOAT,modification_type:STRING,usage_context:STRING,commercial_intent:STRING,severity:STRING,lat:FLOAT,lng:FLOAT,country:STRING,gemini_analysis:STRING,status:STRING,dmca_notice_uri:STRING
```

---

## 📦 File Specifications

### 1. `Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### 2. `nginx.conf`

```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 3. `.dockerignore`

```
node_modules
.env
.git
*.md
.DS_Store
```

### 4. `deploy.sh` — One-Command Deployment

```bash
#!/bin/bash
set -e

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
SERVICE_NAME="mediashield-dashboard"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying MediaShield AI to Cloud Run..."
echo "   Project: ${PROJECT_ID}"
echo "   Region:  ${REGION}"

# Build and push container image
echo "📦 Building container image..."
gcloud builds submit --tag ${IMAGE} .

# Deploy to Cloud Run
echo "☁️ Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 5 \
  --port 8080

# Get the deployed URL
URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)')
echo ""
echo "✅ Deployment complete!"
echo "🌐 Live URL: ${URL}"
echo ""
echo "📋 Share this URL with judges!"
```

---

### 5. `src/services/storage.js` — Cloud Storage Operations

```javascript
/**
 * Cloud Storage operations for the prototype.
 * 
 * For the hackathon: We use the JSON API directly from the browser.
 * In production: Use signed URLs or a backend proxy for security.
 */

const BUCKET_NAME = 'mediashield-assets-YOUR_PROJECT_ID'; // Replace with actual bucket

/**
 * Upload an image to Cloud Storage
 * Returns the public URL
 */
export async function uploadAsset(imageFile, assetId) {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
  const path = `originals/${assetId}/${imageFile.name}`;
  
  try {
    const response = await fetch(
      `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=${encodeURIComponent(path)}&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': imageFile.type },
        body: imageFile
      }
    );
    
    const data = await response.json();
    return {
      uri: `gs://${BUCKET_NAME}/${path}`,
      publicUrl: `https://storage.googleapis.com/${BUCKET_NAME}/${path}`,
      metadata: data
    };
  } catch (error) {
    console.warn('Cloud Storage upload failed, using local storage:', error);
    return saveToLocal(imageFile, assetId);
  }
}

/**
 * Upload evidence package for DMCA
 */
export async function uploadEvidence(violationId, evidenceData) {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
  const path = `evidence/${violationId}/analysis.json`;
  
  try {
    const response = await fetch(
      `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=${encodeURIComponent(path)}&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidenceData)
      }
    );
    
    const data = await response.json();
    return `https://storage.googleapis.com/${BUCKET_NAME}/${path}`;
  } catch (error) {
    console.warn('Evidence upload failed:', error);
    return null;
  }
}

/**
 * Fallback: Save to IndexedDB when Cloud Storage is unavailable
 */
async function saveToLocal(imageFile, assetId) {
  const { saveAsset } = await import('../data/store.js');
  const base64 = await fileToBase64(imageFile);
  await saveAsset(assetId, base64);
  return {
    uri: `local://${assetId}`,
    publicUrl: base64,
    metadata: { local: true }
  };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

### 6. `src/services/bigquery.js` — Violation Logging

```javascript
/**
 * BigQuery operations via REST API.
 * 
 * For hackathon: We use the BigQuery REST API with API key auth.
 * In production: Use a service account + backend proxy.
 * 
 * IMPORTANT: BigQuery REST API from browser requires OAuth2 or API key.
 * For the prototype, we'll log locally AND attempt BigQuery.
 * If BigQuery is not accessible from browser (CORS), we log to IndexedDB
 * and show what the BigQuery data would look like.
 */

const PROJECT_ID = 'mediashield-ai';  // Replace with actual project ID
const DATASET = 'mediashield';

/**
 * Log a registered asset to BigQuery
 */
export async function logAsset(assetData) {
  const row = {
    asset_id: assetData.id,
    org_id: assetData.orgId || 'demo-org',
    upload_timestamp: assetData.timestamp,
    storage_uri: assetData.storageUri || '',
    gemini_description: assetData.gemini?.description || '',
    sport_type: assetData.gemini?.sport_type || '',
    content_type: assetData.gemini?.content_type || '',
    labels: JSON.stringify(assetData.vision?.labels || []),
    hashes_phash: assetData.hashes?.pHash || '',
    hashes_dhash: assetData.hashes?.dHash || '',
    hashes_ahash: assetData.hashes?.aHash || '',
    credential_hash: assetData.credential?.hash || '',
    status: 'active'
  };

  // Log locally (always works)
  await logToLocal('assets', row);
  
  // Attempt BigQuery insert (may fail due to browser CORS)
  try {
    await insertBigQueryRow('assets', row);
    console.log('✅ Logged to BigQuery:', row.asset_id);
  } catch (e) {
    console.log('ℹ️ BigQuery direct insert not available from browser. Data logged locally.');
  }
  
  return row;
}

/**
 * Log a detected violation to BigQuery
 */
export async function logViolation(violationData) {
  const row = {
    violation_id: violationData.id || crypto.randomUUID(),
    asset_id: violationData.assetId,
    detected_timestamp: new Date().toISOString(),
    source_url: violationData.sourceUrl,
    source_platform: violationData.platform,
    similarity_score: violationData.similarityScore,
    modification_type: violationData.modificationType,
    usage_context: violationData.usageContext,
    commercial_intent: violationData.commercialIntent,
    severity: violationData.severity,
    lat: violationData.location?.lat || 0,
    lng: violationData.location?.lng || 0,
    country: violationData.location?.country || 'Unknown',
    gemini_analysis: JSON.stringify(violationData.geminiAnalysis || {}),
    status: 'detected',
    dmca_notice_uri: ''
  };

  await logToLocal('violations', row);
  
  try {
    await insertBigQueryRow('violations', row);
  } catch (e) {
    // Silent fail — logged locally
  }
  
  return row;
}

/**
 * Get violation analytics (from local data)
 */
export async function getViolationStats() {
  const violations = await getFromLocal('violations');
  
  return {
    total: violations.length,
    bySeverity: {
      critical: violations.filter(v => v.severity === 'critical').length,
      high: violations.filter(v => v.severity === 'high').length,
      medium: violations.filter(v => v.severity === 'medium').length,
      low: violations.filter(v => v.severity === 'low').length
    },
    byPlatform: groupBy(violations, 'source_platform'),
    byCountry: groupBy(violations, 'country'),
    recentViolations: violations.slice(-20).reverse()
  };
}

// BigQuery REST API insert (may not work from browser due to CORS)
async function insertBigQueryRow(table, row) {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${PROJECT_ID}/datasets/${DATASET}/tables/${table}/insertAll?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rows: [{ json: row }]
    })
  });
  
  return response.json();
}

// Local storage helpers (IndexedDB)
async function logToLocal(storeName, data) {
  const { saveRecord } = await import('../data/store.js');
  await saveRecord(storeName, data);
}

async function getFromLocal(storeName) {
  const { getAllRecords } = await import('../data/store.js');
  return getAllRecords(storeName);
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const val = item[key] || 'Unknown';
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}
```

---

### 7. `src/data/store.js` — IndexedDB Local Cache

```javascript
/**
 * IndexedDB wrapper for local data persistence.
 * Acts as a cache when cloud services are unavailable.
 */

const DB_NAME = 'mediashield';
const DB_VERSION = 1;
const STORES = ['assets', 'violations', 'dmca_notices'];

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: 'id', autoIncrement: true });
        }
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecord(storeName, data) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  // Ensure it has an id
  if (!data.id) data.id = crypto.randomUUID();
  store.put(data);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(data);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRecord(storeName, id) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const request = store.get(id);
  return new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

export async function getAllRecords(storeName) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const request = store.getAll();
  return new Promise((resolve) => {
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => resolve([]);
  });
}

export async function deleteRecord(storeName, id) {
  const db = await openDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.delete(id);
  return new Promise((resolve) => {
    tx.oncomplete = () => resolve(true);
  });
}

export async function saveAsset(assetId, base64Data) {
  return saveRecord('assets', { id: assetId, imageData: base64Data, timestamp: new Date().toISOString() });
}
```

---

### 8. `src/data/mock-detections.js` — Simulated Detection Data

```javascript
/**
 * Realistic mock detection data for demo purposes.
 * This simulates what the scanning pipeline would find.
 * Used by the Monitor page and Threats page.
 */

export const mockDetections = [
  {
    id: 'det-001',
    assetId: 'asset-001',
    assetName: 'IPL Final Celebration Shot',
    sourceUrl: 'https://suspicious-betting-site.com/ipl-promo',
    platform: 'Web',
    platformIcon: '🌐',
    similarity: 94,
    modificationType: 'cropped',
    usageContext: 'commercial',
    commercialIntent: 'high',
    severity: 'critical',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    location: { lat: 25.2048, lng: 55.2708, country: 'UAE' },
    geminiAnalysis: {
      evidence_summary: 'Original IPL celebration image has been cropped and used as promotional material on an offshore betting website. Team logos clearly visible. Commercial intent is evident.',
      recommended_action: 'immediate_dmca'
    }
  },
  {
    id: 'det-002',
    assetId: 'asset-002',
    assetName: 'Premier League Goal Highlight',
    sourceUrl: 'https://twitter.com/fan_account_xyz/status/12345',
    platform: 'Twitter/X',
    platformIcon: '🐦',
    similarity: 78,
    modificationType: 'overlaid',
    usageContext: 'fan_sharing',
    commercialIntent: 'none',
    severity: 'low',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    location: { lat: 51.5074, lng: -0.1278, country: 'UK' },
    geminiAnalysis: {
      evidence_summary: 'Fan account shared a screenshot of a Premier League goal with added text commentary. Non-commercial use, likely falls under fair use for commentary purposes.',
      recommended_action: 'monitor'
    }
  },
  {
    id: 'det-003',
    assetId: 'asset-003',
    assetName: 'NBA Slam Dunk Photo',
    sourceUrl: 'https://fake-merch-store.com/t-shirts/nba-dunk',
    platform: 'Web',
    platformIcon: '🌐',
    similarity: 88,
    modificationType: 'remixed',
    usageContext: 'merchandise',
    commercialIntent: 'high',
    severity: 'critical',
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    location: { lat: 23.8103, lng: 90.4125, country: 'Bangladesh' },
    geminiAnalysis: {
      evidence_summary: 'Official NBA action shot has been repurposed as a print design on unauthorized merchandise. Image has been stylized with filters but original composition is clearly identifiable.',
      recommended_action: 'immediate_dmca'
    }
  },
  {
    id: 'det-004',
    assetId: 'asset-001',
    assetName: 'IPL Final Celebration Shot',
    sourceUrl: 'https://t.me/sports_piracy_channel/4521',
    platform: 'Telegram',
    platformIcon: '📱',
    similarity: 97,
    modificationType: 'unmodified',
    usageContext: 'editorial',
    commercialIntent: 'medium',
    severity: 'high',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    location: { lat: 19.0760, lng: 72.8777, country: 'India' },
    geminiAnalysis: {
      evidence_summary: 'Virtually unmodified copy of original IPL celebration image distributed through a Telegram channel known for sports content redistribution. High subscriber count suggests organized piracy.',
      recommended_action: 'investigate'
    }
  },
  {
    id: 'det-005',
    assetId: 'asset-004',
    assetName: 'FIFA World Cup Logo Usage',
    sourceUrl: 'https://instagram.com/p/xyz123',
    platform: 'Instagram',
    platformIcon: '📸',
    similarity: 72,
    modificationType: 'recolored',
    usageContext: 'fan_sharing',
    commercialIntent: 'low',
    severity: 'medium',
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    location: { lat: -23.5505, lng: -46.6333, country: 'Brazil' },
    geminiAnalysis: {
      evidence_summary: 'FIFA World Cup branding elements recolored and incorporated into fan-created content on Instagram. Some commercial elements present (link in bio to merchandise).',
      recommended_action: 'investigate'
    }
  },
  {
    id: 'det-006',
    assetId: 'asset-005',
    assetName: 'Tennis Grand Slam Match Photo',
    sourceUrl: 'https://reddit.com/r/sports/comments/abc123',
    platform: 'Reddit',
    platformIcon: '🔴',
    similarity: 65,
    modificationType: 'screenshot',
    usageContext: 'editorial',
    commercialIntent: 'none',
    severity: 'low',
    timestamp: new Date(Date.now() - 300 * 60000).toISOString(),
    location: { lat: 37.7749, lng: -122.4194, country: 'USA' },
    geminiAnalysis: {
      evidence_summary: 'Low-quality screenshot of a tennis match broadcast shared in a sports discussion thread. Editorial/commentary context. Minimal commercial impact.',
      recommended_action: 'ignore'
    }
  },
  {
    id: 'det-007',
    assetId: 'asset-002',
    assetName: 'Premier League Goal Highlight',
    sourceUrl: 'https://youtube.com/watch?v=fake123',
    platform: 'YouTube',
    platformIcon: '▶️',
    similarity: 91,
    modificationType: 'cropped',
    usageContext: 'commercial',
    commercialIntent: 'high',
    severity: 'high',
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    location: { lat: 28.6139, lng: 77.2090, country: 'India' },
    geminiAnalysis: {
      evidence_summary: 'Monetized YouTube channel using Premier League goal highlight clips with minimal transformation. Channel runs ads and has 500K+ subscribers. Clear commercial piracy operation.',
      recommended_action: 'immediate_dmca'
    }
  },
  {
    id: 'det-008',
    assetId: 'asset-003',
    assetName: 'NBA Slam Dunk Photo',
    sourceUrl: 'https://tiktok.com/@sports_clips/video/987654',
    platform: 'TikTok',
    platformIcon: '🎵',
    similarity: 82,
    modificationType: 'overlaid',
    usageContext: 'fan_sharing',
    commercialIntent: 'low',
    severity: 'medium',
    timestamp: new Date(Date.now() - 240 * 60000).toISOString(),
    location: { lat: 34.0522, lng: -118.2437, country: 'USA' },
    geminiAnalysis: {
      evidence_summary: 'NBA action photo used as background in a TikTok compilation with music overlay and text commentary. Creator monetization enabled but low direct commercial impact.',
      recommended_action: 'monitor'
    }
  }
];

/**
 * Simulate new detections appearing over time
 * Called by the Monitor page to simulate real-time scanning
 */
export function simulateDetectionStream(callback, intervalMs = 3000) {
  let index = 0;
  const interval = setInterval(() => {
    if (index >= mockDetections.length) {
      index = 0; // Loop
    }
    // Create a "fresh" detection with current timestamp
    const detection = {
      ...mockDetections[index],
      id: `det-live-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    callback(detection);
    index++;
  }, intervalMs);
  
  return () => clearInterval(interval); // Return cleanup function
}

/**
 * Get platform scan statuses
 */
export function getPlatformStatuses() {
  return [
    { name: 'Twitter/X', icon: '🐦', status: 'scanning', found: 12, scanned: 1456 },
    { name: 'YouTube', icon: '▶️', status: 'scanning', found: 8, scanned: 892 },
    { name: 'Instagram', icon: '📸', status: 'complete', found: 5, scanned: 2103 },
    { name: 'Telegram', icon: '📱', status: 'scanning', found: 15, scanned: 567 },
    { name: 'TikTok', icon: '🎵', status: 'pending', found: 3, scanned: 0 },
    { name: 'Facebook', icon: '📘', status: 'complete', found: 4, scanned: 1234 },
    { name: 'Reddit', icon: '🔴', status: 'scanning', found: 2, scanned: 789 },
    { name: 'Web', icon: '🌐', status: 'scanning', found: 9, scanned: 3456 }
  ];
}
```

---

### 9. `src/data/mock-propagation.js` — Network Graph Data

```javascript
/**
 * Mock propagation network data for the D3.js force graph.
 * Represents how a piece of content spreads across platforms.
 */

export const propagationData = {
  nodes: [
    // Source (original)
    { id: 'original', label: 'Official Account', type: 'source', platform: 'Official', size: 30, color: '#10b981' },
    
    // First-level spread (authorized)
    { id: 'auth-1', label: '@SportsChannel', type: 'authorized', platform: 'YouTube', size: 20, color: '#10b981' },
    { id: 'auth-2', label: '@OfficialNews', type: 'authorized', platform: 'Twitter/X', size: 18, color: '#10b981' },
    
    // Second-level (suspicious)
    { id: 'sus-1', label: '@HighlightsHQ', type: 'suspicious', platform: 'YouTube', size: 15, color: '#f59e0b' },
    { id: 'sus-2', label: 'sports-news.blog', type: 'suspicious', platform: 'Web', size: 12, color: '#f59e0b' },
    
    // Third-level (unauthorized — piracy network)
    { id: 'unauth-1', label: '@PirateSports', type: 'unauthorized', platform: 'Telegram', size: 22, color: '#ef4444' },
    { id: 'unauth-2', label: 'betting-site.com', type: 'unauthorized', platform: 'Web', size: 18, color: '#ef4444' },
    { id: 'unauth-3', label: '@FreeStreams', type: 'unauthorized', platform: 'Telegram', size: 20, color: '#ef4444' },
    { id: 'unauth-4', label: 'merch-store.com', type: 'unauthorized', platform: 'Web', size: 14, color: '#ef4444' },
    { id: 'unauth-5', label: '@SportClips99', type: 'unauthorized', platform: 'TikTok', size: 16, color: '#ef4444' },
    
    // Fourth-level (downstream from pirates)
    { id: 'down-1', label: '@FanAccount1', type: 'unauthorized', platform: 'Instagram', size: 8, color: '#ef4444' },
    { id: 'down-2', label: '@FanAccount2', type: 'unauthorized', platform: 'Twitter/X', size: 8, color: '#ef4444' },
    { id: 'down-3', label: '@Repost_Bot', type: 'unauthorized', platform: 'Telegram', size: 10, color: '#ef4444' },
    { id: 'down-4', label: 'reddit-post-1', type: 'suspicious', platform: 'Reddit', size: 8, color: '#f59e0b' },
    { id: 'down-5', label: 'facebook-share', type: 'suspicious', platform: 'Facebook', size: 8, color: '#f59e0b' },
  ],
  
  links: [
    // From original
    { source: 'original', target: 'auth-1', weight: 3, timestamp: 0 },
    { source: 'original', target: 'auth-2', weight: 3, timestamp: 5 },
    
    // Authorized spread
    { source: 'auth-1', target: 'sus-1', weight: 2, timestamp: 30 },
    { source: 'auth-2', target: 'sus-2', weight: 2, timestamp: 45 },
    
    // Leak to piracy network
    { source: 'sus-1', target: 'unauth-1', weight: 2, timestamp: 60 },
    { source: 'auth-2', target: 'unauth-2', weight: 1, timestamp: 90 },
    { source: 'unauth-1', target: 'unauth-3', weight: 3, timestamp: 75 },
    { source: 'unauth-1', target: 'unauth-4', weight: 1, timestamp: 100 },
    { source: 'sus-1', target: 'unauth-5', weight: 2, timestamp: 80 },
    
    // Downstream spread
    { source: 'unauth-3', target: 'down-1', weight: 1, timestamp: 120 },
    { source: 'unauth-3', target: 'down-2', weight: 1, timestamp: 130 },
    { source: 'unauth-1', target: 'down-3', weight: 2, timestamp: 110 },
    { source: 'unauth-5', target: 'down-4', weight: 1, timestamp: 140 },
    { source: 'unauth-2', target: 'down-5', weight: 1, timestamp: 150 },
  ]
};

/**
 * Get statistics about the propagation network
 */
export function getPropagationStats() {
  const { nodes, links } = propagationData;
  
  return {
    totalNodes: nodes.length,
    authorizedNodes: nodes.filter(n => n.type === 'authorized' || n.type === 'source').length,
    suspiciousNodes: nodes.filter(n => n.type === 'suspicious').length,
    unauthorizedNodes: nodes.filter(n => n.type === 'unauthorized').length,
    totalConnections: links.length,
    superSpreaders: nodes.filter(n => {
      const outgoing = links.filter(l => l.source === n.id).length;
      return outgoing >= 3;
    }),
    piracyClusters: ['Telegram Network (3 nodes)', 'Web Piracy (2 nodes)'],
    spreadTimeMinutes: Math.max(...links.map(l => l.timestamp))
  };
}
```

---

## 🔌 Integration with Other Members

### Member 1 (Frontend) uses:
```javascript
import { saveRecord, getAllRecords } from '../data/store.js';
import { mockDetections, simulateDetectionStream } from '../data/mock-detections.js';
import { propagationData, getPropagationStats } from '../data/mock-propagation.js';
```

### Member 2 (AI) uses:
```javascript
// storage.js for uploading assets to Cloud Storage
import { uploadAsset, uploadEvidence } from '../services/storage.js';
// bigquery.js for logging
import { logAsset, logViolation } from '../services/bigquery.js';
```

### Member 4 (Visualization) uses:
```javascript
import { propagationData } from '../data/mock-propagation.js';
import { mockDetections } from '../data/mock-detections.js';
```

---

## ✅ Checklist

- [ ] Create GCP project and enable ALL required APIs
- [ ] Create API keys (Cloud Vision, Maps, Gemini)
- [ ] Create Cloud Storage bucket
- [ ] Create BigQuery dataset and tables
- [ ] Create `Dockerfile` and `nginx.conf`
- [ ] Create `.dockerignore`
- [ ] Create `deploy.sh` deployment script
- [ ] Implement `storage.js` with upload functions
- [ ] Implement `bigquery.js` with logging functions
- [ ] Implement `store.js` IndexedDB wrapper
- [ ] Create `mock-detections.js` with 8+ realistic detections
- [ ] Create `mock-propagation.js` with network graph data
- [ ] Test local build: `npm run build` → verify `dist/` output
- [ ] Build Docker image locally: `docker build -t mediashield .`
- [ ] Test Docker locally: `docker run -p 8080:8080 mediashield`
- [ ] Deploy to Cloud Run: `bash deploy.sh`
- [ ] Verify deployed URL works
- [ ] Share deployed URL with team and judges

**Timeline**: GCP setup + deployment in **2-3 hours**. Mock data + storage/BigQuery services in **1-2 hours**.
