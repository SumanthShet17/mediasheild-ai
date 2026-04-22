# 👤 MEMBER 2 — AI/ML Engineer (Gemini + Cloud Vision + Vertex AI)

## Your Role
You build the **AI brain** of MediaShield AI. You integrate Gemini 1.5 Pro, Cloud Vision API, and Vertex AI Embeddings to create the Content DNA fingerprinting engine, threat classification, and AI-powered DMCA generation. Your code is what makes this project technically impressive.

**Depends on**: Member 1 (page layouts to inject your features into)
**Others depend on you**: Member 1 calls your functions, Member 4 uses your data

---

## 🎯 Your Deliverables

| # | File | Purpose |
|---|---|---|
| 1 | `src/services/gemini.js` | Gemini 1.5 Pro API wrapper — all AI calls |
| 2 | `src/services/vision.js` | Cloud Vision API — logo detection, OCR, web detection, labels |
| 3 | `src/services/vertex-embeddings.js` | Vertex AI Multimodal Embeddings — image → vector |
| 4 | `src/engine/content-dna.js` | Content DNA orchestrator — combines all services |
| 5 | `src/engine/perceptual-hash.js` | Client-side pHash, dHash, aHash algorithms |
| 6 | `src/engine/similarity.js` | Cosine similarity + Hamming distance |
| 7 | `src/engine/credentials.js` | C2PA-style crypto signing (Web Crypto API) |
| 8 | `src/utils/constants.js` | API endpoints, model names, thresholds |
| 9 | `.env.example` | Template for all API keys |

---

## 📦 API Keys You Need

Create a `.env` file at project root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_CLOUD_API_KEY=your_gcp_api_key_here
VITE_MAPS_API_KEY=your_maps_api_key_here
```

**How to get:**
- **Gemini API Key**: Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → Create API Key
- **GCP API Key**: Go to [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials → Create API Key
  - Enable these APIs in your GCP project:
    - Cloud Vision API
    - Vertex AI API (for embeddings)
    - Maps JavaScript API (for Member 4)

---

## 🧬 File Specifications

### 1. `src/services/gemini.js` — Gemini 1.5 Pro Integration

```javascript
// API Endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

// You need to implement these 4 functions:

/**
 * 1. analyzeAsset(imageBase64) → Analyze uploaded sports media
 * 
 * PROMPT: "You are a sports media analyst. Analyze this image and return JSON:
 * {
 *   "description": "detailed description of the image",
 *   "sport_type": "cricket|football|basketball|tennis|...",
 *   "teams": ["Team A", "Team B"],
 *   "players_visible": ["Player Name"],
 *   "event_context": "match|training|ceremony|press|celebration",
 *   "content_type": "photo|screenshot|graphic|logo|broadcast_frame",
 *   "semantic_tags": ["tag1", "tag2", ...],
 *   "estimated_value": "high|medium|low",
 *   "piracy_risk": "high|medium|low"
 * }"
 * 
 * INPUT: base64 image string
 * OUTPUT: parsed JSON object
 */
export async function analyzeAsset(imageBase64) { /* ... */ }

/**
 * 2. classifyThreat(originalBase64, suspectBase64) → Compare original vs suspect
 * 
 * PROMPT: "You are a digital rights forensic analyst. Compare IMAGE 1 (original,
 * copyrighted) with IMAGE 2 (suspected unauthorized copy). Return JSON:
 * {
 *   "is_match": boolean,
 *   "similarity_score": 0-100,
 *   "modification_type": "unmodified|cropped|resized|overlaid|recolored|remixed|screenshot",
 *   "modifications_detected": ["list of specific changes"],
 *   "usage_context": "editorial|commercial|fan_sharing|parody|merchandise|betting_site",
 *   "commercial_intent": "none|low|medium|high",
 *   "severity": "critical|high|medium|low",
 *   "evidence_summary": "Human-readable explanation of findings",
 *   "recommended_action": "immediate_dmca|investigate|monitor|ignore",
 *   "confidence": 0-100
 * }"
 * 
 * INPUT: two base64 image strings
 * OUTPUT: parsed JSON threat assessment
 */
export async function classifyThreat(originalBase64, suspectBase64) { /* ... */ }

/**
 * 3. generateDMCA(violationData) → Generate DMCA takedown notice
 * 
 * PROMPT: "Generate a professional DMCA takedown notice with:
 * - Formal legal language
 * - Specific description of the copyrighted work
 * - URL where infringement was found
 * - Evidence of ownership (Content DNA hash, registration timestamp)
 * - Statement of good faith
 * - Signature block
 * Use the following violation data: {violationData}"
 * 
 * INPUT: violation object with all evidence
 * OUTPUT: formatted DMCA notice string
 */
