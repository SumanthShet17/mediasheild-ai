# 🏆 MediaShield AI — Team Coordination Guide

## Team Overview

| Member | Role | Focus Area | Files |
|---|---|---|---|
| **Member 1** | Frontend Lead | UI, Design System, Routing, Pages, Components | 21 files |
| **Member 2** | AI/ML Engineer | Gemini, Cloud Vision, Vertex AI, Content DNA Engine | 9 files |
| **Member 3** | Cloud/Backend | GCP Setup, Cloud Run, Storage, BigQuery, Mock Data | 10 files |
| **Member 4** | Visualization | D3.js Graph, Maps Heatmap, Charts, Animations | 8 files |

---

## ⏰ Parallel Work Timeline

```
HOUR 1-2: FOUNDATION (All work in parallel)
├── Member 1: Vite setup + design system + router + sidebar
├── Member 2: API key setup + gemini.js + perceptual-hash.js
├── Member 3: GCP project + enable APIs + create bucket + BigQuery tables
└── Member 4: Maps setup + start D3 propagation graph

HOUR 3-4: CORE FEATURES
├── Member 1: All 6 page layouts with placeholder divs
├── Member 2: content-dna.js + vision.js + credentials.js
├── Member 3: Dockerfile + storage.js + bigquery.js + mock data
└── Member 4: Complete D3 graph + start scan animation

HOUR 5-6: INTEGRATION
├── Member 1: Wire up components + connect to Member 2's AI functions
├── Member 2: Test full Content DNA pipeline + threat classification
├── Member 3: Test Cloud Run deploy + verify all services work
└── Member 4: Charts + similarity bars + maps heatmap

HOUR 7-8: POLISH
├── Member 1: Animations, hover effects, responsive fixes
├── Member 2: Error handling, fallback mock data, edge cases
├── Member 3: Final deploy + verify production URL
└── Member 4: Animation polish, graph interactions, tooltips

HOUR 9: FINAL CHECK
├── Everyone: End-to-end walkthrough on deployed URL
├── Record demo video / prepare presentation
└── Fix any last-minute bugs
```

---

## 🔗 Dependency Map

```
Member 3 starts FIRST (GCP setup takes time)
     ↓
Member 1 starts IMMEDIATELY (no dependencies)
     ↓
Member 2 needs API keys from Member 3
     ↓
Member 4 needs page containers from Member 1
     ↓
Integration: Member 2's functions → Member 1's pages
             Member 4's visuals → Member 1's containers
             Member 3's data → Member 4's visualizations
```

---

## 📂 File Ownership

```
mediashield-ai/
├── index.html                     ← Member 1
├── vite.config.js                 ← Member 1
├── package.json                   ← Member 1
├── Dockerfile                     ← Member 3
├── nginx.conf                     ← Member 3
├── .dockerignore                  ← Member 3
├── deploy.sh                      ← Member 3
├── .env.example                   ← Member 2
├── public/
│   └── favicon.svg                ← Member 1
├── src/
│   ├── main.js                    ← Member 1
│   ├── styles/
│   │   ├── index.css              ← Member 1
│   │   ├── components.css         ← Member 1
│   │   └── animations.css         ← Member 1 (with inputs from Member 4)
│   ├── pages/
│   │   ├── dashboard.js           ← Member 1 (connects Member 2 + 4)
│   │   ├── register.js            ← Member 1 (connects Member 2)
│   │   ├── monitor.js             ← Member 1 (connects Member 4)
│   │   ├── propagation.js         ← Member 1 (connects Member 4)
│   │   ├── threats.js             ← Member 1 (connects Member 2 + 4)
│   │   └── dmca.js                ← Member 1 (connects Member 2)
│   ├── components/
│   │   ├── sidebar.js             ← Member 1
│   │   ├── header.js              ← Member 1
│   │   ├── stats-card.js          ← Member 1
│   │   ├── asset-card.js          ← Member 1
│   │   ├── threat-feed.js         ← Member 1
│   │   ├── modal.js               ← Member 1
│   │   ├── geo-map.js             ← Member 4
│   │   ├── propagation-graph.js   ← Member 4
│   │   ├── threat-chart.js        ← Member 4
│   │   ├── scan-animation.js      ← Member 4
│   │   ├── similarity-bar.js      ← Member 4
│   │   └── activity-feed.js       ← Member 4
│   ├── services/
│   │   ├── gemini.js              ← Member 2
│   │   ├── vision.js              ← Member 2
│   │   ├── vertex-embeddings.js   ← Member 2
│   │   ├── storage.js             ← Member 3
│   │   ├── bigquery.js            ← Member 3
│   │   └── maps.js                ← Member 4
│   ├── engine/
│   │   ├── content-dna.js         ← Member 2
│   │   ├── perceptual-hash.js     ← Member 2
│   │   ├── similarity.js          ← Member 2
│   │   └── credentials.js         ← Member 2
│   ├── data/
│   │   ├── store.js               ← Member 3
│   │   ├── mock-detections.js     ← Member 3
│   │   └── mock-propagation.js    ← Member 3
│   └── utils/
│       ├── router.js              ← Member 1
│       ├── helpers.js             ← Member 1
│       └── constants.js           ← Member 2
```

