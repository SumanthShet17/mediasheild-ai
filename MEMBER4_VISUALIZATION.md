# 👤 MEMBER 4 — Data Visualization & Maps Engineer

## Your Role
You build the **visual storytelling layer** — the D3.js propagation network graph, Google Maps geographic heatmap, animated charts, scan animations, and all data visualizations. Your work is the **WOW factor** that makes judges stop and stare.

**Depends on**: Member 1 (page containers to render into), Member 3 (mock data to visualize)
**Others depend on you**: Nobody directly — you enhance everyone's pages

---

## 🎯 Your Deliverables

| # | File | Purpose |
|---|---|---|
| 1 | `src/components/geo-map.js` | Google Maps heatmap + marker visualization |
| 2 | `src/components/propagation-graph.js` | D3.js force-directed network graph |
| 3 | `src/components/threat-chart.js` | Animated donut/bar charts for threat stats |
| 4 | `src/components/scan-animation.js` | Particle/wave animation for monitoring page |
| 5 | `src/components/activity-feed.js` | Auto-scrolling live activity feed |
| 6 | `src/components/similarity-bar.js` | Animated similarity score comparison bar |
| 7 | `src/services/maps.js` | Google Maps JavaScript API initialization |
| 8 | Add Maps script to `index.html` | Load the Maps library |

---

## 🗺️ 1. Google Maps Heatmap — `src/services/maps.js` + `src/components/geo-map.js`

### Setup: Add to `index.html` (tell Member 1)
```html
<!-- Add before closing </body> tag -->
<script>
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries","places,visualization");e.set("callback",c+".maps."+q);a.src=`https://maps.googleapis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once."):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})();
</script>
```

### `src/services/maps.js`
```javascript
/**
 * Google Maps initialization and configuration
 */

let mapInstance = null;
let heatmapLayer = null;
let markers = [];

/**
 * Initialize the map in a container element
 */
export async function initMap(containerId, options = {}) {
  const apiKey = import.meta.env.VITE_MAPS_API_KEY;
  
  // Load the maps and visualization libraries
  const { Map } = await google.maps.importLibrary("maps");
  const { HeatmapLayer } = await google.maps.importLibrary("visualization");
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Map container #${containerId} not found`);
    return null;
  }

  mapInstance = new Map(container, {
    zoom: options.zoom || 2,
    center: options.center || { lat: 20, lng: 10 },
    mapId: 'mediashield-dark',  // Use a dark-styled map
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: getDarkMapStyles()  // Custom dark theme
  });
  
  return mapInstance;
}

/**
 * Add heatmap layer showing violation concentration
 */
export async function addHeatmap(violationData) {
  if (!mapInstance) return;
  
  const { HeatmapLayer } = await google.maps.importLibrary("visualization");
  
  // Convert violation data to LatLng weighted points
  const heatmapData = violationData
    .filter(v => v.location && v.location.lat && v.location.lng)
    .map(v => ({
      location: new google.maps.LatLng(v.location.lat, v.location.lng),
      weight: getWeight(v.severity)
    }));
  
  // Remove existing heatmap
  if (heatmapLayer) heatmapLayer.setMap(null);
  
  heatmapLayer = new HeatmapLayer({
    data: heatmapData,
    map: mapInstance,
    radius: 40,
    opacity: 0.7,
    gradient: [
      'rgba(0, 0, 0, 0)',
      'rgba(6, 182, 212, 0.4)',     // Cyan (low)
      'rgba(99, 102, 241, 0.6)',    // Indigo
      'rgba(245, 158, 11, 0.8)',    // Amber (medium)
      'rgba(239, 68, 68, 0.9)',     // Red (high)
      'rgba(239, 68, 68, 1)'       // Red (critical)
    ]
  });
}

/**
 * Add individual markers for violations
 */
