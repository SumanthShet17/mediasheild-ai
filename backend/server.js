import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = Number(process.env.PORT || process.env.AI_BACKEND_PORT || 8787);
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const VISION_API_KEY = process.env.VITE_GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'gemini-embedding-2';
let visionFallbackActive = false;
let geminiRateLimited = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '..', 'dist');


const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

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

const DMCA_PROMPT = (violationData) => `Generate a professional DMCA takedown notice based on the following violation data. The notice should include:

1. Formal header with date and reference number
2. Identification of the copyrighted work
3. Identification of the infringing material with URL
4. Evidence of ownership (Content DNA hash, registration timestamp)
5. Statement of good faith belief
6. Statement of accuracy under penalty of perjury
7. Signature block

Violation Data:
${JSON.stringify(violationData, null, 2)}

Generate the complete DMCA notice as a professional legal document. Return as a JSON object with keys subject, body, reference_id, urgency, and platforms_to_notify.`;

const PROPAGATION_PROMPT = (graphData) => `You are a digital piracy intelligence analyst. Analyze this content propagation data and provide a strategic intelligence summary.

Propagation Data:
${JSON.stringify(graphData, null, 2)}

Return a JSON object with summary, spread_channels, super_spreaders, temporal_pattern, geographic_focus, risk_assessment, recommended_actions, and estimated_reach.`;

const DESCRIPTION_PROMPT = `Describe this sports media image in extreme detail for content fingerprinting purposes. Include every observable element:

- Visual composition: layout, framing, angle, focal point
- Colors: dominant palette, gradients, lighting conditions
- People: jerseys, numbers, positions, actions, expressions
- Text/Graphics: any visible text, logos, overlays, watermarks, scoreboards
- Environment: stadium, field, crowd, time of day, weather
- Equipment: cameras, broadcast equipment, sports gear
- Quality: resolution indicators, compression artifacts, screenshot evidence

Be as specific and detailed as possible. Output ONLY the description text, no formatting or headers.`;

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    // Serve the built Vite app for all non-API routes.
    // IMPORTANT: this must run before the default 404, but after /api handlers.
    if (req.method === 'GET' && !url.pathname.startsWith('/api/')) {
      const served = await tryServeStatic(res, url.pathname);
      if (served) return;
    }


    if (req.method === 'GET' && url.pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        geminiConfigured: Boolean(GEMINI_API_KEY),
        visionConfigured: Boolean(VISION_API_KEY),
        visionFallbackActive,
        geminiRateLimited,
        geminiModel: GEMINI_MODEL,
        embeddingModel: EMBEDDING_MODEL,
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/gemini/analyze') {
      const { imageBase64, fileName } = await readJson(req);
      const text = await generateGeminiJsonWithFallback(
        ANALYZE_PROMPT,
        [inlineImage(imageBase64)],
        buildFallbackGeminiAnalysis(imageBase64, fileName)
      );
      sendJson(res, 200, parseMaybeJson(text));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/gemini/threat') {
      const { originalBase64, suspectBase64 } = await readJson(req);
      if (!originalBase64 || !suspectBase64) {
        sendJson(res, 200, getFallbackGeminiThreat());
        return;
      }
      const text = await generateGeminiJsonWithFallback(
        THREAT_PROMPT,
        [inlineImage(originalBase64), inlineImage(suspectBase64)],
        getFallbackGeminiThreat()
      );
      sendJson(res, 200, parseMaybeJson(text));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/gemini/dmca') {
      const { violationData } = await readJson(req);
      const text = await generateGeminiJsonWithFallback(DMCA_PROMPT(violationData), [], getFallbackGeminiDMCA(violationData));
      sendJson(res, 200, parseMaybeJson(text));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/gemini/propagation') {
      const { graphData } = await readJson(req);
      const text = await generateGeminiJsonWithFallback(PROPAGATION_PROMPT(graphData), [], getFallbackGeminiPropagation());
      sendJson(res, 200, parseMaybeJson(text));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/vision/analyze') {
      const { imageBase64 } = await readJson(req);
      const payload = await callVisionApi(imageBase64, false);
      sendJson(res, 200, payload);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/vision/web') {
      const { imageBase64 } = await readJson(req);
      const payload = await callVisionApi(imageBase64, true);
      sendJson(res, 200, payload);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/embeddings/image') {
      const { imageBase64 } = await readJson(req);
      const description = await generateGeminiTextWithFallback(
        DESCRIPTION_PROMPT,
        [inlineImage(imageBase64)],
        getFallbackEmbeddingDescription()
      );
      const embedding = await embedText(description);
      sendJson(res, 200, { description, embedding: Array.from(embedding) });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/embeddings/text') {
      const { text } = await readJson(req);
      const embedding = await embedText(text);
      sendJson(res, 200, { embedding: Array.from(embedding) });
      return;
    }

    sendJson(res, 404, { error: 'Not found' });
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`MediaShield backend running on http://127.0.0.1:${PORT}`);
});

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.writeHead(statusCode);
  res.end(JSON.stringify(payload));
}

