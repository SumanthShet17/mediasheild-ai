# 👤 MEMBER 1 — Frontend Lead (UI + Design System + Routing)

## Your Role
You build the **entire visual experience** — the design system, page layouts, navigation, components, and routing. Your work is what judges SEE first. You make it look premium, not like a hackathon project.

**Depends on**: Nobody (you start first, others plug into your pages)
**Others depend on you**: Everyone — they inject their features into YOUR page layouts

---

## 🎯 Your Deliverables

| # | File | Purpose |
|---|---|---|
| 1 | `index.html` | Entry point with meta tags, font imports, root div |
| 2 | `package.json` | Dependencies (vite, d3 — Member 4 needs it) |
| 3 | `vite.config.js` | Vite configuration with env variable support |
| 4 | `src/main.js` | App initialization, router setup, sidebar + header render |
| 5 | `src/styles/index.css` | **Design system** — colors, typography, spacing, glass cards |
| 6 | `src/styles/components.css` | Reusable component styles |
| 7 | `src/styles/animations.css` | All micro-animations, transitions, keyframes |
| 8 | `src/utils/router.js` | Client-side SPA router (hash-based) |
| 9 | `src/components/sidebar.js` | Left navigation sidebar with 6 page links |
| 10 | `src/components/header.js` | Top bar with search, notifications bell, profile |
| 11 | `src/components/stats-card.js` | Animated counter stat cards |
| 12 | `src/components/modal.js` | Reusable modal component |
| 13 | `src/components/asset-card.js` | Card to display a registered asset |
| 14 | `src/components/threat-feed.js` | Live scrolling threat feed |
| 15 | `src/pages/dashboard.js` | Main dashboard — stats, activity feed, quick actions |
| 16 | `src/pages/register.js` | Asset upload page — drag-drop zone, progress steps, DNA display |
| 17 | `src/pages/monitor.js` | Monitoring page — scan animation, platform cards |
| 18 | `src/pages/propagation.js` | Propagation page — container for D3 graph (Member 4 fills) |
| 19 | `src/pages/threats.js` | Threats page — card grid with severity badges |
| 20 | `src/pages/dmca.js` | DMCA page — step wizard, notice preview, evidence |
| 21 | `public/favicon.svg` | App icon (shield icon) |

---

## 📐 Design System Specifications

### Colors (MUST use these exact values)
```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-tertiary: #1e293b;
  --bg-hover: #243049;

  /* Accent Colors */
  --accent-primary: #6366f1;    /* Indigo — buttons, links, active states */
  --accent-secondary: #8b5cf6;  /* Violet — AI/Gemini features */
  --accent-success: #10b981;    /* Emerald — verified, safe, authorized */
  --accent-warning: #f59e0b;    /* Amber — caution, medium threats */
  --accent-danger: #ef4444;     /* Red — critical threats, violations */
  --accent-info: #06b6d4;       /* Cyan — data, analytics, scanning */

  /* Text */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Glass */
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-hover: rgba(255, 255, 255, 0.06);

  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #6366f1, #8b5cf6);
  --gradient-danger: linear-gradient(135deg, #ef4444, #f97316);
  --gradient-success: linear-gradient(135deg, #10b981, #06b6d4);
  --gradient-mesh: radial-gradient(at 20% 80%, rgba(99,102,241,0.15) 0%, transparent 50%),
                   radial-gradient(at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 50%),
                   radial-gradient(at 50% 50%, rgba(6,182,212,0.05) 0%, transparent 50%);

  /* Spacing */
  --sidebar-width: 260px;
  --header-height: 64px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-glow-primary: 0 0 20px rgba(99,102,241,0.3);
  --shadow-glow-danger: 0 0 20px rgba(239,68,68,0.3);
}
```

### Typography
```css
/* Import in index.html: */
/* <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"> */

body { font-family: 'Inter', -apple-system, sans-serif; }

/* Heading sizes */
h1 { font-size: 2rem; font-weight: 800; }
h2 { font-size: 1.5rem; font-weight: 700; }
h3 { font-size: 1.125rem; font-weight: 600; }
```

