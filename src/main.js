/* ═══════════════════════════════════════════════════════════
   MediaShield AI — App Entry Point
   ═══════════════════════════════════════════════════════════ */

import './styles/index.css';
import './styles/components.css';
import './styles/animations.css';

import { registerRoute, initRouter } from './utils/router.js';
import { renderSidebar, updateActiveLink } from './components/sidebar.js';
import { renderHeader, updateBreadcrumb } from './components/header.js';

// Lazy-load page modules
import renderDashboard from './pages/dashboard.js';
import renderRegister from './pages/register.js';
import renderMonitor from './pages/monitor.js';
import renderPropagation from './pages/propagation.js';
import renderThreats from './pages/threats.js';
import renderDmca from './pages/dmca.js';

// ── Build app shell ───────────────────────────────────────
document.querySelector('#app').innerHTML = `
  <div class="floating-orbs" aria-hidden="true">
    <div class="orb"></div>
    <div class="orb"></div>
    <div class="orb"></div>
  </div>
  <div class="layout">
    <aside id="sidebar-container"></aside>
    <div class="main-area">
      <header id="header-container"></header>
      <div id="page-content"></div>
    </div>
  </div>
`;

// ── Render shell components ───────────────────────────────
renderSidebar(document.getElementById('sidebar-container'));
renderHeader(document.getElementById('header-container'));

// ── Register routes ───────────────────────────────────────
registerRoute('dashboard', renderDashboard);
registerRoute('register', renderRegister);
registerRoute('monitor', renderMonitor);
registerRoute('propagation', renderPropagation);
registerRoute('threats', renderThreats);
registerRoute('dmca', renderDmca);

// ── Initialise router ─────────────────────────────────────
const pageContent = document.getElementById('page-content');

initRouter(pageContent, (route) => {
  updateActiveLink(route);
  updateBreadcrumb(route);
});
