/* ═══════════════════════════════════════════════════════════
   MediaShield AI — Dashboard Page
   ═══════════════════════════════════════════════════════════ */

import { createStatsCard, initCounters } from '../components/stats-card.js';
import { renderThreatFeed } from '../components/threat-feed.js';
import { navigateTo } from '../utils/router.js';

export function getDashboardContainers() {
  return {
    miniMap: '#dashboard-mini-map',
    threatChart: '#dashboard-threat-chart',
    activityFeed: '#dashboard-activity-feed',
  };
}

const recentActivity = [
  { dot: 'var(--accent-success)', text: '<strong>IPL Logo Pack</strong> registered successfully', time: '2 min ago' },
  { dot: 'var(--accent-danger)',  text: '<strong>Critical threat</strong> detected on betting site', time: '5 min ago' },
  { dot: 'var(--accent-info)',    text: 'Scan completed for <strong>YouTube</strong> platform', time: '12 min ago' },
  { dot: 'var(--accent-warning)', text: 'DMCA notice sent to <strong>pirate-streams.tv</strong>', time: '18 min ago' },
  { dot: 'var(--accent-primary)', text: 'New content DNA generated for <strong>Match Highlights</strong>', time: '25 min ago' },
  { dot: 'var(--accent-success)', text: 'Asset <strong>Team Jersey Design</strong> verified', time: '31 min ago' },
];

export default function renderDashboard() {
  const html = `
    <div class="page-enter">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Overview of your media protection status</p>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-4 gap-lg" style="margin-bottom:28px;">
        ${createStatsCard({ icon: '📦', label: 'Total Assets', value: 247, trend: '12%', trendDir: 'up', color: '#6366f1' })}
        ${createStatsCard({ icon: '📡', label: 'Active Monitors', value: 18, trend: '3', trendDir: 'up', color: '#06b6d4' })}
        ${createStatsCard({ icon: '🚨', label: 'Threats Found', value: 34, trend: '8%', trendDir: 'up', color: '#ef4444' })}
        ${createStatsCard({ icon: '🛡️', label: 'Protection Score', value: 9.2, trend: '0.4', trendDir: 'up', color: '#10b981', suffix: '/10' })}
      </div>

      <!-- Quick Actions + Activity Feed -->
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px;">
        <!-- Quick Actions -->
        <div>
          <h3 style="margin-bottom:16px;">Quick Actions</h3>
          <div class="flex flex-col gap-md">
            <div class="quick-action hover-lift" style="background:var(--gradient-primary);" id="qa-register" role="button" aria-label="Register new asset">
              <span class="quick-action-icon">📁</span>
              <span class="quick-action-title">Register New Asset</span>
              <span class="quick-action-desc">Upload and protect your digital content</span>
            </div>
            <div class="quick-action hover-lift" style="background:linear-gradient(135deg,#06b6d4,#0ea5e9);" id="qa-scan" role="button" aria-label="Run scan">
              <span class="quick-action-icon">🔍</span>
              <span class="quick-action-title">Run Platform Scan</span>
              <span class="quick-action-desc">Detect unauthorized usage across platforms</span>
            </div>
            <div class="quick-action hover-lift" style="background:var(--gradient-danger);" id="qa-threats" role="button" aria-label="View threats">
              <span class="quick-action-icon">⚠️</span>
              <span class="quick-action-title">View Active Threats</span>
              <span class="quick-action-desc">Review and respond to detected violations</span>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass-card" style="padding:20px;">
          <h3 style="margin-bottom:16px;">Recent Activity</h3>
          <div class="activity-feed" id="dashboard-activity-feed">
            ${recentActivity.map(a => `
              <div class="activity-item">
                <span class="activity-dot" style="background:${a.dot}"></span>
                <span class="activity-text">${a.text}</span>
                <span class="activity-time">${a.time}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Bottom Row: Placeholders for Member 4 -->
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:24px;">
        <div class="glass-card" style="min-height:250px;">
          <h3 style="margin-bottom:16px;">Propagation Map</h3>
          <div id="dashboard-mini-map" style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;">
            <p class="text-muted" style="font-size:0.85rem;">🌐 Map visualization loads here</p>
          </div>
        </div>
        <div class="glass-card" style="min-height:250px;">
          <h3 style="margin-bottom:16px;">Threat Severity Distribution</h3>
          <div id="dashboard-threat-chart" style="width:100%;height:200px;display:flex;align-items:center;justify-content:center;">
            <p class="text-muted" style="font-size:0.85rem;">📊 Chart visualization loads here</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // After render, init counters and quick action clicks
  setTimeout(() => {
    initCounters();
    document.getElementById('qa-register')?.addEventListener('click', () => navigateTo('register'));
    document.getElementById('qa-scan')?.addEventListener('click', () => navigateTo('monitor'));
    document.getElementById('qa-threats')?.addEventListener('click', () => navigateTo('threats'));
  }, 50);

  return html;
}
