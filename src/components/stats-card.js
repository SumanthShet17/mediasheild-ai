/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Stats Card Component
   ═══════════════════════════════════════════════════════════ */

/**
 * Animate a counter from 0 to target
 */
function animateCounter(element, target, duration = 1200) {
  const start = performance.now();
  const isFloat = target % 1 !== 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    if (isFloat) {
      element.textContent = current.toFixed(1);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = isFloat ? target.toFixed(1) : target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

/**
 * Create a stats card element
 * @param {Object} config
 * @param {string} config.icon — emoji icon
 * @param {string} config.label — card label
 * @param {number} config.value — numeric value to count to
 * @param {string} config.trend — e.g. '+12%' or '-3%'
 * @param {string} config.trendDir — 'up' or 'down'
 * @param {string} config.color — CSS color for the icon background
 * @param {string} [config.suffix] — suffix like '%' or '/10'
 * @returns {string} HTML string
 */
export function createStatsCard({ icon, label, value, trend, trendDir, color, suffix = '' }) {
  const id = 'stat-' + label.toLowerCase().replace(/\s+/g, '-');
  return `
    <div class="stat-card" id="${id}">
      <div class="stat-card-header">
        <div class="stat-card-icon" style="background:${color}20;color:${color}">
          ${icon}
        </div>
        <div class="stat-card-trend ${trendDir}">
          ${trendDir === 'up' ? '↑' : '↓'} ${trend}
        </div>
      </div>
      <div class="stat-card-value" data-target="${value}" data-suffix="${suffix}">0${suffix}</div>
      <div class="stat-card-label">${label}</div>
    </div>
  `;
}

/**
 * Initialise counters — call after cards are in the DOM
 */
export function initCounters() {
  document.querySelectorAll('.stat-card-value[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    animateCounter(el, target);
    // Re-add suffix after animation completes
    setTimeout(() => {
      const isFloat = target % 1 !== 0;
      el.textContent = (isFloat ? target.toFixed(1) : target.toLocaleString()) + suffix;
    }, 1300);
  });
}