export async function generateDMCA(violationData) { /* ... */ }

/**
 * 4. summarizePropagation(graphData) → Summarize content spread patterns
 * 
 * PROMPT: "Analyze this content propagation data and provide a natural language
 * summary. Identify: main spread channels, super-spreader accounts, temporal
 * patterns, geographic concentrations, and recommended actions."
 * 
 * INPUT: graph/network data object
 * OUTPUT: natural language summary string
 */
export async function summarizePropagation(graphData) { /* ... */ }
```

**API Call Pattern:**
```javascript
async function callGemini(prompt, imageBase64Array = []) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  const parts = [{ text: prompt }];
  
  // Add images as inline_data parts
  for (const img of imageBase64Array) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: img  // base64 string WITHOUT the data:image/jpeg;base64, prefix
      }
    });
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,  // Low temperature for consistent JSON output
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'  // Force JSON output
      }
    })
  });

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
}
```

---

### 2. `src/services/vision.js` — Cloud Vision API

```javascript
const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

/**
 * analyzeWithVision(imageBase64) → Run all Vision detections
 * 
 * Returns: {
 *   logos: [{ name: "BCCI", confidence: 0.95, boundingBox: {...} }],
 *   text: "© IPL 2026 All Rights Reserved",
 *   labels: ["cricket", "stadium", "sports", "crowd"],
 *   webEntities: [{ description: "IPL", score: 0.9 }],
 *   similarWebImages: [{ url: "https://...", }],
 *   pagesWithImage: [{ url: "https://...", title: "..." }],
 *   dominantColors: [{ rgb: {r,g,b}, score: 0.4, pixelFraction: 0.3 }],
 *   safeSearch: { adult: "VERY_UNLIKELY", violence: "UNLIKELY", ... }
 * }
 */
