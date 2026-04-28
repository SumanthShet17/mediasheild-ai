import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery();

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

export async function logViolation(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const projectId = process.env.PROJECT_ID;
  const datasetId = process.env.DATASET_ID || "mediashield";
  if (!projectId) {
    res.status(500).json({ error: "Missing PROJECT_ID" });
    return;
  }

  const payload = req.body;
  if (!payload || !payload.violation_id) {
    res.status(400).json({ error: "Missing violation_id" });
    return;
  }

  try {
    const row = {
      violation_id: payload.violation_id,
      asset_id: payload.asset_id || "",
      detected_timestamp: payload.detected_timestamp || new Date().toISOString(),
      source_url: payload.source_url || "",
      source_platform: payload.source_platform || "",
      similarity_score: Number(payload.similarity_score || 0),
      modification_type: payload.modification_type || "",
      usage_context: payload.usage_context || "",
      commercial_intent: payload.commercial_intent || "",
      severity: payload.severity || "low",
      lat: Number(payload.lat || 0),
      lng: Number(payload.lng || 0),
      country: payload.country || "Unknown",
      gemini_analysis: payload.gemini_analysis || "{}",
      status: payload.status || "detected",
      dmca_notice_uri: payload.dmca_notice_uri || ""
    };

    await bigquery.dataset(datasetId).table("violations").insert([row]);
    res.status(200).json({ ok: true, row });
  } catch (error) {
    res.status(500).json({ error: error.message || "Insert failed" });
  }
}
