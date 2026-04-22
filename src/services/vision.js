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
  if (FEATURES.USE_MOCK_VISION) {
    return getMockVisionResult();
  }

  try {
    return await callVisionAPI(imageBase64);
  } catch (error) {
    console.warn('[Vision] analyzeWithVision failed, using mock:', error.message);
    return getMockVisionResult();
  }
}

/**
 * Run only web detection — lighter call for quick piracy scanning.
 *
 * @param {string} imageBase64 - Base64 image string (no prefix)
 * @returns {Promise<object>} Web detection results only
 */
export async function detectWebPresence(imageBase64) {
  if (FEATURES.USE_MOCK_VISION) {
    return getMockWebDetection();
  }

  try {
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
    if (!apiKey) throw new Error('VITE_GOOGLE_CLOUD_API_KEY is not configured');

    const response = await fetch(`${API_ENDPOINTS.CLOUD_VISION}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: 'WEB_DETECTION', maxResults: 20 }],
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Vision API error (${response.status})`);
    }

    const data = await response.json();
    const result = data.responses[0];

    return normalizeWebDetection(result.webDetection);
  } catch (error) {
    console.warn('[Vision] detectWebPresence failed, using mock:', error.message);
    return getMockWebDetection();
  }
}

// ---------------------------------------------------------------------------
// API Call
// ---------------------------------------------------------------------------

async function callVisionAPI(imageBase64) {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GOOGLE_CLOUD_API_KEY is not configured');
  }

  if (FEATURES.DEBUG_MODE) {
    console.log('[Vision] Sending request with 6 feature types');
  }

  const response = await fetch(`${API_ENDPOINTS.CLOUD_VISION}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: imageBase64 },
        features: [
          { type: 'LOGO_DETECTION', maxResults: 10 },
          { type: 'TEXT_DETECTION' },
          { type: 'LABEL_DETECTION', maxResults: 20 },
          { type: 'WEB_DETECTION', maxResults: 10 },
          { type: 'IMAGE_PROPERTIES' },
          { type: 'SAFE_SEARCH_DETECTION' },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Vision API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  if (FEATURES.DEBUG_MODE) {
    console.log('[Vision] Response received');
  }

  return normalizeVisionResponse(data.responses[0]);
}

// ---------------------------------------------------------------------------
// Response Normalization
// ---------------------------------------------------------------------------

/**
 * Normalize the raw Vision API response into a clean, consistent format.
 * This abstraction means the rest of the app never sees raw API shapes.
 */
function normalizeVisionResponse(result) {
  if (!result) return getMockVisionResult();

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
