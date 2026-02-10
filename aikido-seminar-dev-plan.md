# Aikido Global Seminar Tracker — Development Plan

## Project Overview

A React-based web application that aggregates and displays Aikido seminars scheduled worldwide. The app features three integrated views (interactive world map, filterable list, and calendar), powered by automated web scraping with manual data override capabilities.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Map View │  │ Calendar View│  │ List + Filters    │  │
│  │ (Leaflet)│  │ (BigCalendar)│  │ (TanStack Table)  │  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
│                         │                                │
│              Shared State (React Context)                │
└─────────────────────────┬───────────────────────────────┘
                          │ fetch JSON
┌─────────────────────────┴───────────────────────────────┐
│                Backend API (Express.js)                   │
│         Serves seminar data from SQLite DB                │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
  ┌───────┴────────┐           ┌──────────┴─────────┐
  │ Scraper Engine │           │ Manual Data Entry   │
  │ (Playwright)   │           │ (JSON / Admin UI)   │
  │ via GH Actions │           │                     │
  └────────────────┘           └────────────────────┘
```

---

## Data Sources (Priority Order)

| # | Source | URL | Coverage | Scraping Method |
|---|--------|-----|----------|-----------------|
| 1 | AikidoTravel | aikidotravel.com | Global aggregator | Playwright (JS-rendered) |
| 2 | IAF Global Events | aikido-international.org/events/ | International federation | Cheerio (static HTML) |
| 3 | AikiWeb Seminars | aikiweb.com/seminars/ | Community database | Cheerio (static HTML) |
| 4 | USAF Events | services.usaikifed.com/events/ | USA | Playwright |
| 5 | European Aikido Fed | aikido-eu.org | Europe | Cheerio |
| 6 | Aikikai Foundation | aikikai.or.jp/eng/ | Japan / International | Playwright (JP+EN) |
| 7 | Eurasia Aikido | eurasiaaikido.org/aikido-calendar/ | Eurasia | Cheerio |
| 8 | Aikido World Alliance | aikidoworldalliance.com/awa-seminars | AWA members | Cheerio |

**Note:** No public APIs exist for any of these sources — all require HTML scraping.

---

## Data Model

### Seminar Schema

```typescript
interface Seminar {
  id: string;                  // UUID
  title: string;               // "International Aikido Seminar"
  instructor: string;          // "Yamada Yoshimitsu Shihan"
  instructorRank?: string;     // "8th Dan"
  organization?: string;       // "USAF", "Aikikai", "IAF"
  style?: string;              // "Aikikai", "Yoshinkan", "Shodokan"

  startDate: string;           // ISO 8601: "2026-03-15"
  endDate: string;             // ISO 8601: "2026-03-17"

  venue?: string;              // "Tokyo Budokan"
  city: string;                // "Tokyo"
  country: string;             // "Japan"
  countryCode: string;         // "JP" (ISO 3166-1 alpha-2)
  latitude: number;            // 35.6762
  longitude: number;           // 139.6503

  description?: string;        // Free text
  level?: SeminarLevel;        // "all" | "beginner" | "intermediate" | "advanced"
  registrationUrl?: string;    // External link
  contactEmail?: string;
  fee?: string;                // "€50" (free text, varies by region)