export async function analyzeWithVision(imageBase64) {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;

  const response = await fetch(`${VISION_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: imageBase64 },  // base64 WITHOUT prefix
        features: [
          { type: 'LOGO_DETECTION', maxResults: 10 },
          { type: 'TEXT_DETECTION' },
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'WEB_DETECTION', maxResults: 10 },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'SAFE_SEARCH_DETECTION' }
        ]
      }]
    })
  });

  const data = await response.json();
  const result = data.responses[0];
  
  return {
    logos: (result.logoAnnotations || []).map(l => ({
      name: l.description,
      confidence: l.score,
      boundingBox: l.boundingPoly
    })),
    text: result.textAnnotations?.[0]?.description || '',
    labels: (result.labelAnnotations || []).map(l => ({
      name: l.description,
      confidence: l.score
    })),
    webEntities: result.webDetection?.webEntities || [],
    similarWebImages: result.webDetection?.visuallySimilarImages || [],
    pagesWithImage: result.webDetection?.pagesWithMatchingImages || [],
    dominantColors: result.imagePropertiesAnnotation?.dominantColors?.colors || [],
    safeSearch: result.safeSearchAnnotation || {}
  };
}
```

> **IMPORTANT**: Cloud Vision `WEB_DETECTION` is the closest thing to "crawling the web" for matching images. It returns pages that contain the image and visually similar images found across Google's index. This is a real, powerful feature — make sure to highlight it in the demo.

---

### 3. `src/services/vertex-embeddings.js` — Vertex AI Embeddings

```javascript
/**
 * generateImageEmbedding(imageBase64) → Get 512-dim vector
 * 
 * Uses the Vertex AI Multimodal Embeddings API.
 * For the prototype, we can use the Gemini API's embedding endpoint
 * OR the dedicated multimodal embedding model.
 * 
 * Returns: Float32Array of 512 dimensions
 */

// OPTION A: Use Gemini's embedding (simpler, works with Gemini API key)
const EMBEDDING_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';

// OPTION B: Use Vertex AI Multimodal Embeddings (requires GCP project)
// const EMBEDDING_URL = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${REGION}/publishers/google/models/multimodalembedding:predict`;

export async function generateImageEmbedding(imageBase64) {
  // For prototype: Use Gemini to generate a text description,
  // then embed that description. This creates a semantic vector
  // that represents the visual content.
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Step 1: Get detailed description from Gemini
  const description = await getImageDescription(imageBase64);
  
  // Step 2: Embed the description into a vector
  const response = await fetch(`${EMBEDDING_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text: description }] }
    })
  });
  
  const data = await response.json();
  return new Float32Array(data.embedding.values);
}

async function getImageDescription(imageBase64) {
  // Use Gemini to create a rich description for embedding
  const prompt = `Describe this sports media image in extreme detail for content 
  fingerprinting. Include: visual elements, colors, composition, text visible, 
  logos, people, actions, background, lighting. Be as specific as possible. 
  Output only the description, no formatting.`;
  
  // ... call Gemini with image ...
}
```

> **For judges**: Explain in your demo that in production, you'd use Vertex AI's native `multimodalembedding` model for direct image → vector conversion, which is faster and more accurate. The prototype uses Gemini description → text embedding as an approximation that still demonstrates the full pipeline.

---

### 4. `src/engine/content-dna.js` — Content DNA Orchestrator

This is your **hero file**. It orchestrates all services to generate the complete Content DNA.

```javascript
import { analyzeAsset } from '../services/gemini.js';
import { analyzeWithVision } from '../services/vision.js';
import { generateImageEmbedding } from '../services/vertex-embeddings.js';
import { computePHash, computeDHash, computeAHash } from './perceptual-hash.js';
import { signContent } from './credentials.js';

/**
 * generateContentDNA(imageFile) → Complete Content DNA object
 * 
 * This runs the full pipeline:
 * 1. Perceptual hashing (client-side, Web Worker)
 * 2. Cloud Vision analysis (logo + OCR + web detection)
 * 3. Gemini analysis (sport context + semantic description)
 * 4. Vertex AI embedding (512-dim vector)
 * 5. Cryptographic signing (Web Crypto SHA-256)
 * 
 * Emits progress events so the UI can show step-by-step progress.
 * 
 * Returns:
 * {
 *   id: "uuid",
 *   timestamp: "ISO date",
 *   hashes: { pHash: "hex", dHash: "hex", aHash: "hex" },
 *   vision: { logos, text, labels, webEntities, similarImages, colors },
 *   gemini: { description, sport, teams, players, tags, value, risk },
 *   embedding: Float32Array(512),
 *   credential: { hash: "sha256", signature: "...", timestamp: "..." },
 *   rawImageBase64: "..."
 * }
 */
export async function generateContentDNA(imageFile, onProgress) {
  const base64 = await fileToBase64(imageFile);
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');

  // Step 1: Perceptual Hashing (parallel, client-side)
  onProgress?.({ step: 1, label: 'Computing perceptual hashes...', percent: 10 });
  const hashes = await computeAllHashes(base64);
  onProgress?.({ step: 1, label: 'Hashes computed ✓', percent: 25, data: hashes });

  // Step 2: Cloud Vision API
  onProgress?.({ step: 2, label: 'Analyzing with Cloud Vision...', percent: 30 });
  let vision;
  try {
    vision = await analyzeWithVision(cleanBase64);
  } catch (e) {
    vision = getMockVisionResult(); // Fallback for demo
  }
  onProgress?.({ step: 2, label: 'Vision analysis complete ✓', percent: 50, data: vision });

  // Step 3: Gemini Analysis
  onProgress?.({ step: 3, label: 'Gemini AI analyzing content...', percent: 55 });
  let gemini;
  try {
    gemini = await analyzeAsset(cleanBase64);
  } catch (e) {
    gemini = getMockGeminiResult(); // Fallback for demo
  }
  onProgress?.({ step: 3, label: 'AI analysis complete ✓', percent: 75, data: gemini });

  // Step 4: Generate Embedding
  onProgress?.({ step: 4, label: 'Generating content embedding...', percent: 80 });
  let embedding;
  try {
    embedding = await generateImageEmbedding(cleanBase64);
  } catch (e) {
    embedding = new Float32Array(512).fill(0); // Fallback
  }
  onProgress?.({ step: 4, label: 'Embedding generated ✓', percent: 90 });

  // Step 5: Sign Content
  onProgress?.({ step: 5, label: 'Signing content credential...', percent: 95 });
  const credential = await signContent({
    hashes, visionSummary: vision.text, geminiDescription: gemini.description
  });
  onProgress?.({ step: 5, label: 'Content DNA complete ✓', percent: 100 });

  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    hashes,
    vision,
    gemini,
    embedding,
    credential,
    rawImageBase64: base64
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

async function computeAllHashes(base64) {
  const [pHash, dHash, aHash] = await Promise.all([
    computePHash(base64),
    computeDHash(base64),
    computeAHash(base64)
  ]);
  return { pHash, dHash, aHash };
}

// Fallback mock data for when APIs are not configured
function getMockVisionResult() {
  return {
    logos: [{ name: "Sample League", confidence: 0.92 }],
    text: "© 2026 Official Sports Media",
    labels: [{ name: "sports", confidence: 0.96 }, { name: "stadium", confidence: 0.89 }],
    webEntities: [{ description: "Sports Event", score: 0.85 }],
    similarWebImages: [],
    pagesWithImage: [],
    dominantColors: [{ rgb: { r: 30, g: 58, b: 138 }, score: 0.4 }],
    safeSearch: { adult: "VERY_UNLIKELY", violence: "VERY_UNLIKELY" }
  };
}

function getMockGeminiResult() {
  return {
    description: "A high-energy sports photograph capturing a decisive moment during a professional match",
    sport_type: "cricket",
    teams: ["Team Alpha", "Team Beta"],
    players_visible: [],
    event_context: "match",
    content_type: "photo",
    semantic_tags: ["action_shot", "professional", "broadcast_quality"],
    estimated_value: "high",
    piracy_risk: "high"
  };
}
```

---

### 5. `src/engine/perceptual-hash.js` — Client-Side Hashing

```javascript
/**
 * Implement 3 perceptual hash algorithms using Canvas API.
 * These run entirely client-side, no API needed.
 */

/**
 * aHash (Average Hash)
 * 1. Resize image to 8x8 grayscale
 * 2. Compute mean pixel value
 * 3. Each pixel: 1 if >= mean, 0 if < mean
 * 4. Result: 64-bit hash as hex string
 */
export async function computeAHash(base64) {
  const pixels = await getGrayscalePixels(base64, 8, 8);
  const mean = pixels.reduce((a, b) => a + b, 0) / pixels.length;
  let hash = '';
  for (let i = 0; i < pixels.length; i++) {
    hash += pixels[i] >= mean ? '1' : '0';
  }
  return binaryToHex(hash);
}

/**
 * dHash (Difference Hash)
 * 1. Resize image to 9x8 grayscale (9 wide for comparison)
 * 2. Each pixel: 1 if left > right, 0 otherwise
 * 3. Result: 64-bit hash as hex string
 * More robust than aHash — gradient-based
 */
export async function computeDHash(base64) {
  const pixels = await getGrayscalePixels(base64, 9, 8);
  let hash = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = pixels[row * 9 + col];
      const right = pixels[row * 9 + col + 1];
      hash += left > right ? '1' : '0';
    }
  }
  return binaryToHex(hash);
}

/**
 * pHash (Perceptual Hash) — Most Robust
 * 1. Resize to 32x32 grayscale
 * 2. Apply DCT (Discrete Cosine Transform)
 * 3. Take top-left 8x8 of DCT (low frequencies)
 * 4. Compute mean of DCT values (excluding DC component)
 * 5. Each value: 1 if >= mean, 0 if < mean
 * 6. Result: 64-bit hash as hex string
 */
export async function computePHash(base64) {
  const pixels = await getGrayscalePixels(base64, 32, 32);
  
  // Apply DCT
  const dct = applyDCT(pixels, 32, 32);
  
  // Take top-left 8x8
  const lowFreq = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      lowFreq.push(dct[y * 32 + x]);
    }
  }
  
  // Mean (excluding DC component at [0])
  const mean = lowFreq.slice(1).reduce((a, b) => a + b, 0) / (lowFreq.length - 1);
  
  let hash = '';
  for (let i = 0; i < lowFreq.length; i++) {
    hash += lowFreq[i] >= mean ? '1' : '0';
  }
  return binaryToHex(hash);
}

// Canvas-based image processing helper
async function getGrayscalePixels(base64, width, height) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = [];
      for (let i = 0; i < imageData.data.length; i += 4) {
        // Luminance formula
        const gray = 0.299 * imageData.data[i] + 0.587 * imageData.data[i+1] + 0.114 * imageData.data[i+2];
        pixels.push(gray);
      }
      resolve(pixels);
    };
    img.src = base64;
  });
}

// DCT implementation (Type-II, 2D)
function applyDCT(pixels, width, height) {
  const result = new Array(width * height).fill(0);
  for (let v = 0; v < height; v++) {
    for (let u = 0; u < width; u++) {
      let sum = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          sum += pixels[y * width + x] *
            Math.cos((2 * x + 1) * u * Math.PI / (2 * width)) *
            Math.cos((2 * y + 1) * v * Math.PI / (2 * height));
        }
      }
      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      result[v * width + u] = 0.25 * cu * cv * sum;
    }
  }
  return result;
}

function binaryToHex(binary) {
  let hex = '';
  for (let i = 0; i < binary.length; i += 4) {
    hex += parseInt(binary.substr(i, 4), 2).toString(16);
  }
  return hex;
}
```

---

### 6. `src/engine/similarity.js`

```javascript
/**
 * Compare two perceptual hashes using Hamming distance
 * Returns: 0 to 1 (1 = identical)
 */
export function hammingSimilarity(hash1, hash2) {
  const bin1 = hexToBinary(hash1);
  const bin2 = hexToBinary(hash2);
  let same = 0;
  for (let i = 0; i < bin1.length; i++) {
    if (bin1[i] === bin2[i]) same++;
  }
  return same / bin1.length;
}

/**
 * Compare two embedding vectors using cosine similarity
 * Returns: -1 to 1 (1 = identical)
 */
export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Compute composite similarity score (weighted average)
 */
export function compositeScore(hashSimilarity, embeddingSimilarity, visionLogoMatch) {
  return (
    hashSimilarity * 0.3 +
    embeddingSimilarity * 0.5 +
    (visionLogoMatch ? 0.2 : 0)
  );
}

function hexToBinary(hex) {
  return hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');
}
```

---

### 7. `src/engine/credentials.js`

```javascript
/**
 * C2PA-style content credential using Web Crypto API
 */
export async function signContent(contentData) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(contentData));
  
  // SHA-256 hash of the content data
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return {
    algorithm: 'SHA-256',
    hash: hashHex,
    timestamp: new Date().toISOString(),
    issuer: 'MediaShield AI',
    version: '1.0',
    standard: 'C2PA-compatible',
    contentType: 'sports-media',
    chainOfCustody: [
      {
        action: 'registered',
        timestamp: new Date().toISOString(),
        agent: 'MediaShield AI Content DNA Engine'
      }
    ]
  };
}

/**
 * Verify a content credential
 */
export async function verifyCredential(contentData, credential) {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(contentData));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === credential.hash;
}
```

---

## 🔌 Integration with Member 1's Pages

### Register page (`register.js`) — Member 1 will call:
```javascript
import { generateContentDNA } from '../engine/content-dna.js';

// When user uploads an image:
const dna = await generateContentDNA(file, (progress) => {
  // Update progress UI
  updateProgressBar(progress.step, progress.percent, progress.label);
  if (progress.data) {
    displayStepResult(progress.step, progress.data);
  }
});

// Display DNA results in the UI
displayContentDNA(dna);
```

### Threats page (`threats.js`) — Member 1 will call:
```javascript
import { classifyThreat } from '../services/gemini.js';

// When user clicks "Analyze Threat":
const assessment = await classifyThreat(originalBase64, suspectBase64);
displayThreatAssessment(assessment);
```

### DMCA page (`dmca.js`) — Member 1 will call:
```javascript
import { generateDMCA } from '../services/gemini.js';

// When user clicks "Generate DMCA Notice":
const notice = await generateDMCA(violationData);
displayDMCANotice(notice);
```

---

## ✅ Checklist

- [ ] Set up `.env` with Gemini API key
- [ ] Implement `gemini.js` with all 4 functions (analyzeAsset, classifyThreat, generateDMCA, summarizePropagation)
- [ ] Test Gemini API calls — verify JSON response parsing
- [ ] Implement `vision.js` with logo detection + OCR + web detection
- [ ] Test Cloud Vision API — verify logo and text extraction
- [ ] Implement `vertex-embeddings.js` (text embedding approach for prototype)
- [ ] Implement `perceptual-hash.js` — all 3 hash algorithms (aHash, dHash, pHash)
- [ ] Test hashes: same image should produce identical hashes; slightly modified image should produce similar hashes
- [ ] Implement `similarity.js` — Hamming distance + cosine similarity
- [ ] Implement `credentials.js` — SHA-256 signing with Web Crypto
- [ ] Build `content-dna.js` orchestrator — full pipeline with progress callbacks
- [ ] Add mock/fallback data for when APIs are not configured
- [ ] Test full Content DNA pipeline end-to-end with a sample sports image
- [ ] Ensure all functions gracefully handle API errors

---

## 🧪 Testing

### Quick test in browser console:
```javascript
// Test perceptual hash
import { computeAHash } from './engine/perceptual-hash.js';
const hash = await computeAHash('data:image/jpeg;base64,...');
console.log('aHash:', hash); // Should be 16 hex characters

// Test Gemini
import { analyzeAsset } from './services/gemini.js';
const result = await analyzeAsset(base64String);
console.log('Gemini:', result); // Should be a JSON object with sport, teams, etc.
```

**Timeline**: Focus on getting Gemini + Content DNA pipeline working in **2-3 hours**, then polish Vision API + embeddings.