### Glass Card Pattern (USE EVERYWHERE)
```css
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 24px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: var(--glass-hover);
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

---

## 📄 Page Layout Specifications

### Overall Layout
```
┌──────────────────────────────────────────────────────┐
│ SIDEBAR (260px)  │  HEADER (64px height)             │
│                  ├───────────────────────────────────│
│  Logo            │                                    │
│  ──────          │   PAGE CONTENT                     │
│  📊 Dashboard    │   (scrollable)                     │
│  📁 Register     │                                    │
│  🔍 Monitor      │                                    │
│  🌐 Propagation  │                                    │
│  ⚠️ Threats      │                                    │
│  📜 DMCA         │                                    │
│                  │                                    │
│  ──────          │                                    │
│  Settings        │                                    │
│  API Status      │                                    │
└──────────────────────────────────────────────────────┘
```

### Dashboard Page Layout
```
┌─────────────────────────────────────────────────┐
│ [Stats Row — 4 animated counter cards]           │
│  Total Assets | Active Monitors | Threats | Score│
├──────────────────────┬──────────────────────────│
│ Quick Actions (3     │ Recent Activity Feed      │
│ gradient cards):     │ (scrolling list of        │
│ • Register Asset     │  recent events with       │
│ • Run Scan           │  timestamps)              │
│ • View Threats       │                           │
├──────────────────────┴──────────────────────────│
│ [Mini Map Preview]   │ [Threat Severity Chart]   │
│ (placeholder div     │ (placeholder div          │
│  for Member 4)       │  for Member 4)            │
└─────────────────────────────────────────────────┘
```

### Register Page Layout
```
┌─────────────────────────────────────────────────┐
│ Page Title: "Register Digital Asset"             │
├─────────────────────────────────────────────────│
│ ┌─────────────────────────────────────────────┐ │
│ │  DRAG & DROP ZONE                           │ │
│ │  (dashed border, upload icon, hover glow)   │ │
│ │  "Drop your image here or click to browse"  │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────│
│ [Image Preview]        │ [Metadata Form]        │
│  (shows uploaded       │  Title:  [________]    │
│   image)               │  Org:    [________]    │
│                        │  Sport:  [dropdown]    │
│                        │  License:[dropdown]    │
├─────────────────────────────────────────────────│
│ CONTENT DNA PIPELINE (progress steps)           │
│ [1.Hash] → [2.Vision] → [3.Gemini] → [4.Sign] │
│                                                  │
│ Results panel (populated by Member 2):           │
│ • Perceptual hashes                              │
│ • Detected logos                                 │
│ • AI description                                 │
│ • Content credential                             │
├─────────────────────────────────────────────────│
│              [Register Asset Button]             │
└─────────────────────────────────────────────────┘
```

### Monitor Page Layout
```
┌─────────────────────────────────────────────────┐
│ "Real-Time Monitoring"  [▶ Start Scan] button    │
├──────────────────────┬──────────────────────────│
│ PLATFORM CARDS (grid)│ LIVE DETECTION FEED       │
│ ┌──────┐ ┌──────┐   │ (scrolling list of        │
│ │ X/   │ │ YT   │   │  detected matches with    │
│ │Twit. │ │      │   │  similarity %, platform,   │
│ │ 🟢   │ │ 🔄   │   │  and severity badge)       │
│ └──────┘ └──────┘   │                           │
│ ┌──────┐ ┌──────┐   │                           │
│ │ IG   │ │ TG   │   │                           │
│ │      │ │      │   │                           │
│ │ ⏳   │ │ 🟢   │   │                           │
│ └──────┘ └──────┘   │                           │
│ (+ TikTok, FB,      │                           │
│  Reddit, Web)        │                           │
├──────────────────────┴──────────────────────────│
│ [Scan Animation Area — particle/wave effect]     │
│ (placeholder div for Member 4's animation)       │
└─────────────────────────────────────────────────┘
```

### Threats Page Layout
```
┌─────────────────────────────────────────────────┐
│ "Threat Assessment"    [Filter: severity ▼]      │
├─────────────────────────────────────────────────│
│ THREAT CARDS (grid, 2 columns):                  │
│ ┌──────────────────────────────────────────────┐│
│ │ 🔴 CRITICAL  "Betting site using IPL logo"   ││
│ │ Platform: suspicious-bets.com                ││
│ │ Similarity: 94%  │  Intent: Commercial       ││
│ │ [View Details] [Generate DMCA]               ││
│ └──────────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────────┐│
│ │ 🟡 MEDIUM  "Fan account shared highlight"    ││
│ │ Platform: Twitter/X                          ││
│ │ Similarity: 78%  │  Intent: Fan sharing      ││
│ │ [View Details] [Monitor]                     ││
│ └──────────────────────────────────────────────┘│
│ ... more cards                                   │
├─────────────────────────────────────────────────│
│ DETAIL PANEL (opens on "View Details"):          │
│ [Original Image] ←→ [Suspect Image]             │
│ Gemini Analysis: {...}  (populated by Member 2)  │
│ Similarity Breakdown: hash/visual/semantic bars  │
└─────────────────────────────────────────────────┘
```

### DMCA Page Layout
```
┌─────────────────────────────────────────────────┐
│ "DMCA Takedown Workflow"                         │
├─────────────────────────────────────────────────│
│ STEP WIZARD: [1.Select] → [2.Evidence] →        │
│              [3.Generate] → [4.Send]             │
├─────────────────────────────────────────────────│
│ Step 1: Select violation from threats list       │
│ Step 2: Review evidence (images, scores, hashes) │
│ Step 3: Gemini generates DMCA letter (Member 2)  │
│ Step 4: Copy/export notice + track status        │
├─────────────────────────────────────────────────│
│ ┌──────────────────────────────────────────────┐│
│ │ DMCA NOTICE PREVIEW (styled like a legal doc)││
│ │ "Dear [Platform],                            ││
│ │  I am writing to report unauthorized use..." ││
│ └──────────────────────────────────────────────┘│
│ [Copy to Clipboard]  [Download PDF]  [Mark Sent] │
└─────────────────────────────────────────────────┘
```

### Propagation Page Layout
```
┌─────────────────────────────────────────────────┐
│ "Content Propagation Network"                    │
├─────────────────────────────────────────────────│
│ [Full-width D3.js force graph container]         │
│ (this div is where Member 4 renders the graph)   │
│ ID: #propagation-graph                           │
│ Height: calc(100vh - header - padding)           │
│                                                  │
│ LEGEND (overlay, bottom-left):                   │
│ 🟢 Authorized  🔴 Unauthorized  🟡 Suspicious   │
│                                                  │
│ CONTROLS (overlay, top-right):                   │
│ [Zoom +] [Zoom -] [Reset] [Time Slider]         │
├─────────────────────────────────────────────────│
│ NODE DETAIL PANEL (slide-in from right on click):│
│ Platform: Twitter │ Account: @pirate_sports     │
│ Violations: 12   │ First seen: 2 hours ago      │
│ [View Threats] [Block Account]                   │
└─────────────────────────────────────────────────┘
```

---

## ⚡ Animations You Must Implement

```css
/* 1. Page transitions */
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 2. Stat counter animation — count up from 0 */
/* Use requestAnimationFrame in stats-card.js */

/* 3. Card hover lift */
.glass-card:hover { transform: translateY(-4px); }

/* 4. Sidebar active indicator — sliding pill */
.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  width: 3px;
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 0 4px 4px 0;
}