  source: string;              // "aikidotravel" | "iaf" | "manual"
  sourceUrl?: string;          // Original listing URL
  lastScraped: string;         // ISO 8601 timestamp
  manualOverride: boolean;     // true if manually edited
}
```

---

## Tech Stack

### Frontend

| Component | Library | Rationale |
|-----------|---------|-----------|
| Framework | React 18+ (Vite) | Fast dev experience, wide ecosystem |
| Map view | react-leaflet + react-leaflet-cluster | Free (OpenStreetMap tiles), clustering for dense areas |
| Calendar view | react-big-calendar | Month/week/agenda views, event rendering, mature |
| List view | TanStack Table v8 | Headless — full UI control, lightweight |
| Styling | Tailwind CSS | Utility-first, fast prototyping |
| UI components | shadcn/ui | Accessible, customizable, pairs with Tailwind |
| Date handling | date-fns | Lightweight, tree-shakeable |
| State management | React Context + useReducer | Sufficient for shared filter state |
| i18n (future) | react-i18next | Multilingual support for JP/EN/FR/DE |

**Estimated bundle:** ~160KB gzipped

### Backend / Scraping

| Component | Library | Rationale |
|-----------|---------|-----------|
| Scraper | Playwright (Node.js) | Handles JS-rendered pages, multi-browser |
| Static parsing | Cheerio | Lightweight for simple HTML pages |
| Scheduling | GitHub Actions (cron) | Free, reliable, no server needed |
| Database | SQLite (via better-sqlite3) | Zero-config, file-based, sufficient for ~10K records |
| API server | Express.js | Minimal REST API serving JSON |
| Geocoding | Nominatim (OpenStreetMap) | Free geocoding for city→lat/lng |
| Hosting | Vercel or Netlify | Free tier, auto-deploy from Git |

**Monthly cost:** $0 (all free-tier services)

---

## Development Phases

### Phase 1 — Foundation (Week 1–2)

**Goal:** Project scaffolding, data model, and basic UI shell

Tasks:

1. Initialize React project with Vite + TypeScript
2. Set up Tailwind CSS + shadcn/ui
3. Define TypeScript interfaces for seminar data
4. Create SQLite schema and seed with sample data (~20 seminars)
5. Build Express.js API with endpoints:
   - `GET /api/seminars` — list all (with query filters)
   - `GET /api/seminars/:id` — single seminar detail
   - `GET /api/seminars/countries` — distinct countries for filter dropdown
6. Create app layout shell with tab navigation (Map / List / Calendar)
7. Implement basic list view with TanStack Table (no filters yet)

**Deliverable:** Running app showing sample seminar data in a table

---

### Phase 2 — Map & Calendar Views (Week 3–4)

**Goal:** All three views functional with shared state

Tasks:

1. Integrate react-leaflet with OpenStreetMap tiles
2. Add marker clustering (react-leaflet-cluster)
3. Build seminar popup cards on marker click (instructor, dates, location)
4. Integrate react-big-calendar with month/week/agenda modes
5. Render seminars as calendar events with color coding by style/organization
6. Build shared filter context (React Context):
   - Date range picker
   - Country / region dropdown
   - Organization / style multi-select
   - Instructor search (autocomplete)
   - Level filter (all / beginner / intermediate / advanced)
7. Wire filters to all three views simultaneously
8. Add view-switching tabs with URL routing (react-router)

**Deliverable:** Fully navigable app with map pins, calendar events, and filtered list

---

### Phase 3 — Web Scraping Engine (Week 5–7)

**Goal:** Automated data collection from priority sources

Tasks:

1. Build scraper framework with pluggable source adapters:
   ```
   scrapers/
   ├── base-scraper.ts        # Abstract base with retry, rate-limiting
   ├── aikido-travel.ts       # Playwright-based
   ├── iaf-events.ts          # Cheerio-based
   ├── aikiweb.ts             # Cheerio-based
   ├── usaf-events.ts         # Playwright-based
   └── european-af.ts         # Cheerio-based
   ```
2. Implement each scraper with:
   - Rate limiting (1 request/2 seconds)
   - Retry logic (3 attempts with exponential backoff)
   - User-Agent header identifying the project
   - Error logging and notification
3. Build data normalization pipeline:
   - Date parsing (handle DD/MM/YYYY, MM/DD/YYYY, Japanese formats)
   - Country name → ISO code mapping
   - City → geocoordinates via Nominatim (with caching)
   - Deduplication (same seminar listed on multiple sites)
   - Instructor name normalization (handle variations across languages)
4. Create GitHub Actions workflow:
   ```yaml
   schedule:
     - cron: '0 2 * * 1'   # Weekly on Monday at 2 AM UTC
   ```
5. Implement scrape → normalize → deduplicate → upsert pipeline
6. Add manual JSON override file (`manual-seminars.json`) for corrections

**Deliverable:** Automated weekly scraping populating the database

---

### Phase 4 — Polish & UX (Week 8–9)

**Goal:** Production-ready user experience

Tasks:

1. Responsive design (mobile-first for map and list views)
2. Seminar detail modal/page with:
   - Full description
   - Map snippet showing venue location
   - Link to registration
   - "Add to Google Calendar" / iCal export button
3. "Upcoming this week/month" summary section on homepage
4. Country/region statistics dashboard (bar chart of seminars per country)
5. Dark mode support
6. Loading states, empty states, and error handling
7. SEO meta tags and Open Graph for social sharing
8. Accessibility audit (keyboard navigation, screen reader labels)
9. Performance optimization:
   - Lazy loading for map tiles
   - Virtual scrolling for long lists
   - Data pagination

**Deliverable:** Polished, responsive, production-ready application

---

### Phase 5 — Admin & Monitoring (Week 10)

**Goal:** Maintainability and manual data management

Tasks:

1. Simple admin page (password-protected) for:
   - Adding/editing seminars manually
   - Flagging incorrect scraped data
   - Triggering an on-demand scrape
2. Scraping health dashboard:
   - Last successful scrape per source
   - Number of seminars per source
   - Error log viewer
3. Email/Slack notification on scrape failure
4. Data freshness indicator on the frontend ("Last updated: 2 hours ago")
5. Automated tests:
   - Unit tests for date parsing and normalization
   - Integration tests for scraper output format
   - E2E tests for critical user flows (Playwright)

**Deliverable:** Maintainable system with monitoring and manual override capability

---

## Key Technical Challenges & Mitigations

| Challenge | Risk | Mitigation |
|-----------|------|------------|
| Sites redesign breaking scrapers | High | Modular scraper design; alert on parse failures; fallback to cached data |
| Multilingual content (JP, FR, DE) | Medium | Store original language + English translation; use browser locale detection |
| Geocoding accuracy | Medium | Cache results; allow manual lat/lng override; use city+country for lookup |
| Duplicate detection across sources | Medium | Match on instructor + date + city combo; fuzzy matching with threshold |
| Rate limiting / IP blocking | Low | Respectful scraping intervals; rotate User-Agent; GitHub Actions IP pool |
| Stale/outdated seminar data | Medium | Show "last scraped" date; auto-archive past events; weekly refresh cycle |

---

## Future Enhancements (Post-MVP)

- User accounts with saved favorites and email notifications for new seminars
- Multilingual UI (Japanese, French, German, Spanish)
- Instructor profiles with seminar history
- Community contributions (users submit seminars, moderated before publishing)
- Mobile app (React Native, sharing codebase with web)
- Integration with Google Calendar API for automatic sync
- RSS/Atom feed for new seminar announcements

---

## Summary

| Aspect | Choice |
|--------|--------|
| Frontend | React + Vite + TypeScript + Tailwind |
| Map | react-leaflet (free OpenStreetMap tiles) |
| Calendar | react-big-calendar |
| List | TanStack Table v8 |
| Scraping | Playwright + Cheerio |
| Scheduling | GitHub Actions (weekly cron) |
| Database | SQLite |
| Hosting | Vercel / Netlify (free tier) |
| Monthly cost | $0 |
| Timeline | ~10 weeks to production |
