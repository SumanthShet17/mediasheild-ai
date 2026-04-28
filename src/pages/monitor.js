/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Monitor Page
   ═══════════════════════════════════════════════════════════ */

import { renderThreatFeed } from '../components/threat-feed.js';

const platforms = [
  { icon: '𝕏', name: 'Twitter / X', status: 'active',   statusIcon: '🟢', statusText: 'Scanning' },
  { icon: '▶️', name: 'YouTube',     status: 'active',   statusIcon: '🟢', statusText: 'Scanning' },
  { icon: '📷', name: 'Instagram',   status: 'queued',   statusIcon: '⏳', statusText: 'Queued' },
  { icon: '✈️', name: 'Telegram',    status: 'active',   statusIcon: '🟢', statusText: 'Scanning' },
  { icon: '🎵', name: 'TikTok',      status: 'queued',   statusIcon: '⏳', statusText: 'Queued' },
  { icon: '📘', name: 'Facebook',    status: 'inactive', statusIcon: '⚪', statusText: 'Inactive' },
  { icon: '🤖', name: 'Reddit',      status: 'active',   statusIcon: '🟢', statusText: 'Scanning' },
  { icon: '🌐', name: 'Web Crawl',   status: 'active',   statusIcon: '🔄', statusText: 'Crawling' },
];

export function getMonitorContainers() {
  return { scanAnimation: '#monitor-scan-animation' };
}

export default function renderMonitor() {
  const html = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Real-Time Monitoring</h1>
          <p class="page-subtitle">Scan platforms for unauthorized content usage</p>
        </div>
        <button class="btn btn-primary" id="start-scan-btn" aria-label="Start scan">
          ▶ Start Scan
        </button>
      </div>

      <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
        <!-- Platform Cards -->
        <div>
          <h3 style="margin-bottom:16px;">Platforms</h3>
          <div class="grid grid-2 gap-md">
            ${platforms.map((p, i) => `
              <div class="platform-card stagger-${i + 1}" style="animation:cardEntrance 0.4s ease forwards;opacity:0;" id="platform-${p.name.replace(/\s+/g, '-').toLowerCase()}">
                <div class="platform-card-icon">${p.icon}</div>
                <div class="platform-card-name">${p.name}</div>
                <div class="platform-card-status">
                  <span>${p.statusIcon}</span>
                  <span style="color:${p.status === 'active' ? 'var(--accent-success)' : p.status === 'queued' ? 'var(--accent-warning)' : 'var(--text-muted)'}">
                    ${p.statusText}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Live Detection Feed -->
        <div class="glass-card" style="padding:20px;">
          <h3 style="margin-bottom:16px;">Live Detection Feed</h3>
          <div id="monitor-detection-feed"></div>
        </div>
      </div>

      <!-- Scan Animation Area (placeholder for Member 4) -->
      <div class="glass-card" style="padding:24px;text-align:center;">
        <h3 style="margin-bottom:16px;">Scan Visualization</h3>
        <div id="monitor-scan-animation" style="min-height:220px;display:flex;align-items:center;justify-content:center;">
          <div class="scan-animation">
            <div class="scan-ring"></div>
            <div class="scan-ring"></div>
            <div class="scan-ring"></div>
            <div class="scan-sweep"></div>
            <div class="scan-center"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    renderThreatFeed('monitor-detection-feed', 8);

    const scanBtn = document.getElementById('start-scan-btn');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => {
        scanBtn.textContent = '⏹ Scanning...';
        scanBtn.classList.remove('btn-primary');
        scanBtn.classList.add('btn-danger');
      });
    }
  }, 50);

  return html;
}
