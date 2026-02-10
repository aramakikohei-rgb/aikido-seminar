import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db.js";

/** Geocode city+country to lat/lng using OpenStreetMap Nominatim */
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

const router = Router();

router.get("/", (req, res) => {
  const { country, startDate, endDate, instructor, organization } = req.query;

  let sql = "SELECT * FROM seminars WHERE 1=1";
  const params: unknown[] = [];

  if (country) {
    sql += " AND countryCode = ?";
    params.push(country);
  }
  if (startDate) {
    sql += " AND endDate >= ?";
    params.push(startDate);
  }
  if (endDate) {
    sql += " AND startDate <= ?";
    params.push(endDate);
  }
  if (instructor) {
    sql += " AND instructor LIKE ?";
    params.push(`%${instructor}%`);
  }
  if (organization) {
    sql += " AND organization = ?";
    params.push(organization);
  }

  sql += " ORDER BY startDate ASC";

  const seminars = db.prepare(sql).all(...params);
  res.json(seminars);
});

router.get("/countries", (_req, res) => {
  const rows = db
    .prepare(
      "SELECT DISTINCT country, countryCode FROM seminars ORDER BY country ASC"
    )
    .all() as { country: string; countryCode: string }[];
  res.json(rows);
});

router.get("/:id", (req, res) => {
  const seminar = db
    .prepare("SELECT * FROM seminars WHERE id = ?")
    .get(req.params.id);
  if (!seminar) {
    res.status(404).json({ error: "Seminar not found" });
    return;
  }
  res.json(seminar);
});

router.post("/", async (req, res) => {
  const body = req.body;
  const id = uuidv4();
  const now = new Date().toISOString();

  // Geocode if lat/lng missing
  let lat = body.latitude ?? 0;
  let lon = body.longitude ?? 0;
  if (!lat && !lon && body.city && body.country) {
    const geo = await geocode(body.city, body.country);
    if (geo) {
      lat = geo.lat;
      lon = geo.lon;
    }
  }

  const stmt = db.prepare(`
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
  `);

  stmt.run(
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
    1
  );

  const created = db.prepare("SELECT * FROM seminars WHERE id = ?").get(id);
  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const existing = db
    .prepare("SELECT * FROM seminars WHERE id = ?")
    .get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Seminar not found" });
    return;
  }

  const body = req.body;
  const now = new Date().toISOString();

  // Geocode if lat/lng missing
  let lat = body.latitude ?? 0;
  let lon = body.longitude ?? 0;
  if (!lat && !lon && body.city && body.country) {
    const geo = await geocode(body.city, body.country);
    if (geo) {
      lat = geo.lat;
      lon = geo.lon;
    }
  }

  db.prepare(`
    UPDATE seminars SET
      title = ?, instructor = ?, instructorRank = ?, organization = ?,
      style = ?, startDate = ?, endDate = ?, venue = ?,
      city = ?, country = ?, countryCode = ?,
      latitude = ?, longitude = ?, description = ?, level = ?,
      registrationUrl = ?, contactEmail = ?, fee = ?,
      lastScraped = ?, manualOverride = 1
    WHERE id = ?
  `).run(
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
    req.params.id
  );

  const updated = db
    .prepare("SELECT * FROM seminars WHERE id = ?")
    .get(req.params.id);
  res.json(updated);
});

router.delete("/:id", (req, res) => {
  const existing = db
    .prepare("SELECT * FROM seminars WHERE id = ?")
    .get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Seminar not found" });
    return;
  }
  db.prepare("DELETE FROM seminars WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

export default router;
