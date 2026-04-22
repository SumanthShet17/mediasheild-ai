// ============================================================================
// gemini.js — Gemini 1.5 Pro / 2.0 Flash API Integration
// ============================================================================
// All Gemini AI calls go through this module. Four exported functions:
//   1. analyzeAsset()         — Analyze uploaded sports media
//   2. classifyThreat()       — Compare original vs suspect image
//   3. generateDMCA()         — Generate DMCA takedown notice
//   4. summarizePropagation() — Summarize content spread patterns
//
// Each function has a dedicated prompt, structured JSON output, and a
// mock fallback for demo mode.
// ============================================================================

import { API_ENDPOINTS, MODEL_CONFIG, FEATURES } from '../utils/constants.js';

// ---------------------------------------------------------------------------
// Core API Caller
// ---------------------------------------------------------------------------

/**
 * Make a request to the Gemini API.
 * Handles image parts, JSON response parsing, and error wrapping.
 *
 * @param {string} prompt            - Text prompt
 * @param {string[]} imageBase64Array - Array of base64 strings (WITHOUT data URI prefix)
 * @param {object} [options]         - Override generation config
 * @returns {Promise<object|string>} Parsed JSON or raw text response
 */
async function callGemini(prompt, imageBase64Array = [], options = {}) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GEMINI_API_KEY is not configured');
  }

  // Build the parts array: text first, then images
  const parts = [{ text: prompt }];

  for (const imgBase64 of imageBase64Array) {
    parts.push({
      inline_data: {
        mime_type: 'image/jpeg',
        data: imgBase64,
      },
    });
  }

  const endpoint = options.useFlash
    ? API_ENDPOINTS.GEMINI_FLASH
    : API_ENDPOINTS.GEMINI;

  const generationConfig = {
    temperature: options.temperature ?? MODEL_CONFIG.TEMPERATURE,
    maxOutputTokens: options.maxTokens ?? MODEL_CONFIG.MAX_TOKENS,
  };

  // Only add responseMimeType if we want JSON output
  if (options.responseType !== 'text') {
    generationConfig.responseMimeType = MODEL_CONFIG.RESPONSE_MIME_TYPE;
  }

  if (FEATURES.DEBUG_MODE) {
    console.log('[Gemini] Request:', { endpoint, promptLength: prompt.length, imageCount: imageBase64Array.length });
  }

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  // Extract the text from the response
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }

  if (FEATURES.DEBUG_MODE) {
    console.log('[Gemini] Response:', text.substring(0, 200));
  }

  // Parse as JSON if expected, otherwise return raw text
  if (options.responseType === 'text') {
    return text;
  }

  try {
    return JSON.parse(text);
  } catch {
    // Sometimes Gemini wraps JSON in markdown code blocks
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  }
}

// ---------------------------------------------------------------------------
// 1. Analyze Asset
// ---------------------------------------------------------------------------

const ANALYZE_PROMPT = `You are a sports media forensic analyst. Analyze this image and return a JSON object with these exact keys:
{
  "description": "detailed description of the image",
  "sport_type": "cricket|football|basketball|tennis|baseball|hockey|athletics|swimming|boxing|mma|esports|other",
  "teams": ["Team A", "Team B"],
  "players_visible": ["Player Name"],
  "event_context": "match|training|ceremony|press|celebration|other",
  "content_type": "photo|screenshot|graphic|logo|broadcast_frame|highlight_clip|meme",
  "semantic_tags": ["tag1", "tag2"],
  "estimated_value": "high|medium|low",
  "piracy_risk": "high|medium|low",
  "watermarks_detected": "yes|no|uncertain",
  "broadcast_overlay": "yes|no"
}
Be specific about teams, players, and context. If unsure, provide best estimates.`;

/**
 * Analyze an uploaded sports media asset using Gemini.
 *
 * @param {string} imageBase64 - Base64 image string (WITHOUT data URI prefix)
 * @returns {Promise<object>} Structured analysis result
 */
export async function analyzeAsset(imageBase64) {
  if (FEATURES.USE_MOCK_GEMINI) {
    return getMockAnalysis();
  }

  try {
    return await callGemini(ANALYZE_PROMPT, [imageBase64]);
  } catch (error) {
    console.warn('[Gemini] analyzeAsset failed, using mock:', error.message);
    return getMockAnalysis();
  }
}

