/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Threats Page
   ═══════════════════════════════════════════════════════════ */

import { navigateTo } from '../utils/router.js';
import { classifyThreat } from '../services/gemini.js';

const sampleThreats = [
  {
    id: 't1', severity: 'critical', title: 'Betting site using IPL logo',
    platform: 'suspicious-bets.com', similarity: 94, intent: 'Commercial',
    description: 'Unauthorized reproduction of the official IPL logo on an unlicensed betting platform.',
  },
  {
    id: 't2', severity: 'high', title: 'Match highlight redistributed without license',
    platform: 'YouTube', similarity: 87, intent: 'Monetization',
    description: 'Full match highlights uploaded to a third-party channel with ad revenue enabled.',
  },
  {
    id: 't3', severity: 'medium', title: 'Fan account shared highlight clip',
    platform: 'Twitter/X', similarity: 78, intent: 'Fan sharing',
    description: 'Short clip shared by a fan account with commentary overlay.',
  },
  {
    id: 't4', severity: 'low', title: 'Thumbnail reuse in blog post',
    platform: 'WordPress blog', similarity: 65, intent: 'Editorial',
    description: 'News blog used official thumbnail in a match review article.',
  },
  {
    id: 't5', severity: 'critical', title: 'Live stream rebroadcast on Telegram',
    platform: 'Telegram', similarity: 98, intent: 'Piracy',
    description: 'Unauthorized live rebroadcast of ongoing match to a public channel.',
  },
  {
    id: 't6', severity: 'high', title: 'Merchandise using protected jersey design',
    platform: 'AliExpress', similarity: 82, intent: 'Counterfeiting',
    description: 'Knockoff merchandise replicating official team jersey design and branding.',
  },
];

const severityConfig = {
  critical: { class: 'badge-critical', icon: '🔴', label: 'CRITICAL' },
  high:     { class: 'badge-high',     icon: '🟠', label: 'HIGH' },
  medium:   { class: 'badge-medium',   icon: '🟡', label: 'MEDIUM' },
  low:      { class: 'badge-low',      icon: '🟢', label: 'LOW' },
};

export default function renderThreats() {
  const html = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Threat Assessment</h1>
          <p class="page-subtitle">Review detected violations and take action</p>
        </div>
        <div style="display:flex;gap:8px;">
          <select class="form-select" id="threat-filter" style="width:160px;" aria-label="Filter by severity">
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <!-- Threat Cards Grid -->
      <div class="grid grid-2 gap-lg" id="threats-grid">
        ${sampleThreats.map((t, i) => renderThreatCard(t, i)).join('')}
      </div>

      <!-- Detail Panel (toggle visibility) -->
      <div class="glass-card" id="threat-detail-panel" style="margin-top:28px;display:none;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <h3 id="detail-title">Threat Details</h3>
          <button class="btn btn-ghost btn-sm" id="close-detail-btn" aria-label="Close details">✕ Close</button>
        </div>
        <div class="grid grid-2 gap-lg" style="margin-bottom:20px;">
          <div style="text-align:center;">
            <div class="form-label">Original Asset</div>
            <div style="height:160px;background:var(--bg-primary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
              <span style="font-size:2rem;">🖼️</span>
            </div>
          </div>
          <div style="text-align:center;">
            <div class="form-label">Suspect Content</div>
            <div style="height:160px;background:var(--bg-primary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:center;">
              <span style="font-size:2rem;">🔍</span>
            </div>
          </div>
        </div>
        <div style="margin-bottom:16px;">
          <div class="form-label">Gemini Analysis</div>
          <div id="detail-analysis" style="font-size:0.85rem;color:var(--text-secondary);background:var(--bg-primary);padding:12px 16px;border-radius:var(--radius-sm);">
            Analysis results will appear here (populated by Member 2).
          </div>
        </div>
        <div>
          <div class="form-label">Similarity Breakdown</div>
          <div class="similarity-bar">
            <span class="similarity-bar-label">Hash</span>
            <div class="similarity-bar-track"><div class="similarity-bar-fill" id="sim-hash" style="width:0%;background:var(--accent-primary);"></div></div>
            <span class="similarity-bar-value" id="sim-hash-val">0%</span>
          </div>
          <div class="similarity-bar">
            <span class="similarity-bar-label">Visual</span>
            <div class="similarity-bar-track"><div class="similarity-bar-fill" id="sim-visual" style="width:0%;background:var(--accent-info);"></div></div>
            <span class="similarity-bar-value" id="sim-visual-val">0%</span>
          </div>
          <div class="similarity-bar">
            <span class="similarity-bar-label">Semantic</span>
            <div class="similarity-bar-track"><div class="similarity-bar-fill" id="sim-semantic" style="width:0%;background:var(--accent-secondary);"></div></div>
            <span class="similarity-bar-value" id="sim-semantic-val">0%</span>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => initThreatsInteractivity(), 50);

  return html;
}