export async function addMarkers(violationData) {
  if (!mapInstance) return;
  
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  
  // Clear existing markers
  markers.forEach(m => m.map = null);
  markers = [];
  
  for (const v of violationData) {
    if (!v.location?.lat) continue;
    
    // Create custom marker element
    const markerEl = document.createElement('div');
    markerEl.className = 'map-marker';
    markerEl.innerHTML = getSeverityIcon(v.severity);
    markerEl.style.cssText = `
      width: 32px; height: 32px; 
      border-radius: 50%; 
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; cursor: pointer;
      background: ${getSeverityColor(v.severity)};
      border: 2px solid rgba(255,255,255,0.3);
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      transition: transform 0.2s;
    `;
    markerEl.addEventListener('mouseenter', () => markerEl.style.transform = 'scale(1.3)');
    markerEl.addEventListener('mouseleave', () => markerEl.style.transform = 'scale(1)');
    
    try {
      const marker = new AdvancedMarkerElement({
        position: { lat: v.location.lat, lng: v.location.lng },
        map: mapInstance,
        content: markerEl,
        title: `${v.severity.toUpperCase()}: ${v.platform}`
      });
      
      // Info window on click
      marker.addListener('click', () => {
        showInfoWindow(mapInstance, marker, v);
      });
      
      markers.push(marker);
    } catch (e) {
      // Fallback: use basic marker
      const marker = new google.maps.Marker({
        position: { lat: v.location.lat, lng: v.location.lng },
        map: mapInstance,
        title: `${v.severity.toUpperCase()}: ${v.platform}`
      });
      markers.push(marker);
    }
  }
}

