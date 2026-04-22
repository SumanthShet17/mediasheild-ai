// ============================================================================
// constants.js — Central Configuration Hub for MediaShield AI Engine
// ============================================================================
// All API endpoints, model names, thresholds, and feature flags live here.
// Change a value here → it changes everywhere. No hunting through files.
// ============================================================================

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
  GEMINI_FLASH: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  TEXT_EMBEDDING: 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent',
  CLOUD_VISION: 'https://vision.googleapis.com/v1/images:annotate',
};

// ---------------------------------------------------------------------------
// Model Configuration
// ---------------------------------------------------------------------------

export const MODEL_CONFIG = {
  /** Temperature: lower = more deterministic JSON output */
  TEMPERATURE: 0.1,
  /** Max tokens for standard analysis */
  MAX_TOKENS: 2048,
  /** Max tokens for longer outputs like DMCA notices */
  MAX_TOKENS_LONG: 4096,
  /** Force JSON output from Gemini */
  RESPONSE_MIME_TYPE: 'application/json',
};

// ---------------------------------------------------------------------------
// Similarity Thresholds 
// ---------------------------------------------------------------------------

export const THRESHOLDS = {
  /** Perceptual hash: above this = likely same image */
  HASH_MATCH: 0.85,
  /** Embedding cosine similarity: above this = semantically similar */
  EMBEDDING_MATCH: 0.80,
  /** Composite score: above this = flag as potential violation */
  COMPOSITE_ALERT: 0.75,
  /** Composite score: above this = critical violation */
  COMPOSITE_CRITICAL: 0.90,
};

// ---------------------------------------------------------------------------
// Composite Score Weights (must sum to 1.0)
// ---------------------------------------------------------------------------

export const SCORE_WEIGHTS = {
  HASH: 0.30,
  EMBEDDING: 0.50,
  LOGO_MATCH: 0.20,
};

// ---------------------------------------------------------------------------
// Content DNA Pipeline Steps
// ---------------------------------------------------------------------------

export const PIPELINE_STEPS = {
  HASHING: { id: 1, label: 'Computing perceptual hashes' },
  VISION: { id: 2, label: 'Analyzing with Cloud Vision' },
  GEMINI: { id: 3, label: 'Gemini AI analyzing content' },
  EMBEDDING: { id: 4, label: 'Generating content embedding' },
  SIGNING: { id: 5, label: 'Signing content credential' },
};

// ---------------------------------------------------------------------------
// Feature Flags — Toggle mock mode for demos without API keys
// ---------------------------------------------------------------------------

export const FEATURES = {
  /** Set to true to use mock data instead of real API calls */
  USE_MOCK_GEMINI: !import.meta.env.VITE_GEMINI_API_KEY,
  USE_MOCK_VISION: !import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
  /** Set to true to log all API requests/responses to console */
  DEBUG_MODE: import.meta.env.DEV,
};

// ---------------------------------------------------------------------------
// Severity Levels (used across threat classification)
// ---------------------------------------------------------------------------

export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// ---------------------------------------------------------------------------
// Content Types
// ---------------------------------------------------------------------------

export const CONTENT_TYPES = [
  'photo',
  'screenshot',
  'graphic',
  'logo',
  'broadcast_frame',
  'highlight_clip',
  'meme',
];

// ---------------------------------------------------------------------------
// Sport Types
// ---------------------------------------------------------------------------

export const SPORT_TYPES = [
  'cricket',
  'football',
  'basketball',
  'tennis',
  'baseball',
  'hockey',
  'athletics',
  'swimming',
  'boxing',
  'mma',
  'esports',
  'other',
];
