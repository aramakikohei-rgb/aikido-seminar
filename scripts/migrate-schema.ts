import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

await client.execute(`
  CREATE TABLE IF NOT EXISTS seminars (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    instructor TEXT NOT NULL,
    instructorRank TEXT,
    organization TEXT,
    style TEXT,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    venue TEXT,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    countryCode TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    description TEXT,
    level TEXT,
    registrationUrl TEXT,
    contactEmail TEXT,
    fee TEXT,
    source TEXT NOT NULL,
    sourceUrl TEXT,
    lastScraped TEXT NOT NULL,
    manualOverride INTEGER NOT NULL DEFAULT 0
  )
`);

console.log("Schema created successfully.");
client.close();