function showInfoWindow(map, marker, violation) {
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="color:#111; padding:8px; max-width:250px;">
        <h4 style="margin:0 0 4px; color:${getSeverityColor(violation.severity)}">
          ${violation.severity.toUpperCase()} — ${violation.platform}
        </h4>
        <p style="margin:4px 0; font-size:13px;">${violation.assetName || 'Sports Media Asset'}</p>
        <p style="margin:4px 0; font-size:12px; color:#666;">
          Similarity: <strong>${violation.similarity}%</strong><br>
          Type: ${violation.modificationType}<br>
          Intent: ${violation.commercialIntent}<br>
          Country: ${violation.location?.country || 'Unknown'}
        </p>
      </div>
    `
  });
  infoWindow.open({ anchor: marker, map });
}

function getWeight(severity) {
  const weights = { critical: 10, high: 7, medium: 4, low: 1 };
  return weights[severity] || 1;
}

function getSeverityColor(severity) {
  const colors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#06b6d4' };
  return colors[severity] || '#6366f1';
}

function getSeverityIcon(severity) {
  const icons = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };
  return icons[severity] || '⚪';
}

/**
 * Dark mode map styles
 */
function getDarkMapStyles() {
  return [
    { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#8892b0" }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e1e30" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d2d44" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a2e" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e0e1a" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] }
  ];
}
```

---

## 🌐 2. D3.js Propagation Network Graph — `src/components/propagation-graph.js`

This is **THE hero feature**. Build it to be stunning.

```javascript
import * as d3 from 'd3';

/**
 * Render an interactive force-directed network graph
 * showing how stolen content spreads across platforms.
 * 
 * @param {string} containerId - DOM element ID to render into
 * @param {object} data - { nodes: [...], links: [...] } from mock-propagation.js
 */
export function renderPropagationGraph(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear previous
  container.innerHTML = '';
  
  const width = container.clientWidth;
  const height = container.clientHeight || 600;
  
  // Create SVG
  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height]);
  
  // Add zoom behavior
  const g = svg.append('g');
  svg.call(d3.zoom()
    .scaleExtent([0.3, 4])
    .on('zoom', (event) => g.attr('transform', event.transform))
  );

  // Gradient definitions for links
  const defs = svg.append('defs');
  
  // Glow filter
  const filter = defs.append('filter').attr('id', 'glow');
  filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
  const merge = filter.append('feMerge');
  merge.append('feMergeNode').attr('in', 'coloredBlur');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');
  
  // Arrow marker for directed edges
  defs.append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'rgba(255,255,255,0.3)');

  // Create force simulation
  const simulation = d3.forceSimulation(data.nodes)
    .force('link', d3.forceLink(data.links)
      .id(d => d.id)
      .distance(d => 100 + (d.weight || 1) * 20)
    )
    .force('charge', d3.forceManyBody()
      .strength(-300)
    )
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => (d.size || 10) + 10))
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05));

  // Draw links (edges)
  const link = g.append('g')
    .selectAll('line')
    .data(data.links)
    .join('line')
    .attr('stroke', d => getLinkColor(d))
    .attr('stroke-width', d => (d.weight || 1) * 0.8)
    .attr('stroke-opacity', 0.4)
    .attr('marker-end', 'url(#arrowhead)')
    .style('transition', 'stroke-opacity 0.3s');

  // Draw link animated particles (content flowing)
  const particles = g.append('g')
    .selectAll('circle')
    .data(data.links)
    .join('circle')
    .attr('r', 2)
    .attr('fill', '#6366f1')
    .attr('opacity', 0.8)
    .style('filter', 'url(#glow)');
  
  // Animate particles along links
  function animateParticles() {
    particles
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attrTween('cx', function(d) {
        return function(t) {
          return d.source.x + (d.target.x - d.source.x) * t;
        };
      })
      .attrTween('cy', function(d) {
        return function(t) {
          return d.source.y + (d.target.y - d.source.y) * t;
        };
      })
      .on('end', animateParticles);
  }
  animateParticles();

  // Draw nodes
  const node = g.append('g')
    .selectAll('g')
    .data(data.nodes)
    .join('g')
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded)
    )
    .style('cursor', 'pointer');

  // Node circles with glow
  node.append('circle')
    .attr('r', d => d.size || 10)
    .attr('fill', d => d.color || '#6366f1')
    .attr('stroke', d => d.type === 'source' ? '#fff' : 'rgba(255,255,255,0.2)')
    .attr('stroke-width', d => d.type === 'source' ? 3 : 1)
    .attr('opacity', 0.9)
    .style('filter', d => d.type === 'unauthorized' ? 'url(#glow)' : 'none')
    .on('mouseenter', function(event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr('r', (d.size || 10) * 1.3)
        .attr('stroke-width', 3)
        .attr('stroke', '#fff');
      showTooltip(event, d);
      // Highlight connected edges
      link.attr('stroke-opacity', l =>
        (l.source.id === d.id || l.target.id === d.id) ? 0.9 : 0.1
      );
    })
    .on('mouseleave', function(event, d) {
      d3.select(this)
        .transition().duration(200)
        .attr('r', d.size || 10)
        .attr('stroke-width', d.type === 'source' ? 3 : 1)
        .attr('stroke', d.type === 'source' ? '#fff' : 'rgba(255,255,255,0.2)');
      hideTooltip();
      link.attr('stroke-opacity', 0.4);
    })
    .on('click', function(event, d) {
      showNodeDetail(d);
    });

  // Node platform icons
  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('font-size', d => Math.max(8, (d.size || 10) * 0.6))
    .text(d => getPlatformEmoji(d.platform))
    .style('pointer-events', 'none');

  // Node labels
  node.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', d => (d.size || 10) + 14)
    .attr('font-size', '10px')
    .attr('fill', '#94a3b8')
    .attr('font-family', 'Inter, sans-serif')
    .text(d => d.label)
    .style('pointer-events', 'none');

  // Pulse animation for source node
  node.filter(d => d.type === 'source')
    .append('circle')
    .attr('r', d => d.size || 10)
    .attr('fill', 'none')
    .attr('stroke', '#10b981')
    .attr('stroke-width', 2)
    .attr('opacity', 0.6)
    .each(function pulse() {
      d3.select(this)
        .transition().duration(2000)
        .attr('r', d => (d.size || 10) * 2)
        .attr('opacity', 0)
        .transition().duration(0)
        .attr('r', d => d.size || 10)
        .attr('opacity', 0.6)
        .on('end', pulse);
    });

  // Update positions on simulation tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // Drag functions
  function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Add legend
  renderLegend(svg, width, height);
  
  return { simulation, svg };
}

// ── Helper Functions ──

function getLinkColor(link) {
  if (typeof link.source === 'object') {
    if (link.source.type === 'unauthorized' || link.target.type === 'unauthorized') return '#ef4444';
    if (link.source.type === 'suspicious' || link.target.type === 'suspicious') return '#f59e0b';
  }
  return 'rgba(99, 102, 241, 0.5)';
}

function getPlatformEmoji(platform) {
  const emojis = {
    'Official': '🏆',
    'YouTube': '▶️',
    'Twitter/X': '🐦',
    'Instagram': '📸',
    'Telegram': '📱',
    'TikTok': '🎵',
    'Facebook': '📘',
    'Reddit': '🔴',
    'Web': '🌐'
  };
  return emojis[platform] || '📄';
}

// Tooltip
let tooltip = null;

function showTooltip(event, d) {
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'graph-tooltip';
    tooltip.style.cssText = `
      position: fixed; z-index: 1000; padding: 12px 16px;
      background: rgba(17, 24, 39, 0.95); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px; color: #f1f5f9; font-size: 13px; font-family: Inter;
      pointer-events: none; backdrop-filter: blur(8px); max-width: 250px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(tooltip);
  }
  
  const statusColors = { source: '#10b981', authorized: '#10b981', suspicious: '#f59e0b', unauthorized: '#ef4444' };
  
  tooltip.innerHTML = `
    <div style="font-weight:600; margin-bottom:4px; color:${statusColors[d.type] || '#fff'}">
      ${d.label}
    </div>
    <div style="color:#94a3b8;">
      Platform: ${d.platform}<br>
      Status: <span style="color:${statusColors[d.type]}">${d.type.toUpperCase()}</span>
    </div>
  `;
  tooltip.style.display = 'block';
  tooltip.style.left = (event.clientX + 15) + 'px';
  tooltip.style.top = (event.clientY - 10) + 'px';
}

