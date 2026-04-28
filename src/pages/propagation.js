/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Propagation Page
   ═══════════════════════════════════════════════════════════ */

import * as d3 from 'd3';
import { summarizePropagation } from '../services/gemini.js';

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
        <div id="propagation-graph" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;">
          <!-- SVG will be injected here -->
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
            <div id="node-platform" style="font-size:0.95rem;text-transform:capitalize;">—</div>
          </div>
          <div class="form-group">
            <div class="form-label">Account / ID</div>
            <div id="node-account" style="font-size:0.95rem;font-family:monospace;">—</div>
          </div>
          <div class="form-group">
            <div class="form-label">Type</div>
            <div id="node-type" style="font-size:0.95rem;">—</div>
          </div>
          <div style="display:flex;gap:8px;margin-top:20px;">
            <button class="btn btn-primary btn-sm" aria-label="View threats">Investigate</button>
            <button class="btn btn-danger btn-sm" aria-label="Block account">Block</button>
          </div>
        </div>
      </div>

      <!-- AI Summary Panel -->
      <div class="glass-card" style="margin-top:16px;padding:20px;" id="ai-summary-panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3>✨ AI Intelligence Summary</h3>
          <button class="btn btn-secondary btn-sm" id="btn-generate-summary">Generate AI Report</button>
        </div>
        <div id="ai-summary-content" style="font-size:0.9rem;color:var(--text-secondary);">
          Click "Generate AI Report" to have Gemini analyze the current network propagation pattern.
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
    initD3Graph();
    const closeBtn = document.getElementById('close-node-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('node-detail-panel')?.classList.remove('open');
      });
    }

    document.getElementById('btn-generate-summary')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-generate-summary');
      const content = document.getElementById('ai-summary-content');
      btn.disabled = true;
      btn.textContent = '⏳ Analyzing...';
      content.innerHTML = '<span style="color:var(--accent-warning);">Gemini AI is analyzing network topography...</span>';
      
      const graphData = {
        nodes: 42,
        edges: 68,
        timeSpan: '48 hours',
        platforms: ['Twitter', 'Telegram', 'Web'],
        topNodes: [{id:'@sports_leaks', shares: 450}, {id:'t.me/free_streams', shares: 320}],
        regions: ['Global'],
        contentType: 'Live Broadcast',
      };

      try {
        const result = await summarizePropagation(graphData);
        content.innerHTML = `
          <p style="margin-bottom:12px;"><strong>Summary:</strong> ${result.summary}</p>
          <div class="grid grid-2 gap-sm" style="margin-bottom:12px;">
            <div><strong>Risk:</strong> <span class="badge badge-high">${result.risk_assessment}</span></div>
            <div><strong>Reach:</strong> ${result.estimated_reach}</div>
            <div><strong>Pattern:</strong> ${result.temporal_pattern}</div>
            <div><strong>Geography:</strong> ${result.geographic_focus}</div>
          </div>
          <p style="margin-bottom:8px;"><strong>Recommended Actions:</strong></p>
          <ul style="margin-left:20px;">
            ${(result.recommended_actions || []).map(a => `<li>${a}</li>`).join('')}
          </ul>
        `;
      } catch (err) {
        content.innerHTML = `<span style="color:var(--accent-danger);">❌ Error: ${err.message}</span>`;
      }
      btn.disabled = false;
      btn.textContent = '↻ Regenerate';
    });
  }, 50);

  return html;
}

function initD3Graph() {
  const container = document.getElementById('propagation-graph');
  if (!container) return;
  container.innerHTML = ''; // clear placeholder

  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;

  // Generate some realistic-looking dummy data for propagation
  const nodes = [{ id: 'source', group: 'authorized', radius: 12, platform: 'Official Broadcast' }];
  const links = [];

  const platforms = ['twitter', 'telegram', 'youtube', 'web'];
  const groups = ['unauthorized', 'suspicious'];

  // Add layer 1 (first sharers)
  for (let i = 0; i < 5; i++) {
    const id = `n1_${i}`;
    nodes.push({ id, group: groups[Math.floor(Math.random() * 2)], radius: 8, platform: platforms[i % 4] });
    links.push({ source: 'source', target: id, value: 2 });
    
    // Add layer 2
    const children = Math.floor(Math.random() * 6) + 1;
    for (let j = 0; j < children; j++) {
      const childId = `n2_${i}_${j}`;
      nodes.push({ id: childId, group: 'unauthorized', radius: 5, platform: platforms[Math.floor(Math.random() * 4)] });
      links.push({ source: id, target: childId, value: 1 });
    }
  }

  const getColor = (g) => {
    if (g === 'authorized') return '#22c55e'; // success
    if (g === 'unauthorized') return '#ef4444'; // danger
    return '#f59e0b'; // warning
  };

  const zoom = d3.zoom().scaleExtent([0.5, 4]).on('zoom', (e) => g.attr('transform', e.transform));
  const svg = d3.select(container).append('svg')
    .attr('width', width)
    .attr('height', height)
    .call(zoom);

  const g = svg.append('g');

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(40))
    .force('charge', d3.forceManyBody().strength(-80))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(d => d.radius + 2));

  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#475569')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', d => Math.sqrt(d.value));

  const node = g.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => getColor(d.group))
    .attr('stroke', '#0f172a')
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => {
      // Highlight selection
      node.attr('stroke', n => n.id === d.id ? '#ffffff' : '#0f172a')
          .attr('stroke-width', n => n.id === d.id ? 3 : 1.5);
          
      // Open panel
      const panel = document.getElementById('node-detail-panel');
      if (panel) {
        panel.classList.add('open');
        document.getElementById('node-platform').textContent = d.platform;
        document.getElementById('node-account').textContent = d.id;
        document.getElementById('node-type').innerHTML = `<span style="color:${getColor(d.group)}">${d.group.toUpperCase()}</span>`;
      }
    });

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    node
      .attr('cx', d => Math.max(d.radius, Math.min(width - d.radius, d.x)))
      .attr('cy', d => Math.max(d.radius, Math.min(height - d.radius, d.y)));
  });

  // Controls
  document.getElementById('graph-zoom-in')?.addEventListener('click', () => svg.transition().call(zoom.scaleBy, 1.3));
  document.getElementById('graph-zoom-out')?.addEventListener('click', () => svg.transition().call(zoom.scaleBy, 0.7));
  document.getElementById('graph-reset')?.addEventListener('click', () => {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    simulation.alpha(0.3).restart();
  });

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
}
