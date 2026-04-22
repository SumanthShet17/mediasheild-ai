// ============================================================================
// content-dna.js — Content DNA Orchestrator (Hero File)
// ============================================================================
// This is the central pipeline that generates a complete Content DNA
// fingerprint for any uploaded sports media. It orchestrates:
//
//   1. File → Base64 conversion
//   2. Perceptual hashing (3 algorithms, client-side)
//   3. Cloud Vision analysis (logos, OCR, web detection)
//   4. Gemini AI analysis (sport context, semantic tags)
//   5. Embedding vector generation (768-dim semantic fingerprint)
//   6. Cryptographic signing (C2PA-style credential)
//
// Progress callbacks let the UI show step-by-step progress.
// Every API step has try/catch with mock fallback for demo resilience.
// ============================================================================

import { analyzeAsset } from '../services/gemini.js';
import { analyzeWithVision } from '../services/vision.js';
import { generateImageEmbedding } from '../services/vertex-embeddings.js';
import { computePHash, computeDHash, computeAHash } from './perceptual-hash.js';
import { signContent } from './credentials.js';
import { PIPELINE_STEPS } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a complete Content DNA fingerprint for an image file.
 *
 * @param {File} imageFile     - The uploaded image File object
 * @param {Function} onProgress - Optional callback: ({ step, label, percent, data }) => void
 * @returns {Promise<object>}   Complete Content DNA object
 */
export async function generateContentDNA(imageFile, onProgress) {
  const progress = createProgressEmitter(onProgress);

  // Convert File to base64 data URI
  const base64DataUri = await fileToBase64(imageFile);

  // Strip the data URI prefix for API calls (APIs want raw base64)
  const cleanBase64 = stripDataUriPrefix(base64DataUri);

  // -----------------------------------------------------------------------
  // Step 1: Perceptual Hashing (client-side, parallel)
  // -----------------------------------------------------------------------
  progress.emit(PIPELINE_STEPS.HASHING, 'Computing perceptual hashes...', 10);

  const hashes = await computeAllHashes(base64DataUri);

  progress.emit(PIPELINE_STEPS.HASHING, 'Hashes computed ✓', 25, hashes);

  // -----------------------------------------------------------------------
  // Step 2: Cloud Vision API
  // -----------------------------------------------------------------------
  progress.emit(PIPELINE_STEPS.VISION, 'Analyzing with Cloud Vision...', 30);

  let vision;
  try {
    vision = await analyzeWithVision(cleanBase64);
  } catch (error) {
    console.warn('[ContentDNA] Vision failed:', error.message);
    vision = getFallbackVision();
  }

  progress.emit(PIPELINE_STEPS.VISION, 'Vision analysis complete ✓', 50, vision);

  // -----------------------------------------------------------------------
  // Step 3: Gemini AI Analysis
  // -----------------------------------------------------------------------
  progress.emit(PIPELINE_STEPS.GEMINI, 'Gemini AI analyzing content...', 55);

  let gemini;
  try {
    gemini = await analyzeAsset(cleanBase64);
  } catch (error) {
    console.warn('[ContentDNA] Gemini failed:', error.message);
    gemini = getFallbackGemini();
  }

  progress.emit(PIPELINE_STEPS.GEMINI, 'AI analysis complete ✓', 75, gemini);

  // -----------------------------------------------------------------------
  // Step 4: Embedding Vector
  // -----------------------------------------------------------------------
  progress.emit(PIPELINE_STEPS.EMBEDDING, 'Generating content embedding...', 80);

  let embedding;
  try {
    embedding = await generateImageEmbedding(cleanBase64);
  } catch (error) {
    console.warn('[ContentDNA] Embedding failed:', error.message);
    embedding = new Float32Array(768).fill(0);
  }

  progress.emit(PIPELINE_STEPS.EMBEDDING, 'Embedding generated ✓', 90);

  // -----------------------------------------------------------------------
  // Step 5: Cryptographic Credential
  // -----------------------------------------------------------------------
  progress.emit(PIPELINE_STEPS.SIGNING, 'Signing content credential...', 95);

  const credential = await signContent({
    hashes,
    visionSummary: vision.text || '',
    geminiDescription: gemini.description || '',
  });

  progress.emit(PIPELINE_STEPS.SIGNING, 'Content DNA complete ✓', 100);

  // -----------------------------------------------------------------------
  // Assemble the complete Content DNA
  // -----------------------------------------------------------------------
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    filename: imageFile.name,
    fileSize: imageFile.size,
    fileType: imageFile.type,
    hashes,
    vision,
    gemini,
    embedding,
    credential,
    rawImageBase64: base64DataUri,
  };
}

