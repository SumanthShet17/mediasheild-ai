/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Asset Card Component
   ═══════════════════════════════════════════════════════════ */

/**
 * Create an asset card element
 * @param {Object} asset
 * @param {string} asset.id
 * @param {string} asset.title
 * @param {string} asset.organization
 * @param {string} asset.type — e.g. 'Image', 'Video'
 * @param {string} asset.status — 'protected' | 'monitoring' | 'pending'
 * @param {string} asset.date — registration date
 * @param {string} [asset.dnaSnippet] — fingerprint excerpt
 * @returns {string}
 */
export function createAssetCard(asset) {
  const statusMap = {
    protected:  { class: 'badge-success', label: 'Protected' },
    monitoring: { class: 'badge-info',    label: 'Monitoring' },
    pending:    { class: 'badge-medium',  label: 'Pending' },
  };
  const status = statusMap[asset.status] || statusMap.pending;

  return `
    <div class="glass-card asset-card" id="asset-${asset.id}" data-asset-id="${asset.id}">
      <div class="flex items-center justify-between" style="margin-bottom:12px;">
        <div>
          <div style="font-weight:600;font-size:0.95rem;margin-bottom:2px;">${asset.title}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);">${asset.organization}</div>
        </div>
        <span class="badge ${status.class}">${status.label}</span>
      </div>
      <div style="display:flex;gap:16px;font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px;">
        <span>📄 ${asset.type}</span>
        <span>📅 ${asset.date}</span>
      </div>
      ${asset.dnaSnippet ? `
        <div style="font-family:monospace;font-size:0.7rem;color:var(--text-muted);
                    background:var(--bg-primary);padding:8px 12px;border-radius:var(--radius-sm);
                    overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          🧬 ${asset.dnaSnippet}
        </div>
      ` : ''}
    </div>
  `;
}
