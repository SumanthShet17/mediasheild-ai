// ============================================================================
// AI Engine Live Demo — Member 2 Test Page
// ============================================================================
// A standalone demo page that tests all AI engine functions.
// Upload an image → watch the full Content DNA pipeline run live.
// ============================================================================

import { generateContentDNA } from '../engine/content-dna.js';
import { classifyThreat, generateDMCA, summarizePropagation } from '../services/gemini.js';
import { compareContentDNA } from '../engine/similarity.js';
import { verifyCredential } from '../engine/credentials.js';
import { API_ENDPOINTS } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Render the demo page
// ---------------------------------------------------------------------------

export function renderDemo(container) {
  container.innerHTML = `
    <div class="demo-page">
      <div class="demo-header">
        <h1>🧠 MediaShield AI Engine — Live Demo</h1>
        <p class="demo-subtitle">Member 2 · AI/ML Engineer · All systems operational</p>
        <div class="api-status" id="api-status"></div>
      </div>

      <!-- SECTION 1: Content DNA -->
      <section class="demo-section">
        <h2>🧬 1. Content DNA Pipeline</h2>
        <p>Upload a sports image to generate its complete Content DNA fingerprint.</p>
        <div class="upload-zone" id="upload-zone">
          <input type="file" id="file-input" accept="image/*" />
          <div class="upload-label">
            <span class="upload-icon">📁</span>
            <span>Drop an image or click to upload</span>
            <span class="upload-hint">JPG, PNG — any sports photo</span>
          </div>
        </div>
        <div class="progress-container" id="progress-container" style="display:none;">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" id="progress-fill"></div>
          </div>
          <div class="progress-steps" id="progress-steps"></div>
        </div>
        <div class="results-grid" id="dna-results" style="display:none;"></div>
      </section>

      <!-- SECTION 2: Threat Classification -->
      <section class="demo-section">
        <h2>🔍 2. Threat Classification</h2>
        <p>Upload two images to compare — the AI analyzes if one is a pirated copy.</p>
        <div class="dual-upload">
          <div class="upload-box">
            <label>Original Image</label>
            <input type="file" id="original-input" accept="image/*" />
            <div class="preview-box" id="original-preview">No image</div>
          </div>
          <div class="vs-badge">VS</div>
          <div class="upload-box">
            <label>Suspect Image</label>
            <input type="file" id="suspect-input" accept="image/*" />
            <div class="preview-box" id="suspect-preview">No image</div>
          </div>
        </div>
        <button class="btn-action" id="classify-btn" disabled>⚡ Classify Threat</button>
        <div class="result-card" id="threat-result" style="display:none;"></div>
      </section>

      <!-- SECTION 3: DMCA Generator -->
      <section class="demo-section">
        <h2>📄 3. AI-Powered DMCA Generator</h2>
        <p>Generate a professional DMCA takedown notice using Gemini AI.</p>
        <button class="btn-action" id="dmca-btn">📝 Generate DMCA</button>
        <div class="result-card dmca-card" id="dmca-result" style="display:none;"></div>
      </section>

      <!-- SECTION 4: Propagation Summary -->
      <section class="demo-section">
        <h2>🌐 4. Propagation Intelligence</h2>
        <p>Feed network data to Gemini and get a strategic intelligence summary.</p>
        <button class="btn-action" id="propagation-btn">🔎 Analyze Propagation</button>
        <div class="result-card" id="propagation-result" style="display:none;"></div>
      </section>

      <!-- SECTION 5: Credential Verification -->
      <section class="demo-section">
        <h2>🔐 5. Credential Verification</h2>
        <p>Verify a Content DNA credential's integrity (tamper detection).</p>
        <button class="btn-action" id="verify-btn" disabled>✅ Verify Last DNA Credential</button>
        <div class="result-card" id="verify-result" style="display:none;"></div>
      </section>
    </div>
  `;

  checkAPIStatus();
  attachEventListeners();
}

// ---------------------------------------------------------------------------
// API Status Check
// ---------------------------------------------------------------------------

function checkAPIStatus() {
  const el = document.getElementById('api-status');
  fetch(API_ENDPOINTS.HEALTH)
    .then((response) => response.json())
    .then((health) => {
      el.innerHTML = `
        <span class="status-chip ${health.ok ? 'active' : 'inactive'}">Backend ${health.ok ? '✅' : '❌'}</span>
        <span class="status-chip ${health.geminiConfigured ? 'active' : 'inactive'}">Gemini ${health.geminiConfigured ? '✅' : '❌'}</span>
        <span class="status-chip ${(health.visionConfigured && !health.visionFallbackActive) ? 'active' : 'inactive'}">Vision ${(health.visionConfigured && !health.visionFallbackActive) ? '✅' : '⚠️ fallback'}</span>
      `;
    })
    .catch(() => {
      el.innerHTML = `
        <span class="status-chip inactive">Backend ❌</span>
        <span class="status-chip inactive">Gemini ❌</span>
        <span class="status-chip inactive">Vision ❌</span>
      `;
    });
}

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------