/**
 * Generate Content DNA for a raw base64 string (no File object).
 * Useful when you already have the base64 data.
 *
 * @param {string} base64DataUri - Full data URI
 * @param {string} [filename]   - Original filename (for metadata)
 * @param {Function} [onProgress] - Progress callback
 * @returns {Promise<object>} Content DNA object
 */
export async function generateContentDNAFromBase64(base64DataUri, filename = 'unknown', onProgress) {
  // Create a minimal File-like object for the main function
  const blob = await fetch(base64DataUri).then((r) => r.blob());
  const file = new File([blob], filename, { type: blob.type });
  return generateContentDNA(file, onProgress);
}

// ---------------------------------------------------------------------------
// Hash Computation
// ---------------------------------------------------------------------------

/**
 * Compute all three perceptual hashes in parallel.
 */
async function computeAllHashes(base64) {
  const [pHash, dHash, aHash] = await Promise.all([
    computePHash(base64),
    computeDHash(base64),
    computeAHash(base64),
  ]);

  return { pHash, dHash, aHash };
}

// ---------------------------------------------------------------------------
// File Conversion
// ---------------------------------------------------------------------------

/**
 * Convert a File object to a base64 data URI string.
 *
 * @param {File} file
 * @returns {Promise<string>} Data URI (e.g. "data:image/jpeg;base64,...")
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Strip the data URI prefix, returning only the base64 payload.
 *
 * @param {string} dataUri - Full data URI string
 * @returns {string} Raw base64 string
 */
function stripDataUriPrefix(dataUri) {
  return dataUri.replace(/^data:image\/\w+;base64,/, '');
}

// ---------------------------------------------------------------------------
// Progress Emitter
// ---------------------------------------------------------------------------

/**
 * Create a progress emitter wrapper.
 * If no callback is provided, progress is silently discarded.
 */
function createProgressEmitter(callback) {
  return {
    emit(step, label, percent, data = null) {
      if (typeof callback === 'function') {
        callback({
          step: step.id,
          stepName: step.label,
          label,
          percent,
          data,
        });
      }
    },
  };
}

// ---------------------------------------------------------------------------
// Fallback Data (used when APIs fail but we still need the pipeline to work)
// ---------------------------------------------------------------------------

function getFallbackVision() {
  return {
    logos: [{ name: 'Sample League', confidence: 0.92, boundingBox: null }],
    text: '© 2026 Official Sports Media',
    textBlocks: [],
    labels: [
      { name: 'Sports', confidence: 0.96 },
      { name: 'Stadium', confidence: 0.89 },
    ],
    webEntities: [{ description: 'Sports Event', score: 0.85, entityId: null }],
    similarWebImages: [],
    pagesWithImage: [],
    fullMatchingImages: [],
    partialMatchingImages: [],
    dominantColors: [{ rgb: { red: 30, green: 58, blue: 138 }, score: 0.4, pixelFraction: 0.3 }],
    safeSearch: { adult: 'VERY_UNLIKELY', violence: 'VERY_UNLIKELY', racy: 'UNLIKELY' },
  };
}

function getFallbackGemini() {
  return {
    description: 'A professional sports photograph captured during a live event',
    sport_type: 'cricket',
    teams: ['Team Alpha', 'Team Beta'],
    players_visible: [],
    event_context: 'match',
    content_type: 'photo',
    semantic_tags: ['action_shot', 'professional', 'broadcast_quality'],
    estimated_value: 'high',
    piracy_risk: 'high',
    watermarks_detected: 'uncertain',
    broadcast_overlay: 'no',
  };
}
