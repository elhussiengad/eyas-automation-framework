# EYAS Remote Sensing — Test Cases Catalog

This document is the single source of truth for every test scenario covered (or planned) by the automation framework. Each row maps to a Playwright spec under `tests/`.

Legend — Type: UI | API | Integration | Chaos. Priority: P1 (blocker) | P2 (high) | P3 (nice-to-have).

---

## 1. Drone Module

### 1.1 Query Builder — Drone Wizard

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| DR-QB-01 | Create query with Stream video, Optical primary, single drone | UI | P1 | Positive |
| DR-QB-02 | Create query with Recorded video and time range filter | UI | P1 | Positive |
| DR-QB-03 | Add Secondary video (Thermal) alongside Optical primary | UI | P2 | Positive |
| DR-QB-04 | Submit wizard with empty Mission Name | UI | P1 | Negative |
| DR-QB-05 | Submit wizard with end date earlier than start date | UI | P1 | Negative |
| DR-QB-06 | Mission Name with 256+ characters truncates to limit | UI | P3 | Edge |
| DR-QB-07 | Mission Name with Arabic + emoji renders RTL correctly | UI | P2 | Edge |
| DR-QB-08 | Domain dropdown loads >500 entries without UI freeze | UI | P2 | Edge |
| DR-QB-09 | Wizard recovers state after browser refresh mid-flow | UI | P2 | Real-world |
| DR-QB-10 | Network drop on Step 3 surfaces retry banner | Chaos | P1 | Real-world |

### 1.2 Live Streaming

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| DR-LS-01 | Start live stream from selected drone within 5s | UI | P1 | Positive |
| DR-LS-02 | Pause / resume live stream preserves timeline cursor | UI | P2 | Positive |
| DR-LS-03 | Switch primary feed Optical → Thermal mid-stream | UI | P2 | Positive |
| DR-LS-04 | Stream auto-reconnects after WebSocket drop (<10s) | Chaos | P1 | Real-world |
| DR-LS-05 | High-latency network (>800ms) shows degraded badge | Chaos | P2 | Real-world |
| DR-LS-06 | Hardware failure event freezes feed and emits alert | Chaos | P1 | Real-world |
| DR-LS-07 | Concurrent viewers (>10) do not desync timestamps | Integration | P3 | Edge |

### 1.3 Telemetry HUD

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| DR-TM-01 | HUD displays altitude, speed, heading, battery | UI | P1 | Positive |
| DR-TM-02 | Battery <15% triggers warning color and toast | UI | P1 | Positive |
| DR-TM-03 | GPS loss event hides coordinates and shows fallback | Chaos | P1 | Real-world |
| DR-TM-04 | Altitude exceeding ceiling logs an audit event | Integration | P2 | Edge |
| DR-TM-05 | HUD survives 30-minute idle without memory leak | UI | P3 | Real-world |

### 1.4 Rule Engine (Drone)

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| DR-RE-01 | Create rule: alert when battery < 20% | UI | P1 | Positive |
| DR-RE-02 | Edit existing rule and verify version bump | UI | P2 | Positive |
| DR-RE-03 | Delete rule requires confirmation modal | UI | P2 | Negative |
| DR-RE-04 | Rule with conflicting conditions is rejected | UI | P1 | Negative |
| DR-RE-05 | Rule fires within 2s of matching telemetry event | Integration | P1 | Real-world |

---

## 2. Satellite Module

### 2.1 Query Builder — Satellite

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| ST-QB-01 | Create query by AOI polygon and date range | UI | P1 | Positive |
| ST-QB-02 | Create query by satellite pass ID | UI | P1 | Positive |
| ST-QB-03 | Filter by cloud cover < 20% | UI | P2 | Positive |
| ST-QB-04 | AOI with self-intersecting polygon rejected | UI | P1 | Negative |
| ST-QB-05 | Date range exceeding archive window shows warning | UI | P2 | Edge |
| ST-QB-06 | AOI spanning antimeridian returns valid tiles | UI | P2 | Edge |
| ST-QB-07 | Tile server timeout falls back to cached preview | Chaos | P1 | Real-world |

### 2.2 Live Monitoring (Satellite Pass)

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| ST-LM-01 | Upcoming passes list refreshes every 60s | UI | P1 | Positive |
| ST-LM-02 | Subscribe to pass alert delivers notification | Integration | P2 | Positive |
| ST-LM-03 | Pass marked complete after end-time elapsed | UI | P2 | Positive |
| ST-LM-04 | TLE feed outage surfaces stale-data banner | Chaos | P1 | Real-world |

### 2.3 Content Manager

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| ST-CM-01 | Browse imagery results with infinite scroll | UI | P1 | Positive |
| ST-CM-02 | Open image detail and inspect EXIF/metadata | UI | P2 | Positive |
| ST-CM-03 | Bulk-tag selection of >20 items | UI | P2 | Positive |
| ST-CM-04 | Search returning zero results renders empty state | UI | P3 | Negative |
| ST-CM-05 | Corrupted thumbnail shows placeholder, not crash | UI | P2 | Edge |

---

## 3. Cross-Module Integration

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| INT-01 | Drone telemetry overlay rendered on satellite map | Integration | P1 | Real-world |
| INT-02 | Single query references both Drone and Satellite assets | Integration | P1 | Positive |
| INT-03 | Ticket created from Drone alert links Satellite context | Integration | P2 | Positive |
| INT-04 | Auth token refresh works across both modules in one session | Integration | P1 | Positive |

---

## 4. API Layer

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| API-AU-01 | POST /auth/login returns 200 + JWT for valid analyst | API | P1 | Positive |
| API-AU-02 | POST /auth/login returns 401 for wrong password | API | P1 | Negative |
| API-AU-03 | Expired token returns 401 and triggers refresh flow | API | P1 | Negative |
| API-QY-01 | POST /queries (drone) creates and returns id | API | P1 | Positive |
| API-QY-02 | POST /queries with malformed payload returns 422 | API | P1 | Negative |
| API-QY-03 | GET /queries/:id of another tenant returns 403 | API | P1 | Negative |
| API-QY-04 | List queries paginates and respects page-size cap | API | P2 | Edge |

---

## 5. Chaos / Resilience Suite

| ID | Title | Type | Priority | Category |
|----|-------|------|----------|----------|
| CH-01 | GPS loss for 30s — UI degrades gracefully | Chaos | P1 | Real-world |
| CH-02 | API latency injection 2s — no spinner stuck > 10s | Chaos | P1 | Real-world |
| CH-03 | Backend 500 on /queries — error boundary + retry | Chaos | P1 | Real-world |
| CH-04 | Hardware failure simulated — drone marked offline | Chaos | P1 | Real-world |
| CH-05 | WebSocket drop during live stream — auto-reconnect | Chaos | P1 | Real-world |
| CH-06 | Tile server 503 — fallback cached tiles served | Chaos | P2 | Real-world |

---

## Coverage Map

- Drone: 27 cases (10 QB + 7 LS + 5 TM + 5 RE)
- - Satellite: 16 cases (7 QB + 4 LM + 5 CM)
  - - Integration: 4 cases
    - - API: 7 cases
      - - Chaos: 6 cases
       
        - **Total: 60 documented test cases** — covering Positive, Negative, Edge and Real-world failures across UI, API, Integration and Chaos layers.
        - 