/* 5. Notification badge pulse */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 6. Upload zone drag-over glow */
.drop-zone.drag-over {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-glow-primary);
}

/* 7. Progress step connector animation */
@keyframes progressFill {
  from { width: 0%; }
  to { width: 100%; }
}

/* 8. Severity badge shimmer for critical */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

/* 9. Floating gradient orbs in the background */
@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(30px, -50px) rotate(120deg); }
  66% { transform: translate(-20px, 20px) rotate(240deg); }
}
```

---

## 🔌 Integration Points (How Others Connect)

### Member 2 (AI Engineer) plugs into:
- `register.js` → calls their `content-dna.js` when user uploads image
- `threats.js` → calls their `gemini.js` for threat analysis display
- `dmca.js` → calls their `gemini.js` for DMCA letter generation

### Member 3 (Cloud Engineer) plugs into:
- Your pages call their `storage.js` to save/load assets
- Your pages call their `bigquery.js` to log events
- They give you a deployed Cloud Run URL

### Member 4 (Visualization) plugs into:
- `dashboard.js` → they render mini chart and mini map in your placeholder divs
- `propagation.js` → they render the full D3 graph in `#propagation-graph`
- `monitor.js` → they render scan animation in your placeholder div
- `dashboard.js` → they render threat chart in your placeholder div

### How to expose hooks:
```javascript
// In each page, export a function that returns placeholder container IDs
// Example in dashboard.js:
export function getDashboardContainers() {
  return {
    miniMap: '#dashboard-mini-map',
    threatChart: '#dashboard-threat-chart',
    activityFeed: '#dashboard-activity-feed'
  };
}
```

---

## ✅ Checklist

- [ ] Set up project: `npm create vite@latest ./ -- --template vanilla` then `npm install`
- [ ] Create full design system in `index.css`
- [ ] Build SPA router with hash-based navigation
- [ ] Build sidebar component with all 6 nav links + active state
- [ ] Build header component with search bar + notification bell
- [ ] Build stats-card component with animated counter
- [ ] Build glass-card component with hover effects
- [ ] Build modal component
- [ ] Build all 6 page layouts with placeholder divs for team members
- [ ] Build drag-and-drop upload zone on Register page
- [ ] Build step wizard on DMCA page
- [ ] Build threat card component with severity badges
- [ ] Add all micro-animations (at least 8 different animations)
- [ ] Add gradient mesh background to body
- [ ] Add floating gradient orbs animation
- [ ] Test navigation between all pages
- [ ] Test responsive layout (min-width: 1024px is fine for hackathon)
- [ ] Verify color contrast accessibility (text on dark backgrounds)
- [ ] Add ARIA labels to all interactive elements

---

## 🚀 Start Command

```bash
cd C:\Users\shrey\OneDrive\Desktop\GoogleSolution\mediashield-ai
npm create vite@latest ./ -- --template vanilla
npm install
npm install d3
npm run dev
```

**Timeline**: You should have the full skeleton with navigation working within **3-4 hours**. Then iterate on polish.
