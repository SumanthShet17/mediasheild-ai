// ============================================================================
// perceptual-hash.js — Client-Side Perceptual Hashing (Canvas API)
// ============================================================================
// Three algorithms: aHash (average), dHash (difference), pHash (perceptual).
// All run entirely in-browser — zero API calls, zero latency concerns.
// Returns 64-bit hashes as 16-character hex strings.
// ============================================================================

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Average Hash (aHash)
 * Simplest hash: resize to 8×8 grayscale, compare each pixel to the mean.
 * Fast but sensitive to gamma/brightness changes.
 *
 * @param {string} base64 - Full data URI (data:image/...;base64,...) or raw base64
 * @returns {Promise<string>} 16-char hex hash
 */
export async function computeAHash(base64) {
  const pixels = await getGrayscalePixels(base64, 8, 8);
  const mean = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;

  let bits = '';
  for (let i = 0; i < pixels.length; i++) {
    bits += pixels[i] >= mean ? '1' : '0';
  }
  return binaryToHex(bits);
}

/**
 * Difference Hash (dHash)
 * Gradient-based: compares adjacent pixels horizontally.
 * More robust than aHash — resistant to brightness/contrast shifts.
 *
 * @param {string} base64 - Full data URI or raw base64
 * @returns {Promise<string>} 16-char hex hash
 */
export async function computeDHash(base64) {
  // 9 columns wide so we get 8 differences per row
  const pixels = await getGrayscalePixels(base64, 9, 8);

  let bits = '';
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = pixels[row * 9 + col];
      const right = pixels[row * 9 + col + 1];
      bits += left > right ? '1' : '0';
    }
  }
  return binaryToHex(bits);
}

/**
 * Perceptual Hash (pHash) — Most Robust
 * Uses DCT (Discrete Cosine Transform) to capture frequency structure.
 * Resistant to scaling, minor cropping, and compression artifacts.
 *
 * @param {string} base64 - Full data URI or raw base64
 * @returns {Promise<string>} 16-char hex hash
 */
export async function computePHash(base64) {
  const SIZE = 32;
  const pixels = await getGrayscalePixels(base64, SIZE, SIZE);

  // Apply 2D DCT
  const dctCoeffs = applyDCT2D(pixels, SIZE, SIZE);

  // Extract top-left 8×8 low-frequency block
  const lowFreq = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      lowFreq.push(dctCoeffs[y * SIZE + x]);
    }
  }

  // Mean of AC components (skip DC at index 0)
  const acComponents = lowFreq.slice(1);
  const mean = acComponents.reduce((sum, val) => sum + val, 0) / acComponents.length;

  let bits = '';
  for (let i = 0; i < lowFreq.length; i++) {
    bits += lowFreq[i] >= mean ? '1' : '0';
  }
  return binaryToHex(bits);
}

// ---------------------------------------------------------------------------
// Image Processing Helpers
// ---------------------------------------------------------------------------

/**
 * Load an image from base64 and extract grayscale pixel values via Canvas.
 *
 * @param {string} base64 - Image as data URI or raw base64
 * @param {number} width  - Target resize width
 * @param {number} height - Target resize height
 * @returns {Promise<number[]>} Array of grayscale pixel values (0–255)
 */
function getGrayscalePixels(base64, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const pixels = [];

      // Convert RGBA → grayscale using ITU-R BT.601 luminance
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        pixels.push(gray);
      }

      resolve(pixels);
    };

    img.onerror = () => reject(new Error('Failed to load image for hashing'));

    // Ensure the source is a valid data URI
    img.src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
  });
}

// ---------------------------------------------------------------------------
// DCT (Discrete Cosine Transform) — Type-II, 2D
// ---------------------------------------------------------------------------

/**
 * Apply a full 2D DCT to a flat array of pixel values.
 * This is an O(n⁴) implementation — fine for 32×32 (only 1M ops).
 *
 * @param {number[]} pixels - Flat grayscale pixel array
 * @param {number} width
 * @param {number} height
 * @returns {number[]} Flat array of DCT coefficients
 */
function applyDCT2D(pixels, width, height) {
  const result = new Array(width * height);

  for (let v = 0; v < height; v++) {
    for (let u = 0; u < width; u++) {
      let sum = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          sum +=
            pixels[y * width + x] *
            Math.cos(((2 * x + 1) * u * Math.PI) / (2 * width)) *
            Math.cos(((2 * y + 1) * v * Math.PI) / (2 * height));
        }
      }

      const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      result[v * width + u] = 0.25 * cu * cv * sum;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Bit Manipulation Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a binary string (e.g. "10110011...") to a hex string.
 * @param {string} binary - String of '0' and '1' characters
 * @returns {string} Hex string (4 bits per hex digit)
 */
function binaryToHex(binary) {
  let hex = '';
  for (let i = 0; i < binary.length; i += 4) {
    hex += parseInt(binary.substring(i, i + 4), 2).toString(16);
  }
  return hex;
}