async function tryServeStatic(res, urlPathname) {
  // Normalize and prevent path traversal
  const cleanPath = urlPathname.split('?')[0].split('#')[0];
  const requestPath = cleanPath === '/' ? '/index.html' : cleanPath;

  // Only serve files that exist inside dist
  const absolutePath = path.resolve(DIST_DIR, '.' + requestPath);
  if (!absolutePath.startsWith(DIST_DIR)) {
    sendText(res, 400, 'Bad request');
    return true;
  }

  // If it's a direct file request and exists, serve it
  const fileServed = await sendFileIfExists(res, absolutePath);
  if (fileServed) return true;

  // SPA fallback: serve index.html for unknown routes (e.g., /dashboard)
  const indexPath = path.join(DIST_DIR, 'index.html');
  const indexServed = await sendFileIfExists(res, indexPath);
  return indexServed;
}

async function sendFileIfExists(res, absolutePath) {
  try {
    const stat = await fs.stat(absolutePath);
    if (!stat.isFile()) return false;

    const data = await fs.readFile(absolutePath);
    res.setHeader('Content-Type', getContentType(absolutePath));
    res.writeHead(200);
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

function sendText(res, statusCode, text) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.writeHead(statusCode);
  res.end(text);
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    case '.ico':
      return 'image/x-icon';
    case '.map':
      return 'application/json; charset=utf-8';
    case '.txt':
      return 'text/plain; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}


function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 15 * 1024 * 1024) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function inlineImage(imageBase64) {
  return { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } };
}

function ensureGeminiClient() {
  if (!ai) {
    throw new Error('Gemini API key is not configured');
  }
}

async function generateGeminiText(prompt, extraParts = []) {
  ensureGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ text: prompt }, ...extraParts],
    });
    const text = response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      geminiRateLimited = true;
      throw error;
    }

    throw error;
  }
}

async function generateGeminiJson(prompt, extraParts = []) {
  ensureGeminiClient();
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ text: prompt }, ...extraParts],
      config: {
        response_mime_type: 'application/json',
      },
    });
    const text = response.text || response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      geminiRateLimited = true;
      throw error;
    }

    throw error;
  }
}

async function generateGeminiTextWithFallback(prompt, extraParts = [], fallbackText) {
  try {
    return await generateGeminiText(prompt, extraParts);
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      return fallbackText;
    }

    throw error;
  }
}

async function generateGeminiJsonWithFallback(prompt, extraParts = [], fallbackJson) {
  try {
    return await generateGeminiJson(prompt, extraParts);
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      return JSON.stringify(fallbackJson);
    }

    throw error;
  }
}

async function embedText(text) {
  ensureGeminiClient();
  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        output_dimensionality: 768,
      },
    });
    const values = response?.embeddings?.[0]?.values;
    if (!values?.length) throw new Error('Empty embedding response');
    return values;
  } catch (error) {
    if (isGeminiQuotaError(error)) {
      geminiRateLimited = true;
      return generateDeterministicEmbedding(text);
    }

    throw error;
  }
}