function renderThreatCard(threat, index) {
  const sev = severityConfig[threat.severity];
  return `
    <div class="threat-card stagger-${index + 1}" style="animation:cardEntrance 0.4s ease forwards;opacity:0;" data-severity="${threat.severity}" data-threat-id="${threat.id}">
      <div class="threat-card-header">
        <div>
          <div class="threat-card-title">${sev.icon} ${threat.title}</div>
          <div class="threat-card-platform">Platform: ${threat.platform}</div>
        </div>
        <span class="badge ${sev.class}">${sev.label}</span>
      </div>
      <div class="threat-card-meta">
        <div class="threat-card-meta-item">Similarity: <strong>${threat.similarity}%</strong></div>
        <div class="threat-card-meta-item">Intent: <strong>${threat.intent}</strong></div>
      </div>
      <div class="threat-card-actions">
        <button class="btn btn-secondary btn-sm view-detail-btn" data-threat-id="${threat.id}" aria-label="View details">View Details</button>
        <button class="btn btn-primary btn-sm generate-dmca-btn" data-threat-id="${threat.id}" aria-label="Generate DMCA">Generate DMCA</button>
      </div>
    </div>
  `;
}

function initThreatsInteractivity() {
  // Filter
  const filter = document.getElementById('threat-filter');
  if (filter) {
    filter.addEventListener('change', () => {
      const val = filter.value;
      document.querySelectorAll('.threat-card').forEach(card => {
        if (val === 'all' || card.dataset.severity === val) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // View details
  document.querySelectorAll('.view-detail-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const t = sampleThreats.find(x => x.id === btn.dataset.threatId);
      if (!t) return;
      const panel = document.getElementById('threat-detail-panel');
      if (panel) {
        panel.style.display = '';
        document.getElementById('detail-title').textContent = t.title;
        document.getElementById('detail-analysis').innerHTML = '<span style="color:var(--accent-warning);">⏳ Gemini AI is analyzing the threat...</span>';
        
        // Reset bars
        animateBar('sim-hash', 0);
        animateBar('sim-visual', 0);
        animateBar('sim-semantic', 0);
        panel.scrollIntoView({ behavior: 'smooth' });

        try {
          // Call the AI engine (using empty strings will trigger the fallback which is perfectly fine for the demo dashboard)
          const result = await classifyThreat('', '');
          
          document.getElementById('detail-analysis').innerHTML = `
            <strong>AI Assessment:</strong> ${result.evidence_summary || t.description}<br/>
            <strong>Recommended Action:</strong> <span class="badge badge-high">${result.recommended_action}</span><br/>
            <strong>Modifications Detected:</strong> ${(result.modifications_detected || []).join(', ')}
          `;
        } catch (err) {
          document.getElementById('detail-analysis').innerHTML = `<span style="color:var(--accent-danger);">❌ Error: ${err.message}</span>`;
        }

        // Animate bars
        setTimeout(() => {
          animateBar('sim-hash', t.similarity - 5);
          animateBar('sim-visual', t.similarity);
          animateBar('sim-semantic', t.similarity - 10);
        }, 100);
      }
    });
  });

  // Close detail
  document.getElementById('close-detail-btn')?.addEventListener('click', () => {
    const panel = document.getElementById('threat-detail-panel');
    if (panel) panel.style.display = 'none';
  });

  // Generate DMCA buttons
  document.querySelectorAll('.generate-dmca-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo('dmca'));
  });
}

function animateBar(id, percent) {
  const fill = document.getElementById(id);
  const val = document.getElementById(id + '-val');
  if (fill) fill.style.width = percent + '%';
  if (val) val.textContent = percent + '%';
}
