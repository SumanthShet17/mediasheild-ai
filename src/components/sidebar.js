/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Sidebar Component
   ═══════════════════════════════════════════════════════════ */

import { navigateTo, getCurrentRoute } from '../utils/router.js';

const navItems = [
  { id: 'dashboard',   icon: '📊', label: 'Dashboard' },
  { id: 'register',    icon: '📁', label: 'Register Asset' },
  { id: 'monitor',     icon: '🔍', label: 'Monitor' },
  { id: 'propagation', icon: '🌐', label: 'Propagation' },
  { id: 'threats',     icon: '⚠️', label: 'Threats' },
  { id: 'dmca',        icon: '📜', label: 'DMCA' },
];

/**
 * Render sidebar into the given container element
 */
export function renderSidebar(container) {
  container.innerHTML = `
    <nav class="sidebar" role="navigation" aria-label="Main navigation">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon" aria-hidden="true">🛡️</div>
        <span class="sidebar-logo-text">MediaShield AI</span>
      </div>

      <div class="sidebar-nav">
        <div class="nav-section-label">Navigation</div>
        ${navItems.map(item => `
          <a href="#${item.id}"
             class="nav-link"
             data-route="${item.id}"
             id="nav-${item.id}"
             aria-label="${item.label}">
            <span class="nav-link-icon" aria-hidden="true">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>

      <div class="sidebar-footer">
        <div class="nav-link" id="nav-settings" aria-label="Settings" style="cursor:pointer;">
          <span class="nav-link-icon" aria-hidden="true">⚙️</span>
          <span>Settings</span>
        </div>
        <div class="api-status">
          <span class="api-dot" aria-hidden="true"></span>
          <span>API Connected</span>
        </div>
      </div>
    </nav>
  `;

  // Highlight active link
  updateActiveLink(getCurrentRoute());

  // Listen for clicks (event delegation)
  container.addEventListener('click', (e) => {
    const link = e.target.closest('.nav-link[data-route]');
    if (link) {
      e.preventDefault();
      navigateTo(link.dataset.route);
    }
  });
}

/**
 * Update which nav link has the active state
 */
export function updateActiveLink(route) {
  document.querySelectorAll('.nav-link[data-route]').forEach(link => {
    link.classList.toggle('active', link.dataset.route === route);
  });
}
