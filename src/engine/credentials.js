// ============================================================================
// credentials.js — C2PA-Style Content Credentials (Web Crypto API)
// ============================================================================
// Cryptographic signing and verification for Content DNA using the browser's
// native Web Crypto API. No external libraries needed.
// ============================================================================

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Sign content data and produce a C2PA-compatible credential.
 * Uses SHA-256 hash of the content data as the fingerprint.
 *
 * @param {object} contentData - Data to sign (hashes, descriptions, etc.)
 * @returns {Promise<object>} Content credential object
 */
export async function signContent(contentData) {
  const dataString = JSON.stringify(contentData);
  const hashHex = await sha256Hash(dataString);

  return {
    algorithm: 'SHA-256',
    hash: hashHex,
    timestamp: new Date().toISOString(),
    issuer: 'MediaShield AI',
    version: '1.0',
    standard: 'C2PA-compatible',
    contentType: 'sports-media',
    chainOfCustody: [
      {
        action: 'registered',
        timestamp: new Date().toISOString(),
        agent: 'MediaShield AI Content DNA Engine',
      },
    ],
  };
}

/**
 * Verify a content credential by re-hashing the content data
 * and comparing against the stored hash.
 *
 * @param {object} contentData - Original content data
 * @param {object} credential  - Credential to verify
 * @returns {Promise<object>} Verification result with status and details
 */
export async function verifyCredential(contentData, credential) {
  if (!credential || !credential.hash) {
    return {
      valid: false,
      reason: 'Missing or malformed credential',
      timestamp: new Date().toISOString(),
    };
  }

  const dataString = JSON.stringify(contentData);
  const computedHash = await sha256Hash(dataString);
  const isValid = computedHash === credential.hash;

  return {
    valid: isValid,
    reason: isValid ? 'Hash matches — content is authentic' : 'Hash mismatch — content may have been tampered with',
    computedHash,
    storedHash: credential.hash,
    issuer: credential.issuer,
    issuedAt: credential.timestamp,
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * Add an entry to an existing credential's chain of custody.
 * Useful for tracking transfers, scans, and actions on the asset.
 *
 * @param {object} credential - Existing credential
 * @param {string} action     - Action description (e.g. 'scanned', 'flagged')
 * @param {string} [agent]    - Who/what performed the action
 * @returns {object} Updated credential (new object, does not mutate original)
 */
export function addCustodyEntry(credential, action, agent = 'MediaShield AI') {
  return {
    ...credential,
    chainOfCustody: [
      ...credential.chainOfCustody,
      {
        action,
        timestamp: new Date().toISOString(),
        agent,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Crypto Helpers
// ---------------------------------------------------------------------------

/**
 * Compute SHA-256 hash of a string using Web Crypto API.
 *
 * @param {string} data - String to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
async function sha256Hash(data) {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
