import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getClient } from "../../lib/db.js";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const client = getClient();
  const result = await client.execute(
    "SELECT DISTINCT country, countryCode FROM seminars ORDER BY country ASC"
  );
  return res.status(200).json(result.rows);
}
