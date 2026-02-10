import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "seminars.db");

import fs from "fs";
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

db.exec(`
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

export default db;
