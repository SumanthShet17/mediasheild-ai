// ============================================================================
// vision.js — Google Cloud Vision API Integration
// ============================================================================
// Runs all 6 detection types in a single API call:
//   Logo detection, OCR, Labels, Web detection, Image properties, Safe search
//
// The WEB_DETECTION feature is the star — it finds pages across the internet
// that contain the same or similar images. Extremely powerful for piracy detection.
// ============================================================================

import { API_ENDPOINTS, FEATURES } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Analyze an image using all Cloud Vision detection features.
 *
 * @param {string} imageBase64 - Base64 image string (WITHOUT data URI prefix)
 * @returns {Promise<object>} Normalized detection results
 */
export async function analyzeWithVision(imageBase64) {
  return await callVisionAPI(imageBase64);
}

/**
 * Run only web detection — lighter call for quick piracy scanning.
 *
 * @param {string} imageBase64 - Base64 image string (no prefix)
 * @returns {Promise<object>} Web detection results only
 */
export async function detectWebPresence(imageBase64) {
  return await callBackend(API_ENDPOINTS.VISION_WEB, { imageBase64 });
}

// ---------------------------------------------------------------------------
// API Call
// ---------------------------------------------------------------------------

async function callVisionAPI(imageBase64) {
  if (FEATURES.DEBUG_MODE) {
    console.log('[Vision] Sending request through backend');
  }

  return await callBackend(API_ENDPOINTS.VISION_ANALYZE, { imageBase64 });
}

async function callBackend(endpoint, body) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Backend error (${response.status}): ${errorBody}`);
  }

  return await response.json();
}

// ---------------------------------------------------------------------------
// Response Normalization
// ---------------------------------------------------------------------------

/**
 * Normalize the raw Vision API response into a clean, consistent format.
 * This abstraction means the rest of the app never sees raw API shapes.
 */
function normalizeVisionResponse(result) {
  if (!result) return {};

  return {
    // Detected logos with confidence and bounding boxes
    logos: (result.logoAnnotations || []).map((logo) => ({
      name: logo.description,
      confidence: logo.score || 0,
      boundingBox: logo.boundingPoly || null,
    })),

    // All text found in the image (OCR)
    text: result.textAnnotations?.[0]?.description || '',

    // Individual text blocks with positions
    textBlocks: (result.textAnnotations || []).slice(1).map((t) => ({
      text: t.description,
      boundingBox: t.boundingPoly,
    })),

    // Detected labels (what's in the image)
    labels: (result.labelAnnotations || []).map((label) => ({
      name: label.description,
      confidence: label.score || 0,
    })),

    // Web detection results
    ...normalizeWebDetection(result.webDetection),

    // Dominant colors in the image
    dominantColors: (
      result.imagePropertiesAnnotation?.dominantColors?.colors || []
    ).map((color) => ({
      rgb: color.color || { red: 0, green: 0, blue: 0 },
      score: color.score || 0,
      pixelFraction: color.pixelFraction || 0,
    })),

    // Safe search ratings
    safeSearch: result.safeSearchAnnotation || {
      adult: 'UNKNOWN',
      violence: 'UNKNOWN',
      racy: 'UNKNOWN',
    },
  };
}

/**
 * Normalize web detection into a separate shape for reuse.
 */
function normalizeWebDetection(webDetection) {
  if (!webDetection) {
    return {
      webEntities: [],
      similarWebImages: [],
      pagesWithImage: [],
      fullMatchingImages: [],
      partialMatchingImages: [],
    };
  }

  return {
    webEntities: (webDetection.webEntities || []).map((entity) => ({
      description: entity.description || 'Unknown',
      score: entity.score || 0,
      entityId: entity.entityId || null,
    })),

    similarWebImages: (webDetection.visuallySimilarImages || []).map((img) => ({
      url: img.url,
    })),

    pagesWithImage: (webDetection.pagesWithMatchingImages || []).map((page) => ({
      url: page.url,
      title: page.pageTitle || '',
      matchCount: page.fullMatchingImages?.length || 0,
    })),

    fullMatchingImages: (webDetection.fullMatchingImages || []).map((img) => ({
      url: img.url,
    })),

    partialMatchingImages: (webDetection.partialMatchingImages || []).map((img) => ({
      url: img.url,
    })),
  };
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

function getMockVisionResult() {
  return {
    logos: [
      { name: 'BCCI', confidence: 0.94, boundingBox: null },
      { name: 'Star Sports', confidence: 0.88, boundingBox: null },
    ],
    text: '© IPL 2026 All Rights Reserved | LIVE | MI vs CSK | Star Sports',
    textBlocks: [
      { text: '© IPL 2026', boundingBox: null },
      { text: 'LIVE', boundingBox: null },
      { text: 'MI vs CSK', boundingBox: null },
    ],
    labels: [
      { name: 'Cricket', confidence: 0.97 },
      { name: 'Stadium', confidence: 0.94 },
      { name: 'Sport', confidence: 0.93 },
      { name: 'Crowd', confidence: 0.89 },
      { name: 'Night', confidence: 0.85 },
      { name: 'Broadcast', confidence: 0.82 },
    ],
    webEntities: [
      { description: 'Indian Premier League', score: 0.92, entityId: '/m/0cr3kb' },
      { description: 'Cricket', score: 0.88, entityId: '/m/09xp_' },
    ],
    similarWebImages: [
      { url: 'https://example.com/ipl-highlights.jpg' },
      { url: 'https://example.com/cricket-match-2026.jpg' },
    ],
    pagesWithImage: [
      { url: 'https://example.com/ipl-stream', title: 'IPL 2026 Live Stream', matchCount: 1 },
      { url: 'https://example.com/cricket-piracy', title: 'Free IPL Watch Online', matchCount: 1 },
    ],
    fullMatchingImages: [],
    partialMatchingImages: [],
    dominantColors: [
      { rgb: { red: 30, green: 58, blue: 138 }, score: 0.35, pixelFraction: 0.28 },
      { rgb: { red: 0, green: 128, blue: 0 }, score: 0.25, pixelFraction: 0.22 },
      { rgb: { red: 255, green: 215, blue: 0 }, score: 0.15, pixelFraction: 0.10 },
    ],
    safeSearch: {
      adult: 'VERY_UNLIKELY',
      violence: 'VERY_UNLIKELY',
      racy: 'UNLIKELY',
    },
  };
}

function getMockWebDetection() {
  return {
    webEntities: [
      { description: 'Indian Premier League', score: 0.92, entityId: '/m/0cr3kb' },
    ],
    similarWebImages: [
      { url: 'https://example.com/ipl-highlights.jpg' },
    ],
    pagesWithImage: [
      { url: 'https://example.com/ipl-stream', title: 'IPL 2026 Live Stream', matchCount: 1 },
    ],
    fullMatchingImages: [],
    partialMatchingImages: [],
  };
}
