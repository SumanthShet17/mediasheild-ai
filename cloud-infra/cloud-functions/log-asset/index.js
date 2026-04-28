import { BigQuery } from "@google-cloud/bigquery";

const bigquery = new BigQuery();

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

export async function logAsset(req, res) {
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
  if (!payload || !payload.asset_id) {
    res.status(400).json({ error: "Missing asset_id" });
    return;
  }

  try {
    const row = {
      asset_id: payload.asset_id,
      org_id: payload.org_id || "demo-org",
      upload_timestamp: payload.upload_timestamp || new Date().toISOString(),
      storage_uri: payload.storage_uri || "",
      gemini_description: payload.gemini_description || "",
      sport_type: payload.sport_type || "",
      content_type: payload.content_type || "",
      labels: payload.labels || "[]",
      hashes_phash: payload.hashes_phash || "",
      hashes_dhash: payload.hashes_dhash || "",
      hashes_ahash: payload.hashes_ahash || "",
      credential_hash: payload.credential_hash || "",
      status: payload.status || "active"
    };

    await bigquery.dataset(datasetId).table("assets").insert([row]);
    res.status(200).json({ ok: true, row });
  } catch (error) {
    res.status(500).json({ error: error.message || "Insert failed" });
  }
}