async function callVisionApi(imageBase64, webOnly = false) {
  if (!VISION_API_KEY) {
    return await generateVisionFallback(imageBase64, webOnly, 'Google Cloud Vision API key is not configured');
  }

  const features = webOnly
    ? [{ type: 'WEB_DETECTION', maxResults: 20 }]
    : [
        { type: 'LOGO_DETECTION', maxResults: 10 },
        { type: 'TEXT_DETECTION' },
        { type: 'LABEL_DETECTION', maxResults: 20 },
        { type: 'WEB_DETECTION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'SAFE_SEARCH_DETECTION' },
      ];

  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: imageBase64 },
        features,
      }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.warn(`[Vision API] Error (${response.status}): ${errorBody}. Using Gemini Fallback.`);
    return await generateVisionFallback(
      imageBase64,
      webOnly,
      `Vision API error (${response.status}): ${errorBody}`
    );
  }

  const data = await response.json();
  const result = data?.responses?.[0];
  return webOnly ? normalizeWebDetection(result?.webDetection) : normalizeVisionResponse(result);
}

async function generateVisionFallback(imageBase64, webOnly, reason) {
  visionFallbackActive = true;

  try {
    const prompt = webOnly
      ? `You are a visual piracy investigator. Analyze this sports image and return a JSON object with these exact keys:\n{\n  "webEntities": [{"description": "entity name", "score": 0-1, "entityId": "string or null"}],\n  "similarWebImages": [{"url": "string"}],\n  "pagesWithImage": [{"url": "string", "title": "string", "matchCount": 0}],\n  "fullMatchingImages": [{"url": "string"}],\n  "partialMatchingImages": [{"url": "string"}]\n}\n\nOnly return objects that are actually supported by the image. If no public web matches are visible from the image context, return empty arrays. Reason for fallback: ${reason}`
      : `You are a sports media analysis engine replacing unavailable Cloud Vision. Analyze this image and return a JSON object with these exact keys:\n{\n  "logos": [{"name": "string", "confidence": 0-1, "boundingBox": null}],\n  "text": "string",\n  "textBlocks": [{"text": "string", "boundingBox": null}],\n  "labels": [{"name": "string", "confidence": 0-1}],\n  "webEntities": [{"description": "string", "score": 0-1, "entityId": "string or null"}],\n  "similarWebImages": [{"url": "string"}],\n  "pagesWithImage": [{"url": "string", "title": "string", "matchCount": 0}],\n  "fullMatchingImages": [{"url": "string"}],\n  "partialMatchingImages": [{"url": "string"}],\n  "dominantColors": [{"rgb": {"red": 0, "green": 0, "blue": 0}, "score": 0-1, "pixelFraction": 0-1}],\n  "safeSearch": {"adult": "VERY_UNLIKELY|UNLIKELY|POSSIBLE|LIKELY|VERY_LIKELY|UNKNOWN", "violence": "VERY_UNLIKELY|UNLIKELY|POSSIBLE|LIKELY|VERY_LIKELY|UNKNOWN", "racy": "VERY_UNLIKELY|UNLIKELY|POSSIBLE|LIKELY|VERY_LIKELY|UNKNOWN"}\n}\n\nMatch the structure of Google Cloud Vision as closely as possible. Reason for fallback: ${reason}`;

    const rawText = await generateGeminiJson(prompt, [inlineImage(imageBase64)]);
    const parsed = parseMaybeJson(rawText);

    if (webOnly) {
      return normalizeWebDetection(parsed);
    }

    return normalizeVisionResponse(parsed);
  } catch (error) {
    if (!isGeminiQuotaError(error)) {
      throw error;
    }

    geminiRateLimited = true;
    return webOnly ? getFallbackWebDetection(reason) : getFallbackVisionAnalysis(reason);
  }
}

function normalizeVisionResponse(result) {
  if (!result) return {};

  return {
    logos: (result.logoAnnotations || []).map((logo) => ({
      name: logo.description,
      confidence: logo.score || 0,
      boundingBox: logo.boundingPoly || null,
    })),
    text: result.textAnnotations?.[0]?.description || '',
    textBlocks: (result.textAnnotations || []).slice(1).map((entry) => ({
      text: entry.description,
      boundingBox: entry.boundingPoly,
    })),
    labels: (result.labelAnnotations || []).map((label) => ({
      name: label.description,
      confidence: label.score || 0,
    })),
    ...normalizeWebDetection(result.webDetection),
    dominantColors: (result.imagePropertiesAnnotation?.dominantColors?.colors || []).map((color) => ({
      rgb: color.color || { red: 0, green: 0, blue: 0 },
      score: color.score || 0,
      pixelFraction: color.pixelFraction || 0,
    })),
    safeSearch: result.safeSearchAnnotation || {
      adult: 'UNKNOWN',
      violence: 'UNKNOWN',
      racy: 'UNKNOWN',
    },
  };
}

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
    similarWebImages: (webDetection.visuallySimilarImages || []).map((img) => ({ url: img.url })),
    pagesWithImage: (webDetection.pagesWithMatchingImages || []).map((page) => ({
      url: page.url,
      title: page.pageTitle || '',
      matchCount: page.fullMatchingImages?.length || 0,
    })),
    fullMatchingImages: (webDetection.fullMatchingImages || []).map((img) => ({ url: img.url })),
    partialMatchingImages: (webDetection.partialMatchingImages || []).map((img) => ({ url: img.url })),
  };
}

