// ============================================================================
// TEST SUITE — Comprehensive API & Feature Testing
// ============================================================================
// Tests all AI engine features, APIs, and data flows.
// Provides detailed logs and error reporting.

import { generateContentDNA } from '../engine/content-dna.js';
import { classifyThreat, generateDMCA, summarizePropagation, analyzeAsset } from '../services/gemini.js';
import { analyzeWithVision, detectWebPresence } from '../services/vision.js';
import { generateImageEmbedding, generateTextEmbedding } from '../services/vertex-embeddings.js';
import { compareContentDNA } from '../engine/similarity.js';
import { signContent, verifyCredential } from '../engine/credentials.js';
import { computePHash, computeDHash, computeAHash } from '../engine/perceptual-hash.js';
import { hammingSimilarity, cosineSimilarity, compositeScore } from '../engine/similarity.js';
import { API_ENDPOINTS } from '../utils/constants.js';

let testLog = [];

export function renderTestSuite(container) {
  container.innerHTML = `
    <div class="test-suite-page">
      <div class="test-header">
        <h1>🧪 MediaShield AI — Test Suite</h1>
        <p class="test-subtitle">Comprehensive Feature & API Testing</p>
        <div class="test-nav">
          <button class="test-nav-btn active" data-test="api-status">API Status</button>
          <button class="test-nav-btn" data-test="hash-tests">Hash Tests</button>
          <button class="test-nav-btn" data-test="similarity-tests">Similarity Tests</button>
          <button class="test-nav-btn" data-test="embedding-tests">Embedding Tests</button>
          <button class="test-nav-btn" data-test="vision-tests">Vision Tests</button>
          <button class="test-nav-btn" data-test="gemini-tests">Gemini Tests</button>
          <button class="test-nav-btn" data-test="integration-tests">Integration Tests</button>
          <button class="test-nav-btn" data-test="dna-pipeline">DNA Pipeline</button>
          <button class="test-nav-btn" data-test="test-log">Test Log</button>
        </div>
      </div>

      <div class="test-content">
        <!-- API Status -->
        <section class="test-section" id="api-status">
          <h2>API Status Check</h2>
          <button class="test-btn primary" onclick="window.testSuite.testAPIStatus()">Run API Status Test</button>
          <div class="test-results" id="api-status-results"></div>
        </section>

        <!-- Hash Tests -->
        <section class="test-section" id="hash-tests">
          <h2>Perceptual Hash Tests</h2>
          <div class="test-upload">
            <input type="file" id="hash-test-file" accept="image/*" />
            <button class="test-btn primary" onclick="window.testSuite.testPerceptualHashes()">Test Hash Algorithms</button>
          </div>
          <div class="test-results" id="hash-results"></div>
        </section>

        <!-- Similarity Tests -->
        <section class="test-section" id="similarity-tests">
          <h2>Similarity Scoring Tests</h2>
          <button class="test-btn primary" onclick="window.testSuite.testSimilarityScoring()">Run Similarity Tests</button>
          <div class="test-results" id="similarity-results"></div>
        </section>

        <!-- Embedding Tests -->
        <section class="test-section" id="embedding-tests">
          <h2>Embedding Tests</h2>
          <button class="test-btn primary" onclick="window.testSuite.testEmbeddings()">Test Text Embeddings</button>
          <div class="test-results" id="embedding-results"></div>
        </section>

        <!-- Vision Tests -->
        <section class="test-section" id="vision-tests">
          <h2>Cloud Vision API Tests</h2>
          <div class="test-upload">
            <input type="file" id="vision-test-file" accept="image/*" />
            <button class="test-btn primary" onclick="window.testSuite.testVisionAPI()">Test Vision API</button>
          </div>
          <div class="test-results" id="vision-results"></div>
        </section>

        <!-- Gemini Tests -->
        <section class="test-section" id="gemini-tests">
          <h2>Gemini API Tests</h2>
          <div class="test-upload">
            <input type="file" id="gemini-test-file" accept="image/*" />
            <button class="test-btn primary" onclick="window.testSuite.testGeminiAPI()">Test Gemini API</button>
          </div>
          <div class="test-results" id="gemini-results"></div>
        </section>

        <!-- Integration Tests -->
        <section class="test-section" id="integration-tests">
          <h2>Integration Tests</h2>
          <button class="test-btn primary" onclick="window.testSuite.testIntegration()">Run Full Integration Test</button>
          <div class="test-results" id="integration-results"></div>
        </section>

        <!-- DNA Pipeline -->
        <section class="test-section" id="dna-pipeline">
          <h2>Full Content DNA Pipeline</h2>
          <div class="test-upload">
            <input type="file" id="dna-test-file" accept="image/*" />
            <button class="test-btn primary" onclick="window.testSuite.testFullPipeline()">Run Full Pipeline</button>
          </div>
          <div class="test-results" id="dna-results"></div>
        </section>

        <!-- Test Log -->
        <section class="test-section" id="test-log">
          <h2>Test Execution Log</h2>
          <button class="test-btn" onclick="window.testSuite.clearLog()">Clear Log</button>
          <button class="test-btn" onclick="window.testSuite.downloadLog()">Download Log</button>
          <div class="test-log-viewer" id="test-log-viewer"></div>
        </section>
      </div>
    </div>
  `;

  setupTestNavigation();
  setupTestUtilities();
  window.testSuite = createTestSuite();
}