let lastDNA = null;
let originalBase64 = null;
let suspectBase64 = null;

function attachEventListeners() {
  // --- Content DNA Upload ---
  const fileInput = document.getElementById('file-input');
  const uploadZone = document.getElementById('upload-zone');

  uploadZone.addEventListener('click', () => fileInput.click());
  uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleDNAUpload(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleDNAUpload(e.target.files[0]);
  });

  // --- Threat Classification ---
  document.getElementById('original-input').addEventListener('change', (e) => {
    if (e.target.files[0]) handlePreviewUpload(e.target.files[0], 'original');
  });
  document.getElementById('suspect-input').addEventListener('change', (e) => {
    if (e.target.files[0]) handlePreviewUpload(e.target.files[0], 'suspect');
  });
  document.getElementById('classify-btn').addEventListener('click', handleClassifyThreat);

  // --- DMCA ---
  document.getElementById('dmca-btn').addEventListener('click', handleDMCA);

  // --- Propagation ---
  document.getElementById('propagation-btn').addEventListener('click', handlePropagation);

  // --- Verify ---
  document.getElementById('verify-btn').addEventListener('click', handleVerify);
}

// ---------------------------------------------------------------------------
// 1. Content DNA Pipeline
// ---------------------------------------------------------------------------

async function handleDNAUpload(file) {
  const progressContainer = document.getElementById('progress-container');
  const progressFill = document.getElementById('progress-fill');
  const progressSteps = document.getElementById('progress-steps');
  const resultsEl = document.getElementById('dna-results');

  progressContainer.style.display = 'block';
  resultsEl.style.display = 'none';
  progressSteps.innerHTML = '';

  try {
    const dna = await generateContentDNA(file, (progress) => {
      progressFill.style.width = `${progress.percent}%`;
      const stepEl = document.createElement('div');
      stepEl.className = `step-item ${progress.percent > 0 ? 'done' : ''}`;
      stepEl.textContent = progress.label;
      progressSteps.appendChild(stepEl);
    });

    lastDNA = dna;
    document.getElementById('verify-btn').disabled = false;
    displayDNAResults(dna, resultsEl);
  } catch (error) {
    progressSteps.innerHTML += `<div class="step-item error">❌ Error: ${error.message}</div>`;
  }
}

