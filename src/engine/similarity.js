// ============================================================================
// similarity.js — Similarity Scoring Functions
// ============================================================================
// Pure math, no side effects. Compare perceptual hashes (Hamming distance),
// embedding vectors (cosine similarity), and compute weighted composites.
// ============================================================================

import { SCORE_WEIGHTS, THRESHOLDS } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Perceptual Hash Comparison
// ---------------------------------------------------------------------------

/**
 * Compare two perceptual hashes using Hamming similarity.
 * Counts the fraction of bits that are identical.
 *
 * @param {string} hash1 - Hex hash string (e.g. "a7c3e1f0b2d4e6f8")
 * @param {string} hash2 - Hex hash string (same length as hash1)
 * @returns {number} Similarity score from 0 (totally different) to 1 (identical)
 */
export function hammingSimilarity(hash1, hash2) {
  if (!hash1 || !hash2) return 0;

  const bin1 = hexToBinary(hash1);
  const bin2 = hexToBinary(hash2);

  // Handle mismatched lengths gracefully
  const len = Math.min(bin1.length, bin2.length);
  if (len === 0) return 0;

  let matchingBits = 0;
  for (let i = 0; i < len; i++) {
    if (bin1[i] === bin2[i]) matchingBits++;
  }

  return matchingBits / len;
}

/**
 * Compute raw Hamming distance (number of differing bits).
 *
 * @param {string} hash1 - Hex hash string
 * @param {string} hash2 - Hex hash string
 * @returns {number} Number of bits that differ
 */
export function hammingDistance(hash1, hash2) {
  if (!hash1 || !hash2) return Infinity;

  const bin1 = hexToBinary(hash1);
  const bin2 = hexToBinary(hash2);
  const len = Math.min(bin1.length, bin2.length);

  let distance = 0;
  for (let i = 0; i < len; i++) {
    if (bin1[i] !== bin2[i]) distance++;
  }

  return distance;
}

// ---------------------------------------------------------------------------
// Embedding Vector Comparison
// ---------------------------------------------------------------------------

/**
 * Compute cosine similarity between two embedding vectors.
 *
 * @param {Float32Array|number[]} vecA - First embedding vector
 * @param {Float32Array|number[]} vecB - Second embedding vector
 * @returns {number} Similarity from -1 (opposite) to 1 (identical)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;

  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// ---------------------------------------------------------------------------
// Composite Score
// ---------------------------------------------------------------------------

/**
 * Compute a weighted composite similarity score.
 * Uses weights from constants.js so they can be tuned in one place.
 *
 * @param {number} hashSimilarity      - Hamming similarity (0–1)
 * @param {number} embeddingSimilarity  - Cosine similarity (0–1)
 * @param {boolean} logoMatch          - Whether logos matched in Vision API
 * @returns {{ score: number, level: string }} Score (0–1) and severity level
 */
export function compositeScore(hashSimilarity, embeddingSimilarity, logoMatch = false) {
  const score =
    hashSimilarity * SCORE_WEIGHTS.HASH +
    embeddingSimilarity * SCORE_WEIGHTS.EMBEDDING +
    (logoMatch ? SCORE_WEIGHTS.LOGO_MATCH : 0);

  // Clamp to [0, 1]
  const clamped = Math.max(0, Math.min(1, score));

  // Determine severity level based on thresholds
  let level;
  if (clamped >= THRESHOLDS.COMPOSITE_CRITICAL) {
    level = 'critical';
  } else if (clamped >= THRESHOLDS.COMPOSITE_ALERT) {
    level = 'high';
  } else if (clamped >= 0.5) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return { score: clamped, level };
}

// ---------------------------------------------------------------------------
// Full Comparison Pipeline
// ---------------------------------------------------------------------------

/**
 * Run a complete similarity comparison between two Content DNA objects.
 * This is the high-level function that Member 1 will call from the UI.
 *
 * @param {object} dnaA - Content DNA of the original asset
 * @param {object} dnaB - Content DNA of the suspect asset
 * @returns {object} Detailed comparison result
 */
export function compareContentDNA(dnaA, dnaB) {
  // Compare all three hash types
  const hashScores = {
    pHash: hammingSimilarity(dnaA.hashes?.pHash, dnaB.hashes?.pHash),
    dHash: hammingSimilarity(dnaA.hashes?.dHash, dnaB.hashes?.dHash),
    aHash: hammingSimilarity(dnaA.hashes?.aHash, dnaB.hashes?.aHash),
  };

  // Average hash similarity
  const avgHashSimilarity =
    (hashScores.pHash + hashScores.dHash + hashScores.aHash) / 3;

  // Embedding similarity
  const embSimilarity = cosineSimilarity(dnaA.embedding, dnaB.embedding);

  // Logo match — check if any logos overlap
  const logosA = (dnaA.vision?.logos || []).map((l) => l.name.toLowerCase());
  const logosB = (dnaB.vision?.logos || []).map((l) => l.name.toLowerCase());
  const logoMatch = logosA.some((logo) => logosB.includes(logo));

  // Composite
  const composite = compositeScore(avgHashSimilarity, embSimilarity, logoMatch);

  return {
    hashScores,
    averageHashSimilarity: avgHashSimilarity,
    embeddingSimilarity: embSimilarity,
    logoMatch,
    matchedLogos: logosA.filter((logo) => logosB.includes(logo)),
    composite,
    isLikelyMatch: composite.score >= THRESHOLDS.COMPOSITE_ALERT,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a hex string to a binary string.
 * @param {string} hex
 * @returns {string} Binary string (4 bits per hex digit)
 */
function hexToBinary(hex) {
  return hex
    .split('')
    .map((h) => parseInt(h, 16).toString(2).padStart(4, '0'))
    .join('');
}
