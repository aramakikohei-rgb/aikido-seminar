import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getClient } from "../../lib/db.js";
import { v4 as uuidv4 } from "uuid";

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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const client = getClient();

  if (req.method === "GET") {
    const { country, startDate, endDate, instructor, organization } = req.query;

    let sql = "SELECT * FROM seminars WHERE 1=1";
    const args: (string | number)[] = [];

    if (country) {
      sql += " AND countryCode = ?";
      args.push(String(country));
    }
    if (startDate) {
      sql += " AND endDate >= ?";
      args.push(String(startDate));
    }
    if (endDate) {
      sql += " AND startDate <= ?";
      args.push(String(endDate));
    }
    if (instructor) {
      sql += " AND instructor LIKE ?";
      args.push(`%${instructor}%`);
    }
    if (organization) {
      sql += " AND organization = ?";
      args.push(String(organization));
    }

    sql += " ORDER BY startDate ASC";

    const result = await client.execute({ sql, args });
    return res.status(200).json(result.rows);
  }

  if (req.method === "POST") {
    const body = req.body;
    const id = uuidv4();
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
        INSERT INTO seminars (
          id, title, instructor, instructorRank, organization, style,
          startDate, endDate, venue, city, country, countryCode,
          latitude, longitude, description, level, registrationUrl,
          contactEmail, fee, source, sourceUrl, lastScraped, manualOverride
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `,
      args: [
        id,
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
        "manual",
        null,
        now,
        1,
      ],
    });

    const result = await client.execute({
      sql: "SELECT * FROM seminars WHERE id = ?",
      args: [id],
    });

    return res.status(201).json(result.rows[0]);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