function displayDNAResults(dna, container) {
  container.style.display = 'grid';
  container.innerHTML = `
    <div class="result-card">
      <h3>🆔 Asset Info</h3>
      <div class="kv"><span>ID</span><code>${dna.id}</code></div>
      <div class="kv"><span>File</span><code>${dna.filename}</code></div>
      <div class="kv"><span>Size</span><code>${(dna.fileSize / 1024).toFixed(1)} KB</code></div>
      <div class="kv"><span>Registered</span><code>${new Date(dna.timestamp).toLocaleString()}</code></div>
    </div>

    <div class="result-card">
      <h3>#️⃣ Perceptual Hashes</h3>
      <div class="kv"><span>pHash</span><code>${dna.hashes.pHash}</code></div>
      <div class="kv"><span>dHash</span><code>${dna.hashes.dHash}</code></div>
      <div class="kv"><span>aHash</span><code>${dna.hashes.aHash}</code></div>
    </div>

    <div class="result-card">
      <h3>🤖 Gemini AI Analysis</h3>
      <div class="kv"><span>Sport</span><code>${dna.gemini.sport_type}</code></div>
      <div class="kv"><span>Teams</span><code>${(dna.gemini.teams || []).join(', ') || 'N/A'}</code></div>
      <div class="kv"><span>Type</span><code>${dna.gemini.content_type}</code></div>
      <div class="kv"><span>Value</span><span class="badge badge-${dna.gemini.estimated_value}">${dna.gemini.estimated_value}</span></div>
      <div class="kv"><span>Piracy Risk</span><span class="badge badge-${dna.gemini.piracy_risk}">${dna.gemini.piracy_risk}</span></div>
      <p class="desc">${dna.gemini.description}</p>
      <div class="tags">${(dna.gemini.semantic_tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
    </div>

    <div class="result-card">
      <h3>👁️ Cloud Vision</h3>
      <div class="kv"><span>Logos</span><code>${(dna.vision.logos || []).map(l => l.name).join(', ') || 'None'}</code></div>
      <div class="kv"><span>OCR Text</span><code>${(dna.vision.text || '').substring(0, 100) || 'None'}</code></div>
      <div class="kv"><span>Labels</span><code>${(dna.vision.labels || []).slice(0, 5).map(l => l.name).join(', ')}</code></div>
      <div class="kv"><span>Web Matches</span><code>${(dna.vision.pagesWithImage || []).length} pages</code></div>
      <div class="kv"><span>Similar Images</span><code>${(dna.vision.similarWebImages || []).length} found</code></div>
    </div>

    <div class="result-card">
      <h3>📐 Embedding Vector</h3>
      <div class="kv"><span>Dimensions</span><code>${dna.embedding.length}</code></div>
      <div class="kv"><span>Sample</span><code>[${Array.from(dna.embedding.slice(0, 5)).map(v => v.toFixed(4)).join(', ')}...]</code></div>
    </div>

    <div class="result-card">
      <h3>🔐 C2PA Credential</h3>
      <div class="kv"><span>Algorithm</span><code>${dna.credential.algorithm}</code></div>
      <div class="kv"><span>Hash</span><code style="font-size:0.7em">${dna.credential.hash}</code></div>
      <div class="kv"><span>Issuer</span><code>${dna.credential.issuer}</code></div>
      <div class="kv"><span>Standard</span><code>${dna.credential.standard}</code></div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// 2. Threat Classification
// ---------------------------------------------------------------------------

function handlePreviewUpload(file, type) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    const clean = base64.replace(/^data:image\/\w+;base64,/, '');

    if (type === 'original') {
      originalBase64 = clean;
      document.getElementById('original-preview').innerHTML = `<img src="${base64}" alt="original"/>`;
    } else {
      suspectBase64 = clean;
      document.getElementById('suspect-preview').innerHTML = `<img src="${base64}" alt="suspect"/>`;
    }

    document.getElementById('classify-btn').disabled = !(originalBase64 && suspectBase64);
  };
  reader.readAsDataURL(file);
}

async function handleClassifyThreat() {
  const btn = document.getElementById('classify-btn');
  const resultEl = document.getElementById('threat-result');

  btn.disabled = true;
  btn.textContent = '⏳ Analyzing...';
  resultEl.style.display = 'none';

  try {
    const result = await classifyThreat(originalBase64, suspectBase64);
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <h3>🎯 Threat Assessment</h3>
      <div class="kv"><span>Match</span><span class="badge badge-${result.is_match ? 'high' : 'low'}">${result.is_match ? 'YES' : 'NO'}</span></div>
      <div class="kv"><span>Similarity</span><code>${result.similarity_score}%</code></div>
      <div class="kv"><span>Modification</span><code>${result.modification_type}</code></div>
      <div class="kv"><span>Severity</span><span class="badge badge-${result.severity}">${result.severity}</span></div>
      <div class="kv"><span>Commercial Intent</span><code>${result.commercial_intent}</code></div>
      <div class="kv"><span>Confidence</span><code>${result.confidence}%</code></div>
      <div class="kv"><span>Action</span><span class="badge badge-high">${result.recommended_action}</span></div>
      <p class="desc">${result.evidence_summary}</p>
      <div class="tags">
        <strong>Modifications:</strong>
        ${(result.modifications_detected || []).map(m => `<span class="tag">${m}</span>`).join('')}
      </div>
    `;
  } catch (error) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<p class="error">❌ ${error.message}</p>`;
  }

  btn.disabled = false;
  btn.textContent = '⚡ Classify Threat';
}

// ---------------------------------------------------------------------------
// 3. DMCA Generator
// ---------------------------------------------------------------------------

async function handleDMCA() {
  const btn = document.getElementById('dmca-btn');
  const resultEl = document.getElementById('dmca-result');

  if (!lastDNA) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<p class="error">❌ Please analyze an original image first to gather content intelligence for the DMCA.</p>`;
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Generating DMCA...';

  const violationData = {
    assetName: `Registered ${lastDNA.gemini.sport_type || 'Sports'} Media Asset`,
    contentHash: lastDNA.credential.hash,
    registrationDate: lastDNA.timestamp,
    infringingUrl: `https://pirate-streams.example.com/live/${lastDNA.gemini.sport_type || 'sports'}`,
    ownerName: lastDNA.gemini.teams?.length > 0 ? lastDNA.gemini.teams.join(' / ') : 'Official Sports Rights Holder',
    platform: 'Example Streaming Platform',
    description: `Unauthorized use of: ${lastDNA.gemini.description || ''}`,
  };

  try {
    const result = await generateDMCA(violationData);
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <h3>📄 ${result.subject}</h3>
      <div class="kv"><span>Reference</span><code>${result.reference_id}</code></div>
      <div class="kv"><span>Urgency</span><span class="badge badge-high">${result.urgency}</span></div>
      <div class="kv"><span>Notify</span><code>${(result.platforms_to_notify || []).join(', ')}</code></div>
      <pre class="dmca-body">${result.body}</pre>
      <button class="btn-small" onclick="navigator.clipboard.writeText(this.previousElementSibling.textContent).then(() => this.textContent = 'Copied ✅')">📋 Copy to Clipboard</button>
    `;
  } catch (error) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<p class="error">❌ ${error.message}</p>`;
  }

  btn.disabled = false;
  btn.textContent = '📝 Generate DMCA';
}

