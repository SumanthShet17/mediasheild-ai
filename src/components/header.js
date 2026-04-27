/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Header Component
   ═══════════════════════════════════════════════════════════ */

const pageTitles = {
  dashboard: 'Dashboard',
  register: 'Register Asset',
  monitor: 'Monitor',
  propagation: 'Propagation',
  threats: 'Threats',
  dmca: 'DMCA',
};

/**
 * Render header into the given container element
 */
export function renderHeader(container) {
  container.innerHTML = `
    <div class="header" role="banner">
      <div class="header-left">
        <div class="header-breadcrumb" id="header-breadcrumb">
          MediaShield &nbsp;/&nbsp; <span>Dashboard</span>
        </div>
        <div class="header-search" role="search">
          <span class="header-search-icon" aria-hidden="true">🔎</span>
          <input type="text"
                 placeholder="Search assets, threats, reports..."
                 id="header-search-input"
                 aria-label="Search" />
        </div>
      </div>

      <div class="header-right">
        <button class="notification-btn" id="notification-btn" aria-label="Notifications">
          🔔
          <span class="notification-badge" id="notification-count">3</span>
        </button>
        <div class="header-profile" id="header-profile" aria-label="User profile">
          S
        </div>
      </div>
    </div>
  `;
}

/**
 * Update breadcrumb to show current page name
 */
export function updateBreadcrumb(route) {
  const el = document.getElementById('header-breadcrumb');
  if (el) {
    const title = pageTitles[route] || route;
    el.innerHTML = `MediaShield &nbsp;/&nbsp; <span>${title}</span>`;
  }
}