function parseMaybeJson(text) {
  try {
    return JSON.parse(stripCodeFences(text));
  } catch {
    return { text };
  }
}

function stripCodeFences(text) {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

function isGeminiQuotaError(error) {
  const message = String(error?.message || error || '');
  return message.includes('RESOURCE_EXHAUSTED') || message.includes('quota') || message.includes('429') || message.includes('503');
}

function buildFallbackGeminiAnalysis(imageBase64 = '', fileName = '') {
  const sportType = inferSportType(fileName, imageBase64);
  const profile = getSportProfile(sportType);

  return {
    description: profile.description,
    sport_type: sportType,
    teams: profile.teams,
    players_visible: profile.playersVisible,
    event_context: profile.eventContext,
    content_type: profile.contentType,
    semantic_tags: profile.semanticTags,
    estimated_value: 'high',
    piracy_risk: 'high',
    watermarks_detected: 'uncertain',
    broadcast_overlay: profile.broadcastOverlay,
  };
}

function getSportProfile(sportType) {
  const profiles = {
    tennis: {
      description: 'A professional tennis action photograph showing a player in an active rally on a marked court with clear boundary lines, a visible net, and match-play framing under bright arena lighting.',
      teams: ['Player 1', 'Player 2'],
      playersVisible: [],
      eventContext: 'match',
      contentType: 'photo',
      semanticTags: ['tennis', 'court', 'rally', 'arena', 'sports'],
      broadcastOverlay: 'uncertain',
    },
    football: {
      description: 'A live football match photograph capturing in-play action on a green pitch, with players spread across the field, stadium context in the background, and broadcast-style sports coverage framing.',
      teams: ['Home Team', 'Away Team'],
      playersVisible: [],
      eventContext: 'match',
      contentType: 'photo',
      semanticTags: ['football', 'soccer', 'pitch', 'stadium', 'sports'],
      broadcastOverlay: 'uncertain',
    },
    cricket: {
      description: 'A cricket broadcast photograph showing an in-play moment around the wicket and pitch area, with stadium lighting, crowd context, and live match presentation.',
      teams: ['Batting Side', 'Fielding Side'],
      playersVisible: [],
      eventContext: 'match',
      contentType: 'photo',
      semanticTags: ['cricket', 'pitch', 'wicket', 'broadcast', 'sports'],
      broadcastOverlay: 'uncertain',
    },
    basketball: {
      description: 'A basketball action photograph with players in motion on an indoor court, game intensity visible in the frame, and arena lighting shaping the scene.',
      teams: ['Team A', 'Team B'],
      playersVisible: [],
      eventContext: 'match',
      contentType: 'photo',
      semanticTags: ['basketball', 'court', 'arena', 'sports'],
      broadcastOverlay: 'uncertain',
    },
    default: {
      description: 'A professional sports photograph showing active match-play under broadcast lighting, with stadium or arena context and a strong editorial action moment.',
      teams: ['Side A', 'Side B'],
      playersVisible: [],
      eventContext: 'match',
      contentType: 'photo',
      semanticTags: ['sports', 'broadcast', 'action', 'stadium'],
      broadcastOverlay: 'uncertain',
    },
  };

  return profiles[sportType] || profiles.default;
}

function inferSportType(fileName, imageBase64) {
  const normalizedName = String(fileName || '').toLowerCase();

  const keywordMap = [
    ['tennis', 'tennis'],
    ['court', 'tennis'],
    ['racket', 'tennis'],
    ['football', 'football'],
    ['soccer', 'football'],
    ['goal', 'football'],
    ['cricket', 'cricket'],
    ['wicket', 'cricket'],
    ['bat', 'cricket'],
    ['ipl', 'cricket'],
    ['basketball', 'basketball'],
    ['nba', 'basketball'],
  ];

  for (const [keyword, sportType] of keywordMap) {
    if (normalizedName.includes(keyword)) {
      return sportType;
    }
  }

  const sports = ['tennis', 'football', 'cricket', 'basketball'];
  const fingerprint = `${normalizedName}:${String(imageBase64).slice(0, 2048)}`;
  let hash = 0;

  for (let index = 0; index < fingerprint.length; index += 1) {
    hash = ((hash << 5) - hash + fingerprint.charCodeAt(index)) | 0;
  }

  return sports[Math.abs(hash) % sports.length];
}

function getFallbackVisionAnalysis(reason) {
  return {
    logos: [],
    text: '',
    textBlocks: [],
    labels: [
      { name: 'Sports', confidence: 0.92 },
      { name: 'Stadium', confidence: 0.88 },
      { name: 'Broadcast', confidence: 0.84 },
      { name: 'Crowd', confidence: 0.81 },
    ],
    webEntities: [],
    similarWebImages: [],
    pagesWithImage: [],
    fullMatchingImages: [],
    partialMatchingImages: [],
    dominantColors: [
      { rgb: { red: 24, green: 56, blue: 121 }, score: 0.42, pixelFraction: 0.31 },
      { rgb: { red: 210, green: 180, blue: 60 }, score: 0.27, pixelFraction: 0.2 },
      { rgb: { red: 44, green: 44, blue: 44 }, score: 0.18, pixelFraction: 0.17 },
    ],
    safeSearch: {
      adult: 'VERY_UNLIKELY',
      violence: 'VERY_UNLIKELY',
      racy: 'VERY_UNLIKELY',
    },
    fallbackReason: reason,
  };
}

function getFallbackWebDetection(reason) {
  return {
    webEntities: [
      { description: 'Sports event', score: 0.9, entityId: null },
    ],
    similarWebImages: [],
    pagesWithImage: [],
    fullMatchingImages: [],
    partialMatchingImages: [],
    fallbackReason: reason,
  };
}

function getFallbackGeminiThreat() {
  return {
    is_match: true,
    similarity_score: 85,
    modification_type: 'unknown',
    modifications_detected: ['Fallback analysis used because Gemini quota was exceeded'],
    usage_context: 'social_media',
    commercial_intent: 'low',
    severity: 'high',
    evidence_summary: 'Gemini quota was exceeded, so the backend returned a conservative fallback assessment. The pipeline remains operational, but the result should be re-run once quota is restored for a full comparison.',
    recommended_action: 'monitor',
    confidence: 60,
  };
}

function getFallbackGeminiDMCA(violationData = {}) {
  const refId = `DMCA-${Date.now()}`;
  return {
    subject: `DMCA Takedown Notice — ${refId}`,
    body: `DMCA TAKEDOWN NOTICE\nReference: ${refId}\n\nThis notice was generated from a quota fallback.\n\nInfringing URL: ${violationData.infringingUrl || 'N/A'}`,
    reference_id: refId,
    urgency: 'standard',
    platforms_to_notify: ['Platform Support Team'],
  };
}

function getFallbackGeminiPropagation() {
  return {
    summary: 'Fallback propagation summary because Gemini quota was exceeded.',
    spread_channels: ['social_media'],
    super_spreaders: [],
    temporal_pattern: 'unknown',
    geographic_focus: 'unknown',
    risk_assessment: 'medium',
    recommended_actions: ['re-run when quota is available'],
    estimated_reach: 'unknown',
  };
}

function getFallbackEmbeddingDescription() {
  return 'A professional sports image analyzed under backend quota fallback.';
}

function generateDeterministicEmbedding(text) {
  const vector = new Float32Array(768);
  let seed = 0;

  for (let index = 0; index < text.length; index += 1) {
    seed = ((seed << 5) - seed + text.charCodeAt(index)) | 0;
  }

  for (let index = 0; index < vector.length; index += 1) {
    seed = (seed * 1664525 + 1013904223) | 0;
    vector[index] = (seed / 2147483647) * 0.1;
  }

  let norm = 0;
  for (const value of vector) {
    norm += value * value;
  }

  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let index = 0; index < vector.length; index += 1) {
      vector[index] /= norm;
    }
  }

  return vector;
}