function hideTooltip() {
  if (tooltip) tooltip.style.display = 'none';
}

function showNodeDetail(d) {
  // Dispatch a custom event that Member 1's page can listen for
  const event = new CustomEvent('node-selected', { detail: d });
  document.dispatchEvent(event);
}

function renderLegend(svg, width, height) {
  const legend = svg.append('g')
    .attr('transform', `translate(20, ${height - 100})`);

  const items = [
    { color: '#10b981', label: 'Authorized' },
    { color: '#f59e0b', label: 'Suspicious' },
    { color: '#ef4444', label: 'Unauthorized' }
  ];

  // Legend background
  legend.append('rect')
    .attr('x', -10).attr('y', -10)
    .attr('width', 150).attr('height', items.length * 25 + 20)
    .attr('fill', 'rgba(17,24,39,0.8)')
    .attr('rx', 8)
    .attr('stroke', 'rgba(255,255,255,0.1)');

  items.forEach((item, i) => {
    const g = legend.append('g').attr('transform', `translate(0, ${i * 25})`);
    g.append('circle').attr('r', 6).attr('fill', item.color);
    g.append('text')
      .attr('x', 16).attr('dy', '0.35em')
      .attr('fill', '#94a3b8').attr('font-size', '12px').attr('font-family', 'Inter')
      .text(item.label);
  });
}
```

---

## 📊 3. Charts — `src/components/threat-chart.js`

```javascript
/**
 * Animated donut chart showing threat severity distribution.
 * Pure SVG — no additional library needed.
 */

export function renderThreatDonut(containerId, stats) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const data = [
    { label: 'Critical', value: stats?.critical || 3, color: '#ef4444' },
    { label: 'High', value: stats?.high || 5, color: '#f97316' },
    { label: 'Medium', value: stats?.medium || 8, color: '#f59e0b' },
    { label: 'Low', value: stats?.low || 12, color: '#06b6d4' }
  ];
  
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 200;
  const radius = 80;
  const innerRadius = 50;
  
  let cumulativeAngle = 0;
  
  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
  
  // Center text
  svg += `
    <text x="${size/2}" y="${size/2 - 8}" text-anchor="middle" 
          fill="#f1f5f9" font-size="28" font-weight="800" font-family="Inter">${total}</text>
    <text x="${size/2}" y="${size/2 + 14}" text-anchor="middle" 
          fill="#94a3b8" font-size="11" font-family="Inter">Threats</text>
  `;
  
  // Donut segments
  data.forEach((d, i) => {
    const angle = (d.value / total) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    
    const x1 = size/2 + radius * Math.sin(startAngle);
    const y1 = size/2 - radius * Math.cos(startAngle);
    const x2 = size/2 + radius * Math.sin(endAngle);
    const y2 = size/2 - radius * Math.cos(endAngle);
    
    const ix1 = size/2 + innerRadius * Math.sin(startAngle);
    const iy1 = size/2 - innerRadius * Math.cos(startAngle);
    const ix2 = size/2 + innerRadius * Math.sin(endAngle);
    const iy2 = size/2 - innerRadius * Math.cos(endAngle);
    
    const largeArc = angle > Math.PI ? 1 : 0;
    
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} 
                  L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    
    svg += `<path d="${path}" fill="${d.color}" opacity="0.85" 
              style="animation: donutSlice 0.8s ease-out ${i * 0.15}s both;">
              <title>${d.label}: ${d.value}</title>
            </path>`;
    
    cumulativeAngle = endAngle;
  });
  
  svg += '</svg>';
  
  // Legend
  let legend = '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;">';
  data.forEach(d => {
    legend += `
      <div style="display:flex;align-items:center;gap:6px;">
        <span style="width:10px;height:10px;border-radius:50%;background:${d.color};display:inline-block;"></span>
        <span style="color:#94a3b8;font-size:12px;font-family:Inter;">${d.label} (${d.value})</span>
      </div>
    `;
  });
  legend += '</div>';
  
  container.innerHTML = svg + legend;
}

