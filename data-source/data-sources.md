# Aikido Seminar Tracker — Data Sources

Last updated: 2026-02-09

---

## Overview

This document summarizes all identified data sources for collecting Aikido seminar information worldwide. Each source has been audited for reachability, data richness, and scraping feasibility.

**Key finding:** No public APIs exist for any of these sources — all require HTML scraping or feed parsing. Four sources are highly viable (Tier 1), two are usable with effort (Tier 2), and two are limited or unreachable (Tier 3).

---

## Tier 1 — Primary Sources (Rich Data, Scrapable)

### 1. AikidoTravel

- **URL:** https://aikidotravel.com
- **Coverage:** Global aggregator (community-submitted)
- **Status:** Active, rich listings
- **Data format:** Card-based layout with JS-driven dynamic content and date picker filtering
- **Scraping method:** Playwright (JS-rendered)
- **Data available per seminar:** Date, title, location, instructor(s), duration
- **Sample content:** International seminars across Germany, USA, Turkey, and more
- **Notes:** Largest volume of international seminars. Best source for breadth. Requires headless browser due to JS rendering.

---

### 2. USAF Events (United States Aikido Federation)

- **URL:** https://services.usaikifed.com/events/
- **Coverage:** United States
- **Status:** Active, well-structured listings
- **Data format:** Chronological accordion list (year/month groupings) with search/autocomplete
- **Scraping method:** Cheerio (static HTML) or RSS feed
- **Data available per seminar:** Date range, instructor name + rank (Shihan/Shidoin/Fukushidoin), host dojo, event title, cancellation status
- **RSS feed:** Available (easiest automated ingestion path)
- **Sample content:** Events from Feb 2026 through 2027
- **Notes:** RSS feed makes this the simplest source to parse. Recommended as the first scraper to implement.

---

### 3. Eurasia Aikido Organisation

- **URL:** https://eurasiaaikido.org/aikido-calendar/
- **Coverage:** Eurasia / Europe (Turkey, Czech Republic, Bulgaria, France, Belgium, Portugal, etc.)
- **Status:** Active, well-structured
- **Data format:** Card-based layout with JSON-LD structured data (WordPress events plugin)
- **Scraping method:** Cheerio (static HTML with JSON-LD)
- **Data available per seminar:** Title, location, date/time range with timezone, organizer
- **Export options:** iCal export, Google Calendar links
- **Sample content:** Events from Feb–Aug 2026 across multiple European countries
- **Notes:** JSON-LD embedded metadata makes this the cleanest source for structured scraping. WordPress events plugin also offers iCal export.

---

### 4. Aikikai Foundation (Hombu Dojo)

- **URL:** https://aikikai.or.jp/eng/
- **Coverage:** Japan / International (official Aikikai events)
- **Status:** Active, JSON API available
- **Data format:** Vue.js SPA with PHP/JSON API backend
- **Scraping method:** Direct JSON API call
- **API endpoint:** `/js/load_events.php?lang=en&kind=ann&limit=5&sort=asc&from_now=1`
- **Data available per seminar:** Dates, categories, event titles
- **Notes:** The JSON API endpoint is the most machine-friendly source. Can be accessed directly without a headless browser despite the Vue.js frontend.

---

## Tier 2 — Secondary Sources (Usable with Effort)

### 5. Aikido World Alliance (AWA)

- **URL:** https://aikidoworldalliance.com/awa-seminars
- **Coverage:** AWA member organizations
- **Status:** Active
- **Data format:** Card-based layout on Squarespace (`squarespace-events-collection`)
- **Scraping method:** Cheerio or Playwright
- **Data available per seminar:** Thumbnail image, title, date range, location with Google Maps link, flyer PDF
- **Export options:** Google Calendar links, ICS export
- **Sample content:** Events from Mar–Jul 2026 in Poland, North Carolina, Chicago, Georgia, etc.
- **Notes:** Squarespace hosting may have anti-scraping measures. ICS export links could be parsed directly.

---

### 6. European Aikido Federation (EAF)

- **URL:** https://aikido-eu.org
- **Coverage:** Europe
- **Status:** Partial (SSL certificate errors on HTTPS)
- **Data format:** Google Sites page with embedded Google Calendar widget
- **Scraping method:** Google Calendar API (if calendar ID can be extracted) or Playwright
- **Data available per seminar:** Events loaded client-side via Google Calendar embed
- **Notes:** SSL issues and Google Sites hosting make direct scraping difficult. The embedded Google Calendar could potentially be accessed via the Google Calendar API if the public calendar ID is extracted from the embed code.

---

## Tier 3 — Limited or Unreachable

### 7. IAF Global Events (International Aikido Federation)

- **URL:** https://aikido-international.org/events/
- **Coverage:** International federation events
- **Status:** Reachable but extremely sparse content
- **Data format:** Simple HTML text list with category links
- **Data available:** Only 1 future event visible (15th International Aikido Summit, Tanabe, Japan, 2028)
- **Categories:** Visits of Doshu, Global Events, etc. — but almost no content
- **Notes:** Not useful as a regular data source. Could be checked monthly for rare high-profile events (Doshu visits, IAF congresses).

---

### 8. AikiWeb Seminars

- **URL:** https://aikiweb.com/seminars/
- **Coverage:** Community database (historically large)
- **Status:** Blocked by Cloudflare bot protection
- **Data format:** Unknown (returns "Just a moment..." challenge page)
- **Scraping method:** Would require Playwright with Cloudflare bypass
- **Notes:** HTTP requests return 403 after redirect loop (HTTPS 301 -> HTTP -> Cloudflare block). Cannot be scraped without a headless browser with full JS execution and potential Cloudflare challenge solving. Content quality unknown.

---

## Recommended Implementation Order

For Phase 3 (scraper engine), implement scrapers in this order based on feasibility and data value:

| Priority | Source | Reason |
|----------|--------|--------|
| 1st | USAF Events | RSS feed available — simplest to parse |
| 2nd | Eurasia Aikido | JSON-LD structured data + iCal export — very clean |
| 3rd | Aikikai Foundation | JSON API endpoint already exists — direct HTTP call |
| 4th | AikidoTravel | Richest global data but requires Playwright for JS rendering |
| 5th | AWA Seminars | Squarespace cards with ICS links — moderate effort |
| 6th | European Aikido Fed | Requires Google Calendar API or Playwright — higher effort |
| Skip | IAF Global Events | Too sparse to justify a scraper |
| Skip | AikiWeb Seminars | Cloudflare-blocked — revisit if access is resolved |

---

## Data Normalization Challenges

| Challenge | Sources Affected | Mitigation |
|-----------|-----------------|------------|
| Date format variations (DD/MM/YYYY, MM/DD/YYYY, Japanese) | All | Unified date parser with locale detection |
| Instructor name variations across languages | AikidoTravel, Aikikai | Fuzzy matching + normalization dictionary |
| Duplicate events across sources | AikidoTravel + USAF, Eurasia + EAF | Match on instructor + date + city combo |
| Geocoding city names to coordinates | All | Nominatim API with caching + manual overrides |
| Currency/fee format differences | All | Store as free text (no normalization needed) |
| Multilingual content (JP, FR, DE, TR) | Aikikai, EAF, Eurasia | Store original language + English translation |
