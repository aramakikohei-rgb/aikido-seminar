import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getClient } from "../../lib/db.js";

async function geocode(
  city: string,
  country: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const q = encodeURIComponent(`${city}, ${country}`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "AikidoSeminarTracker/1.0" } }
    );
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch {
    // Geocoding failed silently — caller handles fallback
  }
  return null;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid seminar ID" });
  }

  const client = getClient();

  if (req.method === "GET") {
    const result = await client.execute({
      sql: "SELECT * FROM seminars WHERE id = ?",
      args: [id],
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Seminar not found" });
    }
    return res.status(200).json(result.rows[0]);
  }

  if (req.method === "PUT") {
    const existing = await client.execute({
      sql: "SELECT * FROM seminars WHERE id = ?",
      args: [id],
    });
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Seminar not found" });
    }

    const body = req.body;
    const now = new Date().toISOString();

    let lat = body.latitude ?? 0;
    let lon = body.longitude ?? 0;
    if (!lat && !lon && body.city && body.country) {
      const geo = await geocode(body.city, body.country);
      if (geo) {
        lat = geo.lat;
        lon = geo.lon;
      }
    }

    await client.execute({
      sql: `
        UPDATE seminars SET
          title = ?, instructor = ?, instructorRank = ?, organization = ?,
          style = ?, startDate = ?, endDate = ?, venue = ?,
          city = ?, country = ?, countryCode = ?,
          latitude = ?, longitude = ?, description = ?, level = ?,
          registrationUrl = ?, contactEmail = ?, fee = ?,
          lastScraped = ?, manualOverride = 1
        WHERE id = ?
      `,
      args: [
        body.title,
        body.instructor,
        body.instructorRank || null,
        body.organization || null,
        body.style || null,
        body.startDate,
        body.endDate,
        body.venue || null,
        body.city,
        body.country,
        body.countryCode,
        lat,
        lon,
        body.description || null,
        body.level || null,
        body.registrationUrl || null,
        body.contactEmail || null,
        body.fee || null,
        now,
        id,
      ],
    });

    const updated = await client.execute({
      sql: "SELECT * FROM seminars WHERE id = ?",
      args: [id],
    });
    return res.status(200).json(updated.rows[0]);
  }

  if (req.method === "DELETE") {
    const existing = await client.execute({
      sql: "SELECT * FROM seminars WHERE id = ?",
      args: [id],
    });
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Seminar not found" });
    }

    await client.execute({
      sql: "DELETE FROM seminars WHERE id = ?",
      args: [id],
    });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
}