// ---------------------------------------------------------------------------
// 4. Propagation Summary
// ---------------------------------------------------------------------------

async function handlePropagation() {
  const btn = document.getElementById('propagation-btn');
  const resultEl = document.getElementById('propagation-result');

  if (!lastDNA) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<p class="error">❌ Please analyze an original image first to provide context for the propagation analyst.</p>`;
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Analyzing...';

  const baseShares = Math.floor(Math.random() * 2000) + 500;
  const graphData = {
    nodes: Math.floor(Math.random() * 100) + 20,
    edges: Math.floor(Math.random() * 300) + 50,
    timeSpan: '72 hours',
    platforms: ['Twitter/X', 'Instagram', 'Telegram', 'Reddit', 'Fan Forums'],
    topNodes: [
      { id: '@sports_clips_hd', shares: Math.floor(baseShares * 0.2), followers: 50000, platform: 'Twitter' },
      { id: `@${lastDNA.gemini.sport_type || 'sport'}_free_stream`, shares: Math.floor(baseShares * 0.15), followers: 32000, platform: 'Telegram' },
      { id: '@highlight_memes_daily', shares: Math.floor(baseShares * 0.1), followers: 85000, platform: 'Instagram' },
    ],
    regions: ['North America', 'South Asia', 'Europe', 'Other'],
    contentType: lastDNA.gemini.content_type || 'broadcast_frame',
    totalShares: baseShares,
    estimatedViews: baseShares * 1500,
    contentContext: lastDNA.gemini.description || 'General sports footage'
  };

  try {
    const result = await summarizePropagation(graphData);
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <h3>🌐 Intelligence Summary</h3>
      <p class="desc">${result.summary}</p>
      <div class="kv"><span>Risk</span><span class="badge badge-high">${result.risk_assessment}</span></div>
      <div class="kv"><span>Reach</span><code>${result.estimated_reach}</code></div>
      <div class="kv"><span>Pattern</span><code>${result.temporal_pattern}</code></div>
      <div class="kv"><span>Geography</span><code>${result.geographic_focus}</code></div>
      <div class="subsection">
        <strong>Spread Channels:</strong>
        <div class="tags">${(result.spread_channels || []).map(c => `<span class="tag">${c}</span>`).join('')}</div>
      </div>
      <div class="subsection">
        <strong>Super Spreaders:</strong>
        <div class="tags">${(result.super_spreaders || []).map(s => `<span class="tag tag-danger">${s}</span>`).join('')}</div>
      </div>
      <div class="subsection">
        <strong>Recommended Actions:</strong>
        <ol>${(result.recommended_actions || []).map(a => `<li>${a}</li>`).join('')}</ol>
      </div>
    `;
  } catch (error) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<p class="error">❌ ${error.message}</p>`;
  }

  btn.disabled = false;
  btn.textContent = '🔎 Analyze Propagation';
}

// ---------------------------------------------------------------------------
// 5. Credential Verification
// ---------------------------------------------------------------------------

async function handleVerify() {
  const resultEl = document.getElementById('verify-result');

  if (!lastDNA) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `<p>⚠️ Upload an image first to generate a Content DNA credential.</p>`;
    return;
  }

  const contentData = {
    hashes: lastDNA.hashes,
    visionSummary: lastDNA.vision.text || '',
    geminiDescription: lastDNA.gemini.description || '',
  };

  const verification = await verifyCredential(contentData, lastDNA.credential);

  resultEl.style.display = 'block';
  resultEl.innerHTML = `
    <h3>${verification.valid ? '✅ Credential Verified' : '❌ Verification Failed'}</h3>
    <div class="kv"><span>Status</span><span class="badge badge-${verification.valid ? 'low' : 'high'}">${verification.valid ? 'AUTHENTIC' : 'TAMPERED'}</span></div>
    <div class="kv"><span>Reason</span><code>${verification.reason}</code></div>
    <div class="kv"><span>Issuer</span><code>${verification.issuer}</code></div>
    <div class="kv"><span>Issued</span><code>${new Date(verification.issuedAt).toLocaleString()}</code></div>
    <div class="kv"><span>Verified</span><code>${new Date(verification.verifiedAt).toLocaleString()}</code></div>
  `;
}
