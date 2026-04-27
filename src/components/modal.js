/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Modal Component
   ═══════════════════════════════════════════════════════════ */

let currentModal = null;

/**
 * Show a modal dialog
 * @param {Object} config
 * @param {string} config.title
 * @param {string} config.body — HTML content
 * @param {Array}  [config.actions] — [{label, class, onClick}]
 */
export function showModal({ title, body, actions = [] }) {
  closeModal(); // close any existing

  const actionsHtml = actions.map((a, i) =>
    `<button class="btn ${a.class || 'btn-secondary'}" id="modal-action-${i}">${a.label}</button>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', title);
  overlay.innerHTML = `
    <div class="modal-container">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" id="modal-close-btn" aria-label="Close modal">✕</button>
      </div>
      <div class="modal-body">${body}</div>
      ${actionsHtml ? `<div class="modal-footer">${actionsHtml}</div>` : ''}
    </div>
  `;

  document.body.appendChild(overlay);
  currentModal = overlay;

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close button
  overlay.querySelector('#modal-close-btn').addEventListener('click', closeModal);

  // Action buttons
  actions.forEach((a, i) => {
    const btn = overlay.querySelector(`#modal-action-${i}`);
    if (btn && a.onClick) {
      btn.addEventListener('click', () => {
        a.onClick();
        if (a.closeAfter !== false) closeModal();
      });
    }
  });

  // Close on Escape
  document.addEventListener('keydown', handleEscape);
}

function handleEscape(e) {
  if (e.key === 'Escape') closeModal();
}

/**
 * Close the currently open modal
 */
export function closeModal() {
  if (currentModal) {
    currentModal.remove();
    currentModal = null;
    document.removeEventListener('keydown', handleEscape);
  }
}
