/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Propagation Page
   ═══════════════════════════════════════════════════════════ */

export function getPropagationContainers() {
  return { graph: '#propagation-graph' };
}

export default function renderPropagation() {
  const html = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Content Propagation Network</h1>
          <p class="page-subtitle">Visualize how your content spreads across platforms</p>
        </div>
      </div>

      <div class="graph-container" id="propagation-graph-wrapper">
        <!-- D3 graph renders here (Member 4) -->
        <div id="propagation-graph" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;">
          <div style="text-align:center;color:var(--text-muted);">
            <div style="font-size:3rem;margin-bottom:12px;">🌐</div>
            <p style="font-size:0.95rem;margin-bottom:4px;">Force-directed propagation graph</p>
            <p style="font-size:0.8rem;">Visualization will render here via D3.js</p>
          </div>
        </div>

        <!-- Legend Overlay -->
        <div class="graph-legend">
          <div class="graph-legend-item">
            <span class="graph-legend-dot" style="background:var(--accent-success);"></span>
            <span>Authorized</span>
          </div>
          <div class="graph-legend-item">
            <span class="graph-legend-dot" style="background:var(--accent-danger);"></span>
            <span>Unauthorized</span>
          </div>
          <div class="graph-legend-item">
            <span class="graph-legend-dot" style="background:var(--accent-warning);"></span>
            <span>Suspicious</span>
          </div>
        </div>

        <!-- Controls Overlay -->
        <div class="graph-controls">
          <button class="btn-icon" id="graph-zoom-in" aria-label="Zoom in">+</button>
          <button class="btn-icon" id="graph-zoom-out" aria-label="Zoom out">−</button>
          <button class="btn-icon" id="graph-reset" aria-label="Reset view">↺</button>
        </div>

        <!-- Node Detail Panel (slide-in) -->
        <div class="node-detail-panel" id="node-detail-panel">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
            <h3>Node Details</h3>
            <button class="btn-icon" id="close-node-panel" aria-label="Close panel">✕</button>
          </div>
          <div class="form-group">
            <div class="form-label">Platform</div>
            <div id="node-platform" style="font-size:0.95rem;">—</div>
          </div>
          <div class="form-group">
            <div class="form-label">Account</div>
            <div id="node-account" style="font-size:0.95rem;font-family:monospace;">—</div>
          </div>
          <div class="form-group">
            <div class="form-label">Violations</div>
            <div id="node-violations" style="font-size:0.95rem;">—</div>
          </div>
          <div class="form-group">
            <div class="form-label">First Seen</div>
            <div id="node-first-seen" style="font-size:0.95rem;">—</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:20px;">
            <button class="btn btn-primary btn-sm" aria-label="View threats">View Threats</button>
            <button class="btn btn-danger btn-sm" aria-label="Block account">Block Account</button>
          </div>
        </div>
      </div>

      <!-- Time Slider -->
      <div class="glass-card" style="margin-top:16px;padding:16px 24px;">
        <div style="display:flex;align-items:center;gap:16px;">
          <span style="font-size:0.8rem;color:var(--text-muted);white-space:nowrap;">Timeline</span>
          <input type="range" min="0" max="100" value="100" id="time-slider"
                 style="flex:1;accent-color:var(--accent-primary);" aria-label="Time range slider" />
          <span style="font-size:0.8rem;color:var(--text-secondary);" id="time-label">Now</span>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    const closeBtn = document.getElementById('close-node-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('node-detail-panel')?.classList.remove('open');
      });
    }
  }, 50);

  return html;
}