/**
 * Animated horizontal bar chart for platform violations
 */
export function renderPlatformBars(containerId, platformData) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const platforms = platformData || [
    { name: 'Telegram', count: 15, icon: '📱' },
    { name: 'Twitter/X', count: 12, icon: '🐦' },
    { name: 'Web', count: 9, icon: '🌐' },
    { name: 'YouTube', count: 8, icon: '▶️' },
    { name: 'Instagram', count: 5, icon: '📸' },
    { name: 'TikTok', count: 3, icon: '🎵' }
  ];
  
  const max = Math.max(...platforms.map(p => p.count));
  
  let html = '';
  platforms.forEach((p, i) => {
    const pct = (p.count / max) * 100;
    html += `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
        <span style="font-size:16px;width:24px;">${p.icon}</span>
        <span style="color:#94a3b8;font-size:12px;width:70px;font-family:Inter;">${p.name}</span>
        <div style="flex:1;height:8px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:var(--gradient-primary);border-radius:4px;
               animation:barGrow 1s ease-out ${i * 0.1}s both;"></div>
        </div>
        <span style="color:#f1f5f9;font-size:13px;font-weight:600;width:24px;text-align:right;font-family:Inter;">${p.count}</span>
      </div>
    `;
  });
  
  container.innerHTML = html;
}
```

---

## ✨ 4. Scan Animation — `src/components/scan-animation.js`

```javascript
/**
 * Radar/pulse scan animation for the monitoring page.
 * Uses Canvas API for smooth 60fps animation.
 */

export function renderScanAnimation(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const canvas = document.createElement('canvas');
  canvas.width = container.clientWidth || 400;
  canvas.height = 300;
  canvas.style.width = '100%';
  canvas.style.borderRadius = '12px';
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let angle = 0;
  let particles = [];
  let isRunning = true;
  
  // Generate particles
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      color: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)]
    });
  }
  
  function draw() {
    if (!isRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background gradient
    const bgGrad = ctx.createRadialGradient(
      canvas.width/2, canvas.height/2, 0,
      canvas.width/2, canvas.height/2, Math.max(canvas.width, canvas.height)/2
    );
    bgGrad.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
    bgGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 20;
    
    // Radar circles
    for (let r = maxRadius; r > 0; r -= maxRadius / 4) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Cross lines
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.stroke();
    
    // Sweeping radar beam
    const sweepGrad = ctx.createConicGradient(angle, cx, cy);
    sweepGrad.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    sweepGrad.addColorStop(0.1, 'rgba(99, 102, 241, 0)');
    sweepGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
    
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, maxRadius, angle, angle + 0.8);
    ctx.closePath();
    ctx.fillStyle = sweepGrad;
    ctx.fill();
    
    // Radar sweep line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + maxRadius * Math.cos(angle), cy + maxRadius * Math.sin(angle));
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#6366f1';
    ctx.fill();
    
    // Floating particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
      
      // Move particles
      p.y -= p.speed;
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
    });
    
    // Detection blips (random flashes on the radar)
    if (Math.random() < 0.02) {
      const blipAngle = Math.random() * Math.PI * 2;
      const blipRadius = Math.random() * maxRadius * 0.8;
      const bx = cx + blipRadius * Math.cos(blipAngle);
      const by = cy + blipRadius * Math.sin(blipAngle);
      
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? '#ef4444' : '#f59e0b';
      ctx.fill();
      
      // Blip ring
      ctx.beginPath();
      ctx.arc(bx, by, 12, 0, Math.PI * 2);
      ctx.strokeStyle = Math.random() > 0.5 ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    angle += 0.02;
    requestAnimationFrame(draw);
  }
  
  draw();
  
  // Return cleanup function
  return () => { isRunning = false; };
}
```

---

## 📏 5. Similarity Bar — `src/components/similarity-bar.js`

```javascript
/**
 * Animated similarity score breakdown bar
 * Shows hash / visual / semantic similarity as stacked bars
 */
