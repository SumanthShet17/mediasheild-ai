// ============================================================================
// vertex-embeddings.js — Vertex AI Multimodal Embeddings (via Gemini)
// ============================================================================
// Generates 768-dimensional embedding vectors for images.
//
// PROTOTYPE APPROACH:
//   1. Use Gemini to generate a rich text description of the image
//   2. Embed that text using text-embedding-004
//   Result: A semantic vector that represents visual content
//
// PRODUCTION NOTE:
//   In production, use Vertex AI's native `multimodalembedding` model
//   for direct image → vector conversion (faster, more accurate).
//   The prototype approach still demonstrates the full pipeline.
// ============================================================================

import { API_ENDPOINTS, FEATURES } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a semantic embedding vector for an image.
 *
 * @param {string} imageBase64 - Base64 image string (WITHOUT data URI prefix)
 * @returns {Promise<Float32Array>} Embedding vector (768 dimensions)
 */
export async function generateImageEmbedding(imageBase64) {
  if (FEATURES.USE_MOCK_GEMINI) {
    return generateMockEmbedding(imageBase64);
  }

  try {
    // Step 1: Get a rich description of the image from Gemini
    const description = await describeImageForEmbedding(imageBase64);

    // Step 2: Embed the description into a vector
    const embedding = await embedText(description);

    return embedding;
  } catch (error) {
    console.warn('[Embeddings] generateImageEmbedding failed, using mock:', error.message);
    return generateMockEmbedding(imageBase64);
  }
}

/**
 * Generate an embedding for a text string directly.
 * Useful for searching/querying against image embeddings.
 *
 * @param {string} text - Text to embed
 * @returns {Promise<Float32Array>} Embedding vector
 */
export async function generateTextEmbedding(text) {
  if (FEATURES.USE_MOCK_GEMINI) {
    return generateMockEmbedding(text);
  }

  try {
    return await embedText(text);
  } catch (error) {
    console.warn('[Embeddings] generateTextEmbedding failed, using mock:', error.message);
    return generateMockEmbedding(text);
  }
}

// ---------------------------------------------------------------------------
// Internal: Image Description
// ---------------------------------------------------------------------------

const DESCRIPTION_PROMPT = `Describe this sports media image in extreme detail for content fingerprinting purposes. Include every observable element:

- Visual composition: layout, framing, angle, focal point
- Colors: dominant palette, gradients, lighting conditions
- People: jerseys, numbers, positions, actions, expressions
- Text/Graphics: any visible text, logos, overlays, watermarks, scoreboards
- Environment: stadium, field, crowd, time of day, weather
- Equipment: cameras, broadcast equipment, sports gear
- Quality: resolution indicators, compression artifacts, screenshot evidence

Be as specific and detailed as possible. Output ONLY the description text, no formatting or headers.`;

/**
 * Use Gemini to generate a rich text description of an image.
 * This description is then embedded to create the semantic vector.
 */
async function describeImageForEmbedding(imageBase64) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not configured');

  const response = await fetch(`${API_ENDPOINTS.GEMINI}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: DESCRIPTION_PROMPT },
          { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error (${response.status})`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('Empty description from Gemini');

  if (FEATURES.DEBUG_MODE) {
    console.log('[Embeddings] Image description:', text.substring(0, 150) + '...');
  }

  return text;
}

// ---------------------------------------------------------------------------
// Internal: Text Embedding
// ---------------------------------------------------------------------------

/**
 * Embed a text string using the text-embedding-004 model.
 *
 * @param {string} text - Text to embed
 * @returns {Promise<Float32Array>} 768-dimensional vector
 */
async function embedText(text) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_API_KEY not configured');

  const response = await fetch(`${API_ENDPOINTS.TEXT_EMBEDDING}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: {
        parts: [{ text }],
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Embedding API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const values = data?.embedding?.values;

  if (!values || values.length === 0) {
    throw new Error('Empty embedding response');
  }

  if (FEATURES.DEBUG_MODE) {
    console.log(`[Embeddings] Generated ${values.length}-dim vector`);
  }

  return new Float32Array(values);
}

// ---------------------------------------------------------------------------
// Mock Embedding Generator
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic mock embedding from input data.
 * Uses a simple hash-based seeding so the same input always
 * produces the same vector — important for consistent demos.
 *
 * @param {string} input - Any string to seed the mock vector
 * @returns {Float32Array} 768-dimensional vector
 */
function generateMockEmbedding(input) {
  const inputStr = typeof input === 'string' ? input : 'default';

  // Simple string hash for seeding
  let seed = 0;
  for (let i = 0; i < Math.min(inputStr.length, 100); i++) {
    seed = ((seed << 5) - seed + inputStr.charCodeAt(i)) | 0;
  }

  // Generate deterministic pseudo-random values
  const vector = new Float32Array(768);
  for (let i = 0; i < 768; i++) {
    // LCG pseudo-random with seed
    seed = (seed * 1664525 + 1013904223) | 0;
    // Normalize to [-1, 1]
    vector[i] = (seed / 2147483647) * 0.1;
  }

  // Normalize to unit length
  let norm = 0;
  for (let i = 0; i < vector.length; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}