// ---------------------------------------------------------------------------
// 2. Classify Threat
// ---------------------------------------------------------------------------

const THREAT_PROMPT = `You are a digital rights forensic analyst. Compare IMAGE 1 (original, copyrighted) with IMAGE 2 (suspected unauthorized copy).

Analyze both images carefully and return a JSON object with these exact keys:
{
  "is_match": true/false,
  "similarity_score": 0-100,
  "modification_type": "unmodified|cropped|resized|overlaid|recolored|remixed|screenshot|unknown",
  "modifications_detected": ["list of specific changes detected"],
  "usage_context": "editorial|commercial|fan_sharing|parody|merchandise|betting_site|social_media|unknown",
  "commercial_intent": "none|low|medium|high",
  "severity": "critical|high|medium|low",
  "evidence_summary": "Detailed explanation of findings in 2-3 sentences",
  "recommended_action": "immediate_dmca|investigate|monitor|ignore",
  "confidence": 0-100
}

IMAGE 1 is the original. IMAGE 2 is the suspect. Focus on visual similarities, logo presence, composition, and modifications.`;

/**
 * Compare an original image against a suspect image for threat classification.
 *
 * @param {string} originalBase64 - Original image (base64, no prefix)
 * @param {string} suspectBase64  - Suspect image (base64, no prefix)
 * @returns {Promise<object>} Threat assessment result
 */
export async function classifyThreat(originalBase64, suspectBase64) {
  if (FEATURES.USE_MOCK_GEMINI) {
    return getMockThreat();
  }

  try {
    return await callGemini(THREAT_PROMPT, [originalBase64, suspectBase64]);
  } catch (error) {
    console.warn('[Gemini] classifyThreat failed, using mock:', error.message);
    return getMockThreat();
  }
}

// ---------------------------------------------------------------------------
// 3. Generate DMCA
// ---------------------------------------------------------------------------

const DMCA_PROMPT_TEMPLATE = (violationData) => `Generate a professional DMCA takedown notice based on the following violation data. The notice should include:

1. Formal header with date and reference number
2. Identification of the copyrighted work
3. Identification of the infringing material with URL
4. Evidence of ownership (Content DNA hash, registration timestamp)
5. Statement of good faith belief
6. Statement of accuracy under penalty of perjury
7. Signature block

Violation Data:
${JSON.stringify(violationData, null, 2)}

Generate the complete DMCA notice as a professional legal document. Return as a JSON object:
{
  "subject": "DMCA Takedown Notice subject line",
  "body": "The full formatted DMCA notice text",
  "reference_id": "A unique reference ID like DMCA-2026-XXXXX",
  "urgency": "immediate|standard|low",
  "platforms_to_notify": ["list of platforms to send to based on violation URLs"]
}`;

/**
 * Generate a DMCA takedown notice using Gemini.
 *
 * @param {object} violationData - Violation details including URLs, evidence, etc.
 * @returns {Promise<object>} Generated DMCA notice
 */
export async function generateDMCA(violationData) {
  if (FEATURES.USE_MOCK_GEMINI) {
    return getMockDMCA(violationData);
  }

  try {
    return await callGemini(
      DMCA_PROMPT_TEMPLATE(violationData),
      [],
      { maxTokens: MODEL_CONFIG.MAX_TOKENS_LONG }
    );
  } catch (error) {
    console.warn('[Gemini] generateDMCA failed, using mock:', error.message);
    return getMockDMCA(violationData);
  }
}

// ---------------------------------------------------------------------------
// 4. Summarize Propagation
// ---------------------------------------------------------------------------

const PROPAGATION_PROMPT_TEMPLATE = (graphData) => `You are a digital piracy intelligence analyst. Analyze this content propagation data and provide a strategic intelligence summary.

Propagation Data:
${JSON.stringify(graphData, null, 2)}

Return a JSON object:
{
  "summary": "2-3 sentence executive summary of the propagation pattern",
  "spread_channels": ["list of main channels/platforms used for spreading"],
  "super_spreaders": ["accounts or nodes with highest propagation impact"],
  "temporal_pattern": "Description of how the content spread over time",
  "geographic_focus": "Description of geographic concentration if any",
  "risk_assessment": "overall risk level and why",
  "recommended_actions": ["prioritized list of actions to take"],
  "estimated_reach": "estimated total reach/impressions"
}`;