// ============================================================================
// Test Navigation
// ============================================================================

function setupTestNavigation() {
  const buttons = document.querySelectorAll('.test-nav-btn');
  const sections = document.querySelectorAll('.test-section');

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      buttons.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.style.display = 'none');
      
      e.target.classList.add('active');
      const testId = e.target.dataset.test;
      const section = document.getElementById(testId);
      if (section) section.style.display = 'block';
    });
  });

  // Show only first section initially
  sections.forEach((s, i) => s.style.display = i === 0 ? 'block' : 'none');
}

// ============================================================================
// Test Suite Factory
// ============================================================================

function createTestSuite() {
  return {
    testAPIStatus,
    testPerceptualHashes,
    testSimilarityScoring,
    testEmbeddings,
    testVisionAPI,
    testGeminiAPI,
    testIntegration,
    testFullPipeline,
    clearLog: () => {
      testLog = [];
      updateLogViewer();
    },
    downloadLog: () => {
      const logStr = testLog.join('\n');
      const blob = new Blob([logStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mediashield-test-log-${new Date().toISOString()}.txt`;
      a.click();
    }
  };
}

// ============================================================================
// Logger Utility
// ============================================================================

function setupTestUtilities() {
  window.testLog = testLog;
}

function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  testLog.push(logEntry);
  updateLogViewer();
  console.log(logEntry);
}

function updateLogViewer() {
  const viewer = document.getElementById('test-log-viewer');
  if (viewer) {
    viewer.innerHTML = testLog.map((line, i) => `<div class="log-line">${i + 1}. ${line}</div>`).join('');
    viewer.scrollTop = viewer.scrollHeight;
  }
}

// ============================================================================
// Test 1: API Status
// ============================================================================

async function testAPIStatus() {
  const resultsEl = document.getElementById('api-status-results');
  resultsEl.innerHTML = '<div class="test-loading">Testing API connectivity...</div>';
  
  addLog('Starting API Status Check', 'test');
  const results = [];

  try {
    const response = await fetch(API_ENDPOINTS.HEALTH);
    const health = await response.json();

    results.push({ api: 'Backend Health', status: health.ok ? '✅ Online' : '❌ Offline', details: 'Local API server' });
    results.push({ api: 'Gemini Backend', status: health.geminiConfigured ? '✅ Configured' : '❌ Missing', details: health.geminiModel || 'Unknown model' });
    results.push({ api: 'Vision Backend', status: health.visionConfigured && !health.visionFallbackActive ? '✅ Configured' : '⚠️ Fallback', details: health.visionFallbackActive ? 'Cloud Vision billing fallback active' : 'Cloud Vision available' });

    addLog(`Backend health: ${JSON.stringify(health)}`, 'info');

    displayResults(resultsEl, results);
  } catch (error) {
    addLog(`API Status test error: ${error.message}`, 'error');
    resultsEl.innerHTML = `<div class="test-error">Error: ${error.message}</div>`;
  }
}

// ============================================================================
// Test 2: Perceptual Hashes
// ============================================================================

async function testPerceptualHashes() {
  const resultsEl = document.getElementById('hash-results');
  const fileInput = document.getElementById('hash-test-file');

  if (!fileInput.files[0]) {
    resultsEl.innerHTML = '<div class="test-error">Please select an image file first</div>';
    return;
  }

  addLog('Starting Perceptual Hash Tests', 'test');
  resultsEl.innerHTML = '<div class="test-loading">Computing hashes...</div>';

  try {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64DataUri = e.target.result;
      addLog(`Loaded image: ${file.name} (${file.size} bytes)`, 'info');

      const results = [];
      const startTime = performance.now();

      try {
        addLog('Computing pHash...', 'info');
        const pHashStart = performance.now();
        const pHash = await computePHash(base64DataUri);
        const pHashTime = (performance.now() - pHashStart).toFixed(2);
        results.push({ algorithm: 'pHash (Perceptual)', hash: pHash, time: `${pHashTime}ms` });
        addLog(`pHash computed: ${pHash} (${pHashTime}ms)`, 'success');
      } catch (err) {
        results.push({ algorithm: 'pHash', hash: 'ERROR', time: err.message });
        addLog(`pHash failed: ${err.message}`, 'error');
      }

      try {
        addLog('Computing dHash...', 'info');
        const dHashStart = performance.now();
        const dHash = await computeDHash(base64DataUri);
        const dHashTime = (performance.now() - dHashStart).toFixed(2);
        results.push({ algorithm: 'dHash (Difference)', hash: dHash, time: `${dHashTime}ms` });
        addLog(`dHash computed: ${dHash} (${dHashTime}ms)`, 'success');
      } catch (err) {
        results.push({ algorithm: 'dHash', hash: 'ERROR', time: err.message });
        addLog(`dHash failed: ${err.message}`, 'error');
      }

      try {
        addLog('Computing aHash...', 'info');
        const aHashStart = performance.now();
        const aHash = await computeAHash(base64DataUri);
        const aHashTime = (performance.now() - aHashStart).toFixed(2);
        results.push({ algorithm: 'aHash (Average)', hash: aHash, time: `${aHashTime}ms` });
        addLog(`aHash computed: ${aHash} (${aHashTime}ms)`, 'success');
      } catch (err) {
        results.push({ algorithm: 'aHash', hash: 'ERROR', time: err.message });
        addLog(`aHash failed: ${err.message}`, 'error');
      }

      const totalTime = (performance.now() - startTime).toFixed(2);
      addLog(`All hashes computed in ${totalTime}ms`, 'success');

      displayResults(resultsEl, results);
    };

    reader.readAsDataURL(file);
  } catch (error) {
    addLog(`Hash test error: ${error.message}`, 'error');
    resultsEl.innerHTML = `<div class="test-error">Error: ${error.message}</div>`;
  }
}

// ============================================================================
// Test 3: Similarity Scoring
// ============================================================================

async function testSimilarityScoring() {
  const resultsEl = document.getElementById('similarity-results');
  addLog('Starting Similarity Scoring Tests', 'test');
  resultsEl.innerHTML = '<div class="test-loading">Running similarity tests...</div>';

  const results = [];

  // Test Hamming Similarity
  const hash1 = 'a1b2c3d4e5f6g7h8';
  const hash2 = 'a1b2c3d4e5f6g7h8'; // identical
  const hash3 = 'ffffffffffffffff'; // completely different
  
  const sim12 = hammingSimilarity(hash1, hash2);
  const sim13 = hammingSimilarity(hash1, hash3);

  addLog(`Hamming Similarity (identical): ${(sim12 * 100).toFixed(2)}%`, 'info');
  addLog(`Hamming Similarity (different): ${(sim13 * 100).toFixed(2)}%`, 'info');

  results.push({
    test: 'Hamming Similarity - Identical Hashes',
    score: `${(sim12 * 100).toFixed(2)}%`,
    expected: '100%',
    status: sim12 === 1.0 ? '✅' : '⚠️'
  });

  results.push({
    test: 'Hamming Similarity - Different Hashes',
    score: `${(sim13 * 100).toFixed(2)}%`,
    expected: '≈0%',
    status: sim13 < 0.1 ? '✅' : '⚠️'
  });

  // Test Cosine Similarity
  const vec1 = new Float32Array([1, 0, 0, 0, 0]);
  const vec2 = new Float32Array([1, 0, 0, 0, 0]); // identical
  const vec3 = new Float32Array([-1, 0, 0, 0, 0]); // opposite
  const vec4 = new Float32Array([0.5, 0.5, 0.5, 0, 0]); // different

  const cos12 = cosineSimilarity(vec1, vec2);
  const cos13 = cosineSimilarity(vec1, vec3);
  const cos14 = cosineSimilarity(vec1, vec4);

  addLog(`Cosine Similarity (identical vectors): ${cos12.toFixed(4)}`, 'info');
  addLog(`Cosine Similarity (opposite vectors): ${cos13.toFixed(4)}`, 'info');
  addLog(`Cosine Similarity (different vectors): ${cos14.toFixed(4)}`, 'info');

  results.push({
    test: 'Cosine Similarity - Identical Vectors',
    score: cos12.toFixed(4),
    expected: '1.0',
    status: Math.abs(cos12 - 1.0) < 0.01 ? '✅' : '⚠️'
  });

  results.push({
    test: 'Cosine Similarity - Opposite Vectors',
    score: cos13.toFixed(4),
    expected: '-1.0',
    status: Math.abs(cos13 + 1.0) < 0.01 ? '✅' : '⚠️'
  });

  results.push({
    test: 'Cosine Similarity - Different Vectors',
    score: cos14.toFixed(4),
    expected: '≈0.5',
    status: Math.abs(cos14 - 0.5) < 0.3 ? '✅' : '⚠️'
  });

  // Test Composite Scoring
  const compScore = compositeScore(0.9, 0.85, true);
  
  addLog(`Composite Score (0.9 hash, 0.85 embedding, logo match): ${(compScore.score * 100).toFixed(2)}% (${compScore.level})`, 'info');

  results.push({
    test: 'Composite Score Calculation',
    score: `${(compScore.score * 100).toFixed(2)}% (${compScore.level})`,
    expected: '≈0.865 (high)',
    status: compScore.score > 0.80 ? '✅' : '⚠️'
  });

  addLog('Similarity Scoring Tests COMPLETED', 'success');
  displayResults(resultsEl, results);
}

// ============================================================================
// Test 4: Embeddings
// ============================================================================

async function testEmbeddings() {
  const resultsEl = document.getElementById('embedding-results');
  addLog('Starting Embedding Tests', 'test');
  resultsEl.innerHTML = '<div class="test-loading">Testing embeddings...</div>';

  const results = [];

  try {
    addLog('Testing text embedding...', 'info');
    const startTime = performance.now();
    
    const embedding = await generateTextEmbedding('sports cricket match highlight');
    const time = (performance.now() - startTime).toFixed(2);

    addLog(`Text embedding generated: ${embedding.length} dimensions (${time}ms)`, 'success');

    results.push({
      test: 'Text Embedding Generation',
      dimensions: embedding.length,
      time: `${time}ms`,
      sampleValues: `[${Array.from(embedding.slice(0, 5)).map(v => v.toFixed(4)).join(', ')}...]`,
      status: embedding.length === 768 ? '✅' : '⚠️'
    });

    // Test another embedding
    const embedding2 = await generateTextEmbedding('sports cricket match');
    const similarity = cosineSimilarity(embedding, embedding2);

    addLog(`Embedding similarity (similar texts): ${(similarity * 100).toFixed(2)}%`, 'info');

    results.push({
      test: 'Embedding Similarity (Similar Texts)',
      similarity: `${(similarity * 100).toFixed(2)}%`,
      expected: '>50%',
      status: similarity > 0.5 ? '✅' : '⚠️'
    });

  } catch (error) {
    addLog(`Embedding test failed: ${error.message}`, 'error');
    results.push({ test: 'Embedding Test', status: `❌ ${error.message}` });
  }

  displayResults(resultsEl, results);
}

// ============================================================================
// Test 5: Vision API
// ============================================================================

async function testVisionAPI() {
  const resultsEl = document.getElementById('vision-results');
  const fileInput = document.getElementById('vision-test-file');

  if (!fileInput.files[0]) {
    resultsEl.innerHTML = '<div class="test-error">Please select an image file first</div>';
    return;
  }

  addLog('Starting Vision API Tests', 'test');
  resultsEl.innerHTML = '<div class="test-loading">Analyzing image with Cloud Vision...</div>';

  try {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const base64DataUri = e.target.result;
        const base64 = base64DataUri.replace(/^data:image\/\w+;base64,/, '');

        addLog(`Calling Cloud Vision API...`, 'info');
        const startTime = performance.now();
        const visionResult = await analyzeWithVision(base64);
        const time = (performance.now() - startTime).toFixed(2);

        addLog(`Vision API response received (${time}ms)`, 'success');

        const results = [
          { metric: 'Response Time', value: `${time}ms` },
          { metric: 'Logos Detected', value: visionResult.logos?.length || 0 },
          { metric: 'Labels Detected', value: visionResult.labels?.length || 0 },
          { metric: 'OCR Text', value: (visionResult.text || '').substring(0, 50) || 'None' },
          { metric: 'Web Entities', value: visionResult.webEntities?.length || 0 },
          { metric: 'Similar Images', value: visionResult.similarWebImages?.length || 0 },
          { metric: 'Pages with Image', value: visionResult.pagesWithImage?.length || 0 },
        ];

        displayResults(resultsEl, results);

        // Log detailed results
        addLog(`Logos: ${JSON.stringify(visionResult.logos)}`, 'info');
        addLog(`Labels: ${JSON.stringify(visionResult.labels)}`, 'info');
        addLog(`Vision API test COMPLETED`, 'success');
      } catch (error) {
        addLog(`Vision API error: ${error.message}`, 'error');
        resultsEl.innerHTML = `<div class="test-error">Error: ${error.message}</div>`;
      }
    };

    reader.readAsDataURL(file);
  } catch (error) {
    addLog(`Vision test error: ${error.message}`, 'error');
    resultsEl.innerHTML = `<div class="test-error">Error: ${error.message}</div>`;
  }
}

// ============================================================================
// Test 6: Gemini API
// ============================================================================

async function testGeminiAPI() {
  const resultsEl = document.getElementById('gemini-results');
  const fileInput = document.getElementById('gemini-test-file');

  if (!fileInput.files[0]) {
    resultsEl.innerHTML = '<div class="test-error">Please select an image file first</div>';
    return;
  }

  addLog('Starting Gemini API Tests', 'test');
  resultsEl.innerHTML = '<div class="test-loading">Analyzing image with Gemini...</div>';

  try {
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const base64DataUri = e.target.result;
        const base64 = base64DataUri.replace(/^data:image\/\w+;base64,/, '');

        addLog(`Calling Gemini API...`, 'info');
        const startTime = performance.now();
        const analysis = await analyzeAsset(base64, { fileName: file.name });
        const time = (performance.now() - startTime).toFixed(2);

        addLog(`Gemini API response received (${time}ms)`, 'success');

        const results = [
          { metric: 'Response Time', value: `${time}ms` },
          { metric: 'Sport Type', value: analysis.sport_type },
          { metric: 'Teams', value: (analysis.teams || []).join(', ') || 'None' },
          { metric: 'Content Type', value: analysis.content_type },
          { metric: 'Estimated Value', value: analysis.estimated_value },
          { metric: 'Piracy Risk', value: analysis.piracy_risk },
          { metric: 'Description', value: analysis.description || 'None' },
          { metric: 'Semantic Tags', value: (analysis.semantic_tags || []).join(', ') },
        ];

        displayResults(resultsEl, results);
        addLog(`Gemini analysis: ${JSON.stringify(analysis)}`, 'info');
        addLog(`Gemini API test COMPLETED`, 'success');
      } catch (error) {
        addLog(`Gemini API error: ${error.message}`, 'error');
        resultsEl.innerHTML = `<div class="test-error">Error: ${error.message}</div>`;
      }
    };

    reader.readAsDataURL(file);
  } catch (error) {
    addLog(`Gemini test error: ${error.message}`, 'error');
    resultsEl.innerHTML = `<div class="test-error">Error: ${error.message}</div>`;
  }
}

// ============================================================================
// Test 7: Integration
// ============================================================================

async function testIntegration() {
  const resultsEl = document.getElementById('integration-results');
  addLog('Starting Integration Tests', 'test');
  resultsEl.innerHTML = '<div class="test-loading">Running integration tests...</div>';

  const results = [];

  try {
    // Test 1: Credential signing and verification
    addLog('Testing credential signing and verification...', 'info');
    const testData = { test: 'data', timestamp: new Date().toISOString() };
    const credential = await signContent(testData);
    const verification = await verifyCredential(testData, credential);

    results.push({
      test: 'Credential Signing & Verification',
      signed: credential.hash ? '✅' : '❌',
      verified: verification.valid ? '✅' : '❌',
      status: verification.valid ? 'PASS' : 'FAIL'
    });

    addLog(`Credential test: ${verification.valid ? 'PASSED' : 'FAILED'}`, verification.valid ? 'success' : 'error');

    // Test 2: Tamper detection
    addLog('Testing tamper detection...', 'info');
    const tamperedData = { test: 'tampered', timestamp: new Date().toISOString() };
    const tamperedVerification = await verifyCredential(tamperedData, credential);

    results.push({
      test: 'Tamper Detection',
      tampered: credential.hash === tamperedVerification.storedHash ? '❌' : '✅',
      detected: !tamperedVerification.valid ? '✅' : '❌',
      status: !tamperedVerification.valid ? 'PASS' : 'FAIL'
    });

    addLog(`Tamper detection test: ${!tamperedVerification.valid ? 'PASSED' : 'FAILED'}`, !tamperedVerification.valid ? 'success' : 'error');

    addLog('Integration tests COMPLETED', 'success');
  } catch (error) {
    addLog(`Integration test error: ${error.message}`, 'error');
    results.push({ test: 'Integration', status: `❌ ${error.message}` });
  }

  displayResults(resultsEl, results);
}

// ============================================================================
// Test 8: Full Pipeline
// ============================================================================

async function testFullPipeline() {
  const resultsEl = document.getElementById('dna-results');
  const fileInput = document.getElementById('dna-test-file');

  if (!fileInput.files[0]) {
    resultsEl.innerHTML = '<div class="test-error">Please select an image file first</div>';
    return;
  }

  addLog('Starting Full Content DNA Pipeline Test', 'test');
  resultsEl.innerHTML = '<div class="test-loading">Running full pipeline...</div>';

  try {
    const file = fileInput.files[0];
    addLog(`Testing with file: ${file.name} (${file.size} bytes)`, 'info');

    const startTime = performance.now();
    const dna = await generateContentDNA(file, (progress) => {
      addLog(`Pipeline progress: ${progress.label} (${progress.percent}%)`, 'info');
    });
    const totalTime = (performance.now() - startTime).toFixed(2);

    addLog(`Full pipeline completed in ${totalTime}ms`, 'success');

    const results = [
      { metric: 'Total Time', value: `${totalTime}ms` },
      { metric: 'Asset ID', value: dna.id },
      { metric: 'Filename', value: dna.filename },
      { metric: 'File Size', value: `${(dna.fileSize / 1024).toFixed(1)} KB` },
      { metric: 'pHash', value: dna.hashes.pHash },
      { metric: 'dHash', value: dna.hashes.dHash },
      { metric: 'aHash', value: dna.hashes.aHash },
      { metric: 'Embedding Dimensions', value: dna.embedding.length },
      { metric: 'Sport Type', value: dna.gemini.sport_type },
      { metric: 'Content Type', value: dna.gemini.content_type },
      { metric: 'Estimated Value', value: dna.gemini.estimated_value },
      { metric: 'Logos Detected', value: (dna.vision.logos || []).length },
      { metric: 'Labels Detected', value: (dna.vision.labels || []).length },
      { metric: 'Credential Hash', value: `${dna.credential.hash.substring(0, 16)}...` },
    ];

    displayResults(resultsEl, results);
    addLog('Full pipeline test COMPLETED', 'success');
  } catch (error) {
    addLog(`Pipeline test error: ${error.message}`, 'error');
    resultsEl.innerHTML = `<div class="test-error">Error: ${error.message}</div>`;
  }
}

// ============================================================================
// Result Display
// ============================================================================

function displayResults(container, results) {
  const html = `
    <table class="test-results-table">
      <tbody>
        ${results.map((row, i) => `
          <tr>
            ${Object.values(row).map((val, j) => {
              const content = typeof val === 'object' ? JSON.stringify(val) : val;
              const cellClass = j === 0 ? 'col-label' : content === '✅' || content === 'PASS' ? 'col-pass' : content === '❌' || content === 'FAIL' ? 'col-fail' : '';
              return `<td class="${cellClass}">${content}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}
