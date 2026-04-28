/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Register Asset Page
   ═══════════════════════════════════════════════════════════ */

import { generateContentDNA } from '../engine/content-dna.js';

export default function renderRegister() {
  const html = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Register Digital Asset</h1>
          <p class="page-subtitle">Upload and generate a Content DNA fingerprint for your media</p>
        </div>
      </div>

      <!-- Drag & Drop Zone -->
      <div class="drop-zone" id="upload-drop-zone" role="button" aria-label="Upload file by dragging or clicking">
        <div class="drop-zone-icon">📤</div>
        <div class="drop-zone-text">Drop your image here or click to browse</div>
        <div class="drop-zone-hint">Supports JPG, PNG, WEBP, SVG — Max 25MB</div>
        <input type="file" id="upload-file-input" accept="image/*" style="display:none;" aria-label="Choose file" />
      </div>

      <!-- Preview + Form -->
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px;margin-top:28px;">
        <!-- Image Preview -->
        <div class="glass-card" id="upload-preview-card" style="min-height:280px;display:flex;align-items:center;justify-content:center;">
          <div id="upload-preview" style="text-align:center;">
            <p class="text-muted">Image preview will appear here</p>
          </div>
        </div>

        <!-- Metadata Form -->
        <div class="glass-card">
          <h3 style="margin-bottom:20px;">Asset Metadata</h3>
          <div class="form-group">
            <label class="form-label" for="asset-title">Title</label>
            <input type="text" class="form-input" id="asset-title" placeholder="e.g. IPL Logo 2025" />
          </div>
          <div class="form-group">
            <label class="form-label" for="asset-org">Organization</label>
            <input type="text" class="form-input" id="asset-org" placeholder="e.g. BCCI" />
          </div>
          <div class="form-group">
            <label class="form-label" for="asset-sport">Sport</label>
            <select class="form-select" id="asset-sport">
              <option value="">Select sport...</option>
              <option value="cricket">Cricket</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="asset-license">License</label>
            <select class="form-select" id="asset-license">
              <option value="">Select license...</option>
              <option value="exclusive">Exclusive Rights</option>
              <option value="commercial">Commercial Use</option>
              <option value="editorial">Editorial Only</option>
              <option value="personal">Personal Use</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Content DNA Pipeline -->
      <div class="glass-card" style="margin-top:28px;">
        <h3 style="margin-bottom:20px;">Content DNA Pipeline</h3>
        <div class="step-wizard" id="dna-pipeline">
          <div class="step-item active" data-step="1">
            <span class="step-number">1</span>
            <span>Hash</span>
          </div>
          <div class="step-connector" id="connector-1-2"></div>
          <div class="step-item" data-step="2">
            <span class="step-number">2</span>
            <span>Vision</span>
          </div>
          <div class="step-connector" id="connector-2-3"></div>
          <div class="step-item" data-step="3">
            <span class="step-number">3</span>
            <span>Gemini AI</span>
          </div>
          <div class="step-connector" id="connector-3-4"></div>
          <div class="step-item" data-step="4">
            <span class="step-number">4</span>
            <span>Sign</span>
          </div>
        </div>

        <!-- Results Panel (populated by Member 2) -->
        <div id="dna-results" class="grid grid-2 gap-md" style="margin-top:20px;">
          <div style="padding:16px;background:var(--bg-primary);border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Perceptual Hashes</div>
            <div id="dna-hashes" style="font-family:monospace;font-size:0.8rem;color:var(--text-muted);">Awaiting upload...</div>
          </div>
          <div style="padding:16px;background:var(--bg-primary);border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Detected Logos</div>
            <div id="dna-logos" style="font-size:0.85rem;color:var(--text-muted);">Awaiting upload...</div>
          </div>
          <div style="padding:16px;background:var(--bg-primary);border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">AI Description</div>
            <div id="dna-description" style="font-size:0.85rem;color:var(--text-muted);">Awaiting upload...</div>
          </div>
          <div style="padding:16px;background:var(--bg-primary);border-radius:var(--radius-sm);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Content Credential</div>
            <div id="dna-credential" style="font-size:0.85rem;color:var(--text-muted);">Awaiting upload...</div>
          </div>
        </div>
      </div>

      <!-- Register Button -->
      <div style="text-align:center;margin-top:28px;">
        <button class="btn btn-primary btn-lg" id="register-asset-btn" aria-label="Register asset">
          🛡️ Register Asset
        </button>
      </div>
    </div>
  `;

  // Initialise drag-drop after render
  setTimeout(() => initDragDrop(), 50);

  return html;
}

function initDragDrop() {
  const zone = document.getElementById('upload-drop-zone');
  const input = document.getElementById('upload-file-input');
  if (!zone || !input) return;

  zone.addEventListener('click', () => input.click());

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });
}

async function handleFile(file) {
  const preview = document.getElementById('upload-preview');
  if (!preview) return;

  if (!file.type.startsWith('image/')) {
    preview.innerHTML = '<p style="color:var(--accent-danger);">Please upload an image file.</p>';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `
      <img src="${e.target.result}"
           style="max-width:100%;max-height:250px;border-radius:var(--radius-md);object-fit:contain;"
           alt="Uploaded asset preview" />
      <p style="margin-top:8px;font-size:0.8rem;color:var(--text-muted);">${file.name} (${(file.size / 1024).toFixed(1)} KB)</p>
    `;
  };
  reader.readAsDataURL(file);

  // START DNA PIPELINE
  const hashEl = document.getElementById('dna-hashes');
  const logoEl = document.getElementById('dna-logos');
  const descEl = document.getElementById('dna-description');
  const credEl = document.getElementById('dna-credential');
  
  hashEl.innerHTML = '<span style="color:var(--accent-warning);">Computing hashes...</span>';
  logoEl.innerHTML = '<span style="color:var(--accent-warning);">Awaiting vision API...</span>';
  descEl.innerHTML = '<span style="color:var(--accent-warning);">Awaiting Gemini AI...</span>';
  credEl.innerHTML = '<span style="color:var(--accent-warning);">Awaiting credentials...</span>';

  const setStep = (num) => {
    document.querySelectorAll('.step-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.step-item[data-step="${num}"]`)?.classList.add('active');
  };

  try {
    const dna = await generateContentDNA(file, (progress) => {
      if (progress.step === 'hashing') setStep(1);
      if (progress.step === 'vision') setStep(2);
      if (progress.step === 'gemini') setStep(3);
      if (progress.step === 'signing') setStep(4);
    });

    // Populate the results
    hashEl.innerHTML = `pHash: ${dna.hashes.pHash.substring(0, 8)}...<br/>dHash: ${dna.hashes.dHash.substring(0, 8)}...<br/>aHash: ${dna.hashes.aHash.substring(0, 8)}...`;
    
    if (dna.vision?.logos?.length > 0) {
      logoEl.innerHTML = dna.vision.logos.map(l => l.name).join(', ');
    } else {
      logoEl.innerHTML = 'No logos detected';
    }

    descEl.innerHTML = `
      <strong>Sport:</strong> ${dna.gemini?.sport_type || 'Unknown'}<br/>
      <strong>Teams:</strong> ${(dna.gemini?.teams || []).join(' vs ')}<br/>
      <strong>Risk:</strong> ${dna.gemini?.piracy_risk || 'Unknown'}
    `;

    credEl.innerHTML = `Signed: ${new Date(dna.timestamp).toLocaleTimeString()}<br/>ID: ${dna.id.split('-')[0]}`;
    
    // Auto-fill form if possible
    if (dna.gemini?.sport_type) {
      const sportSelect = document.getElementById('asset-sport');
      // Match select options
      const sport = dna.gemini.sport_type.toLowerCase();
      if (sportSelect && Array.from(sportSelect.options).some(opt => opt.value === sport)) {
        sportSelect.value = sport;
      } else if (sportSelect) {
        sportSelect.value = 'other';
      }
    }
  } catch (err) {
    console.error("Pipeline error", err);
    hashEl.innerHTML = '<span style="color:var(--accent-danger);">Error processing</span>';
  }
}