/**
 * Summarize content propagation patterns using Gemini.
 *
 * @param {object} graphData - Propagation graph/network data
 * @returns {Promise<object>} Intelligence summary
 */
export async function summarizePropagation(graphData) {
  if (FEATURES.USE_MOCK_GEMINI) {
    return getMockPropagation();
  }

  try {
    return await callGemini(PROPAGATION_PROMPT_TEMPLATE(graphData));
  } catch (error) {
    console.warn('[Gemini] summarizePropagation failed, using mock:', error.message);
    return getMockPropagation();
  }
}

// ---------------------------------------------------------------------------
// Mock Data Fallbacks
// ---------------------------------------------------------------------------

function getMockAnalysis() {
  return {
    description: 'A high-energy sports photograph capturing a decisive moment during a professional cricket match. The image shows players in team jerseys on a well-maintained pitch with stadium lights illuminating the scene.',
    sport_type: 'cricket',
    teams: ['Mumbai Indians', 'Chennai Super Kings'],
    players_visible: ['MS Dhoni', 'Rohit Sharma'],
    event_context: 'match',
    content_type: 'photo',
    semantic_tags: ['action_shot', 'professional', 'broadcast_quality', 'stadium', 'night_match'],
    estimated_value: 'high',
    piracy_risk: 'high',
    watermarks_detected: 'no',
    broadcast_overlay: 'no',
  };
}

function getMockThreat() {
  return {
    is_match: true,
    similarity_score: 87,
    modification_type: 'cropped',
    modifications_detected: ['Image cropped to remove watermark', 'Slight color adjustment', 'Resolution reduced'],
    usage_context: 'social_media',
    commercial_intent: 'low',
    severity: 'high',
    evidence_summary: 'The suspect image appears to be a cropped and slightly modified version of the original. The watermark has been deliberately removed, and the resolution has been reduced, likely for social media sharing.',
    recommended_action: 'investigate',
    confidence: 82,
  };
}

function getMockDMCA(violationData) {
  const refId = `DMCA-2026-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;
  return {
    subject: `DMCA Takedown Notice — ${refId}`,
    body: `DMCA TAKEDOWN NOTICE\nReference: ${refId}\nDate: ${new Date().toISOString().split('T')[0]}\n\nDear Sir/Madam,\n\nI am writing to notify you of copyright infringement on your platform.\n\nCOPYRIGHTED WORK:\n${violationData?.assetName || 'Sports media content'} registered with MediaShield AI Content DNA Engine.\nContent DNA Hash: ${violationData?.contentHash || 'N/A'}\nRegistration Date: ${violationData?.registrationDate || new Date().toISOString()}\n\nINFRINGING MATERIAL:\nURL: ${violationData?.infringingUrl || 'N/A'}\n\nI have a good faith belief that the use of the copyrighted material described above is not authorized by the copyright owner, its agent, or the law.\n\nI declare under penalty of perjury that the information in this notification is accurate and that I am the copyright owner or authorized to act on behalf of the owner.\n\nSincerely,\n${violationData?.ownerName || '[Rights Holder Name]'}\nMediaShield AI Platform`,
    reference_id: refId,
    urgency: 'standard',
    platforms_to_notify: ['Platform Support Team'],
  };
}

function getMockPropagation() {
  return {
    summary: 'The content has spread primarily through social media channels, with a significant concentration on Twitter and Instagram. The propagation pattern suggests coordinated sharing rather than organic viral spread.',
    spread_channels: ['Twitter/X', 'Instagram', 'Telegram', 'Fan Forums'],
    super_spreaders: ['@sports_highlights_daily', '@cricket_memes_official'],
    temporal_pattern: 'Initial surge within 2 hours of original broadcast, followed by sustained sharing over 48 hours',
    geographic_focus: 'Primarily South Asia (India, Pakistan, Sri Lanka) with secondary spread to UK and Australia',
    risk_assessment: 'HIGH — Content is being shared widely with watermarks removed, indicating deliberate piracy',
    recommended_actions: [
      'Issue DMCA notices to top 5 sharing accounts',
      'Contact platform trust & safety teams',
      'Monitor Telegram channels for continued sharing',
      'Consider geo-blocking for high-risk regions',
    ],
    estimated_reach: '~2.5 million impressions across all platforms',
  };
}
