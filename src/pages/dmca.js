/* ═══════════════════════════════════════════════════════════
   MediaShield AI — DMCA Takedown Page
   ═══════════════════════════════════════════════════════════ */

import { generateDMCA } from '../services/gemini.js';

const violations = [
  { id: 'v1', title: 'Betting site using IPL logo', platform: 'suspicious-bets.com', severity: 'critical' },
  { id: 'v2', title: 'Match highlight redistributed', platform: 'YouTube', severity: 'high' },
  { id: 'v3', title: 'Live stream rebroadcast', platform: 'Telegram', severity: 'critical' },
  { id: 'v4', title: 'Merchandise using jersey design', platform: 'AliExpress', severity: 'high' },
];

let currentStep = 1;
let selectedViolation = null;

export default function renderDmca() {
  const html = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">DMCA Takedown Workflow</h1>
          <p class="page-subtitle">Generate and send legally-compliant takedown notices</p>
        </div>
      </div>

      <!-- Step Wizard -->
      <div class="step-wizard" id="dmca-wizard">
        <div class="step-item active" data-step="1">
          <span class="step-number">1</span><span>Select</span>
        </div>
        <div class="step-connector" id="dmca-conn-1"></div>
        <div class="step-item" data-step="2">
          <span class="step-number">2</span><span>Evidence</span>
        </div>
        <div class="step-connector" id="dmca-conn-2"></div>
        <div class="step-item" data-step="3">
          <span class="step-number">3</span><span>Generate</span>
        </div>
        <div class="step-connector" id="dmca-conn-3"></div>
        <div class="step-item" data-step="4">
          <span class="step-number">4</span><span>Send</span>
        </div>
      </div>

      <!-- Step Content -->
      <div id="dmca-step-content" class="glass-card" style="min-height:320px;">
        ${renderStep1()}
      </div>

      <!-- Navigation Buttons -->
      <div style="display:flex;justify-content:space-between;margin-top:20px;">
        <button class="btn btn-secondary" id="dmca-prev-btn" style="visibility:hidden;" aria-label="Previous step">← Previous</button>
        <button class="btn btn-primary" id="dmca-next-btn" aria-label="Next step">Next →</button>
      </div>
    </div>
  `;

  setTimeout(() => initDmcaWizard(), 50);

  return html;
}

function renderStep1() {
  return `
    <h3 style="margin-bottom:16px;">Select Violation</h3>
    <p class="text-secondary" style="margin-bottom:16px;font-size:0.85rem;">Choose the violation to issue a DMCA notice for:</p>
    <div style="display:flex;flex-direction:column;gap:8px;" id="violation-list">
      ${violations.map(v => `
        <div class="glass-card" style="padding:16px;cursor:pointer;transition:all 0.2s;" data-violation-id="${v.id}" role="button" aria-label="Select violation: ${v.title}">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-weight:600;font-size:0.9rem;">${v.title}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);">Platform: ${v.platform}</div>
            </div>
            <span class="badge badge-${v.severity === 'critical' ? 'critical' : 'high'}">${v.severity.toUpperCase()}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderStep2() {
  const v = selectedViolation || violations[0];
  return `
    <h3 style="margin-bottom:16px;">Review Evidence</h3>
    <div class="grid grid-2 gap-lg">
      <div>
        <div class="form-label">Original Asset</div>
        <div style="height:140px;background:var(--bg-primary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:2rem;">🖼️</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);">Registered: Jan 15, 2025</div>
      </div>
      <div>
        <div class="form-label">Infringing Content</div>
        <div style="height:140px;background:var(--bg-primary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
          <span style="font-size:2rem;">🔍</span>
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);">Found: ${v.platform}</div>
      </div>
    </div>
    <div style="margin-top:20px;padding:16px;background:var(--bg-primary);border-radius:var(--radius-sm);">
      <div class="form-label">Evidence Summary</div>
      <div style="font-size:0.85rem;color:var(--text-secondary);">
        Similarity: <strong style="color:var(--text-primary);">94%</strong> •
        Hash Match: <strong style="color:var(--text-primary);">Yes</strong> •
        Content DNA: <strong style="color:var(--accent-success);">Verified</strong>
      </div>
    </div>
  `;
}

function renderStep3() {
  return `
    <h3 style="margin-bottom:16px;">DMCA Notice Preview</h3>
    <p class="text-secondary" style="margin-bottom:16px;font-size:0.85rem;">Generated by Gemini AI (Member 2 integration point)</p>
    <div class="dmca-preview" id="dmca-notice-text">
      <span style="color:var(--accent-warning);">⏳ Generating DMCA notice using Gemini AI...</span>
    </div>
  `;
}

function renderStep4() {
  return `
    <h3 style="margin-bottom:16px;">Send & Track</h3>
    <p class="text-secondary" style="margin-bottom:20px;font-size:0.85rem;">Export your notice and track its status</p>
    <div style="display:flex;gap:12px;margin-bottom:24px;">
      <button class="btn btn-primary" id="dmca-copy-btn" aria-label="Copy to clipboard">📋 Copy to Clipboard</button>
      <button class="btn btn-secondary" id="dmca-download-btn" aria-label="Download PDF">📥 Download PDF</button>
      <button class="btn btn-secondary" id="dmca-mark-sent-btn" aria-label="Mark as sent">✅ Mark as Sent</button>
    </div>
    <div class="glass-card" style="padding:16px;" id="dmca-status-panel">
      <div class="form-label">Status Tracker</div>
      <div style="display:flex;align-items:center;gap:12px;font-size:0.85rem;color:var(--text-secondary);">
        <span class="badge badge-info">PENDING</span>
        <span>Notice generated — awaiting delivery confirmation</span>
      </div>
    </div>
  `;
}

function initDmcaWizard() {
  currentStep = 1;
  selectedViolation = null;

  const nextBtn = document.getElementById('dmca-next-btn');
  const prevBtn = document.getElementById('dmca-prev-btn');

  // Violation selection
  document.querySelectorAll('[data-violation-id]').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('[data-violation-id]').forEach(c => {
        c.style.borderColor = 'var(--glass-border)';
      });
      card.style.borderColor = 'var(--accent-primary)';
      selectedViolation = violations.find(v => v.id === card.dataset.violationId);
    });
  });

  if (nextBtn) nextBtn.addEventListener('click', () => goToStep(currentStep + 1));
  if (prevBtn) prevBtn.addEventListener('click', () => goToStep(currentStep - 1));
}

function goToStep(step) {
  if (step < 1 || step > 4) return;
  currentStep = step;

  const content = document.getElementById('dmca-step-content');
  const nextBtn = document.getElementById('dmca-next-btn');
  const prevBtn = document.getElementById('dmca-prev-btn');

  // Update wizard indicators
  document.querySelectorAll('#dmca-wizard .step-item').forEach(item => {
    const s = parseInt(item.dataset.step);
    item.classList.remove('active', 'completed');
    if (s === currentStep) item.classList.add('active');
    else if (s < currentStep) item.classList.add('completed');
  });

  document.querySelectorAll('#dmca-wizard .step-connector').forEach((conn, i) => {
    conn.classList.toggle('completed', i + 1 < currentStep);
    conn.classList.toggle('active', i + 1 === currentStep);
  });

  // Render step content
  const renders = { 1: renderStep1, 2: renderStep2, 3: renderStep3, 4: renderStep4 };
  if (content && renders[currentStep]) {
    content.innerHTML = renders[currentStep]();
  }

  // Button visibility
  if (prevBtn) prevBtn.style.visibility = currentStep > 1 ? 'visible' : 'hidden';
  if (nextBtn) {
    if (currentStep === 4) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = '';
    }
  }

  // Step-specific init
  if (currentStep === 1) {
    document.querySelectorAll('[data-violation-id]').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('[data-violation-id]').forEach(c => c.style.borderColor = 'var(--glass-border)');
        card.style.borderColor = 'var(--accent-primary)';
        selectedViolation = violations.find(v => v.id === card.dataset.violationId);
      });
    });
  }

  if (currentStep === 3) {
    const v = selectedViolation || violations[0];
    const violationData = {
      assetName: v.title,
      contentHash: "a442c425712f5a90",
      registrationDate: new Date().toISOString(),
      infringingUrl: `https://${v.platform}/violation`,
      ownerName: "Official Sports Rights Holder"
    };

    if (nextBtn) nextBtn.disabled = true;

    generateDMCA(violationData).then(result => {
      const el = document.getElementById('dmca-notice-text');
      if (el) {
        el.innerHTML = `
          <p><strong>${result.subject}</strong></p>
          <br/>
          <p>Reference: ${result.reference_id}</p>
          <p>Urgency: <span class="badge badge-high">${result.urgency}</span></p>
          <hr style="border:none;border-top:1px solid var(--glass-border);margin:12px 0;" />
          <pre style="white-space:pre-wrap;font-family:inherit;">${result.body}</pre>
        `;
        window.currentDmcaNotice = result.body;
      }
      if (nextBtn) nextBtn.disabled = false;
    }).catch(err => {
      const el = document.getElementById('dmca-notice-text');
      if (el) el.innerHTML = `<span style="color:var(--accent-danger);">❌ Error generating DMCA: ${err.message}</span>`;
      if (nextBtn) nextBtn.disabled = false;
    });
  }

  if (currentStep === 4) {
    document.getElementById('dmca-copy-btn')?.addEventListener('click', () => {
      const text = window.currentDmcaNotice || document.getElementById('dmca-notice-text')?.textContent || 'DMCA Notice content';
      navigator.clipboard?.writeText(text);
      const btn = document.getElementById('dmca-copy-btn');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy to Clipboard', 2000); }
    });

    document.getElementById('dmca-download-btn')?.addEventListener('click', () => {
      const text = window.currentDmcaNotice || document.getElementById('dmca-notice-text')?.textContent || 'DMCA Notice content';
      const blob = new Blob([text], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `DMCA_Notice_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });

    document.getElementById('dmca-mark-sent-btn')?.addEventListener('click', () => {
      const panel = document.getElementById('dmca-status-panel');
      if (panel) {
        panel.innerHTML = `
          <div class="form-label">Status Tracker</div>
          <div style="display:flex;align-items:center;gap:12px;font-size:0.85rem;color:var(--text-secondary);">
            <span class="badge badge-success">SENT</span>
            <span>Notice delivered — monitoring for platform response</span>
          </div>
        `;
      }
    });
  }
}