export function renderSimilarityBar(containerId, scores) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const bars = [
    { label: 'Hash Match', value: scores?.hash || 85, color: '#6366f1', icon: '#️⃣' },
    { label: 'Visual Similarity', value: scores?.visual || 92, color: '#8b5cf6', icon: '👁️' },
    { label: 'Semantic Match', value: scores?.semantic || 78, color: '#06b6d4', icon: '🧠' }
  ];
  
  const composite = Math.round(bars.reduce((sum, b) => sum + b.value, 0) / bars.length);
  
  let html = `
    <div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">
        <span style="color:#f1f5f9;font-weight:600;font-size:14px;font-family:Inter;">Composite Score</span>
        <span style="color:${getScoreColor(composite)};font-weight:800;font-size:24px;font-family:Inter;">${composite}%</span>
      </div>
      <div style="height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${composite}%;background:${getScoreColor(composite)};border-radius:3px;
             animation:barGrow 1.5s ease-out both;"></div>
      </div>
    </div>
  `;
  
  bars.forEach((bar, i) => {
    html += `
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
          <span style="color:#94a3b8;font-size:12px;font-family:Inter;">${bar.icon} ${bar.label}</span>
          <span style="color:#f1f5f9;font-weight:600;font-size:13px;font-family:Inter;">${bar.value}%</span>
        </div>
        <div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;">
          <div style="height:100%;width:${bar.value}%;background:${bar.color};border-radius:2px;
               animation:barGrow 1s ease-out ${0.2 + i * 0.15}s both;"></div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function getScoreColor(score) {
  if (score >= 85) return '#ef4444';
  if (score >= 70) return '#f59e0b';
  if (score >= 50) return '#06b6d4';
  return '#10b981';
}
```

---

## 🖌️ CSS Animations to Add

Tell **Member 1** to include these in `animations.css`:

```css
@keyframes donutSlice {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 0.85; transform: scale(1); }
}

@keyframes barGrow {
  from { width: 0%; }
  to { /* inherits target width from inline style */ }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 5px rgba(99,102,241,0.3); }
  50% { box-shadow: 0 0 20px rgba(99,102,241,0.6); }
}
```

---

## 🔌 Integration with Member 1's Pages

### Dashboard page — Member 1 provides these container divs:
```javascript
import { renderThreatDonut, renderPlatformBars } from '../components/threat-chart.js';
import { initMap, addHeatmap, addMarkers } from '../services/maps.js';
import { mockDetections } from '../data/mock-detections.js';

// Render mini threat chart
renderThreatDonut('dashboard-threat-chart', { critical: 3, high: 5, medium: 8, low: 12 });

// Render mini map
const miniMap = await initMap('dashboard-mini-map', { zoom: 2 });
addHeatmap(mockDetections);

// Render platform bars
renderPlatformBars('dashboard-platform-bars', null);
```

### Propagation page — Member 1 provides `#propagation-graph`:
```javascript
import { renderPropagationGraph } from '../components/propagation-graph.js';
import { propagationData } from '../data/mock-propagation.js';

renderPropagationGraph('propagation-graph', propagationData);
```

### Monitor page — Member 1 provides `#scan-animation`:
```javascript
import { renderScanAnimation } from '../components/scan-animation.js';

const cleanup = renderScanAnimation('scan-animation');
// Call cleanup() when leaving the page
```

### Threats page — Member 1 provides similarity containers:
```javascript
import { renderSimilarityBar } from '../components/similarity-bar.js';

renderSimilarityBar('similarity-breakdown', { hash: 85, visual: 92, semantic: 78 });
```

---

## ✅ Checklist

- [ ] Get a Maps JavaScript API key from Member 3
- [ ] Implement `maps.js` — dark theme map, heatmap layer, custom markers, info windows
- [ ] Test map renders correctly with mock violation data
- [ ] Implement `propagation-graph.js` — force-directed graph with D3.js
- [ ] Add node drag, zoom, hover tooltips, connection highlighting
- [ ] Add animated particles flowing along edges
- [ ] Add pulsing source node
- [ ] Add legend overlay
- [ ] Implement `threat-chart.js` — donut chart + platform bar chart
- [ ] Implement `scan-animation.js` — radar sweep animation with Canvas
- [ ] Implement `similarity-bar.js` — animated comparison bars
- [ ] Add required CSS animations to Member 1's `animations.css`
- [ ] Test all visualizations render in their respective page containers
- [ ] Test propagation graph interactivity (drag, zoom, click, hover)
- [ ] Test map markers and heatmap with mock detection data
- [ ] Verify animations are smooth (60fps target)

**Timeline**: D3 graph is the hardest — spend **3 hours** on it. Maps + charts + scan animation take **2 hours total**.
