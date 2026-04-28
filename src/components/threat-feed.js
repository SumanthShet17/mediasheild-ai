/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Threat Feed Component
   ═══════════════════════════════════════════════════════════ */

const sampleEvents = [
  { severity: 'critical', text: 'Unauthorized IPL logo on betting site', platform: 'Web', time: '2 min ago' },
  { severity: 'high',     text: 'Match highlight redistributed', platform: 'YouTube', time: '5 min ago' },
  { severity: 'medium',   text: 'Fan account shared branded content', platform: 'Twitter/X', time: '12 min ago' },
  { severity: 'low',      text: 'Thumbnail reuse detected', platform: 'Instagram', time: '18 min ago' },
  { severity: 'critical', text: 'Live stream rebroadcast detected', platform: 'Telegram', time: '25 min ago' },
  { severity: 'medium',   text: 'Logo variant found in meme', platform: 'Reddit', time: '31 min ago' },
  { severity: 'high',     text: 'Merchandise using protected imagery', platform: 'Web', time: '45 min ago' },
  { severity: 'low',      text: 'Low-res copy shared in group', platform: 'Facebook', time: '1 hr ago' },
];

const severityColors = {
  critical: 'var(--accent-danger)',
  high: '#f97316',
  medium: 'var(--accent-warning)',
  low: 'var(--accent-success)',
};

/**
 * Render a live threat feed into a container
 * @param {string} containerId
 * @param {number} [maxItems=6]
 */
export function renderThreatFeed(containerId, maxItems = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = sampleEvents.slice(0, maxItems);
  container.innerHTML = `
    <div class="activity-feed" id="${containerId}-feed">
      ${items.map(e => `
        <div class="activity-item">
          <span class="activity-dot" style="background:${severityColors[e.severity]}"></span>
          <span class="activity-text">
            <strong>${e.platform}</strong> — ${e.text}
          </span>
          <span class="activity-time">${e.time}</span>
        </div>
      `).join('')}
    </div>
  `;
}
