/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Hash-based SPA Router
   ═══════════════════════════════════════════════════════════ */

const routes = {};
let currentRoute = null;

/**
 * Register a route handler
 * @param {string} hash — e.g. 'dashboard'
 * @param {Function} handler — async function that returns HTML string or renders into container
 */
export function registerRoute(hash, handler) {
  routes[hash] = handler;
}

/**
 * Navigate to a hash route
 * @param {string} hash — e.g. 'dashboard'
 */
export function navigateTo(hash) {
  window.location.hash = '#' + hash;
}

/**
 * Get current route name (without #)
 */
export function getCurrentRoute() {
  return window.location.hash.replace('#', '') || 'dashboard';
}

/**
 * Initialise the router — call once on app start
 * @param {HTMLElement} container — the #page-content element
 * @param {Function} [onNavigate] — callback after page change, receives route name
 */
export function initRouter(container, onNavigate) {
  async function handleRoute() {
    const route = getCurrentRoute();
    if (route === currentRoute) return;
    currentRoute = route;

    const handler = routes[route];
    if (!handler) {
      container.innerHTML = `
        <div class="page-enter" style="text-align:center;padding:80px 0;">
          <h2 style="margin-bottom:12px;">404</h2>
          <p>Page not found</p>
        </div>`;
      return;
    }

    // Fade out old content quickly
    container.style.opacity = '0';
    container.style.transform = 'translateY(8px)';

    // Small delay for transition
    await new Promise(r => setTimeout(r, 150));

    try {
      const html = await handler();
      if (typeof html === 'string') {
        container.innerHTML = html;
      }
    } catch (err) {
      console.error(`Route error [${route}]:`, err);
      container.innerHTML = `
        <div class="page-enter" style="text-align:center;padding:80px 0;">
          <h2 style="margin-bottom:12px;">Error</h2>
          <p>Something went wrong loading this page.</p>
        </div>`;
    }

    // Fade in new content
    container.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';

    if (onNavigate) onNavigate(route);
  }

  window.addEventListener('hashchange', handleRoute);

  // Navigate to initial route
  if (!window.location.hash) {
    window.location.hash = '#dashboard';
  } else {
    handleRoute();
  }
}