---

## 🗝️ Required API Keys (Member 3 Creates, Everyone Uses)

```env
# .env file at project root
VITE_GEMINI_API_KEY=xxx          # From aistudio.google.com/apikey
VITE_GOOGLE_CLOUD_API_KEY=xxx    # From GCP Console → Credentials
VITE_MAPS_API_KEY=xxx            # From GCP Console → Credentials (can be same as above)
```

---

## 🎯 Demo Script (For Judges)

1. **Open Dashboard** → Show animated stats, threat chart, mini map
2. **Register an Asset** → Upload a sports image → Watch Content DNA pipeline:
   - Perceptual hashes computed in-browser (Web Workers)
   - Cloud Vision detects logos and text → Show detected logos + OCR
   - Gemini analyzes content → Shows sport/team/context description
   - Cryptographic credential signed → C2PA-style certificate displayed
3. **Open Monitor** → Start a scan → Watch radar animation + live detection feed
4. **Open Propagation** → Show the D3 force graph → Drag nodes, hover for tooltips, explain piracy networks
5. **Open Threats** → Show threat cards with severity → Click to see Gemini's AI analysis + similarity breakdown
6. **Open DMCA** → Select a threat → Gemini generates a professional takedown notice → Copy/Export

**Key talking points for each:**
- "This uses 6 Google Cloud services working together"
- "Gemini doesn't just find copies — it classifies the INTENT"
- "The propagation graph reveals piracy NETWORKS, not just individual copies"
- "Everything is deployed live on Cloud Run with a real URL"

---

## 🔑 Communication Rules

1. **Git branching**: Each member works on their own branch, merge to `main` before deploy
2. **Container ID convention**: All placeholder divs use kebab-case IDs like `dashboard-mini-map`, `propagation-graph`, `scan-animation`
3. **Export convention**: All modules use ES module `export` syntax
4. **Error handling**: Every API call must have a try/catch with graceful fallback to mock data
5. **No hardcoded API keys**: Always use `import.meta.env.VITE_*` for credentials

---

## 📱 Quick Reference: Where to Get Help

| Service | Documentation |
|---|---|
| Gemini API | [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs) |
| Cloud Vision API | [cloud.google.com/vision/docs](https://cloud.google.com/vision/docs) |
| Vertex AI Embeddings | [cloud.google.com/vertex-ai/docs](https://cloud.google.com/vertex-ai/docs) |
| Cloud Run | [cloud.google.com/run/docs](https://cloud.google.com/run/docs) |
| BigQuery | [cloud.google.com/bigquery/docs](https://cloud.google.com/bigquery/docs) |
| Maps JavaScript API | [developers.google.com/maps/documentation/javascript](https://developers.google.com/maps/documentation/javascript) |
| D3.js | [d3js.org](https://d3js.org) |
| Vite | [vite.dev](https://vite.dev) |
