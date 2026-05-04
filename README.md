# eyas-automation-framework

Production-ready **Playwright + TypeScript** end-to-end automation framework for the **EYAS Remote Sensing** platform (Satellite & Drone modules).

---

## 1. System breakdown

- **Satellite Module** - orbital imagery: AOI tasking, multi-spectral, scheduled, raster heavy.
- - **Drone Module** - UAV missions: live RTSP/WebRTC streams, recorded clips, geofenced, telemetry rich.
 
  - Shared modules tested against both: Workspace, Query Builder, Query Manager, Content Manager, Tickets, Geo Video Search, Auth/RBAC, Map engine, Notifications, Export.
 
  - ## 2. Feature mapping
 
  - ### Satellite
  - Generate New Query, AOI Drawing (rect/poly/point), Sensor (Optical/SAR/Thermal/Multispectral), Domain, Acquisition window, Cloud-cover threshold, Processing pipeline (atmospheric correction, NDVI, change detection), Rule Engine, Result viewer, Export (GeoTIFF/KMZ/PDF).
 
  - Critical paths: AOI -> Sensor -> Acquisition -> Create Query, result delivery, geo-referenced export integrity.
 
  - ### Drone
  - Generate New Query (drone wizard: Video / Processing / Rule Engine), Mission Name, Drone selector, Primary/Secondary Video (Optical/Thermal/IR), Stream URL, Live player + telemetry HUD, Mission map, Recorded archive, Geo Video Search, Tickets per frame.
 
  - Critical paths: Drone -> Stream URL -> live render with <2s glass-to-glass; Rule Engine alert -> Ticket; telemetry continuity during GPS / signal loss.
 
  - ## 3. Test architecture
 
  - ```
    Remote Sensing QA Suite
      00_Cross-Cutting     (Auth, RBAC, Map, Notifications, Exports)
      01_Satellite         (Query Builder, Query Manager, Result Viewer, Export)
      02_Drone             (Query Builder, Live Streaming, Recorded, Geo Video Search)
      03_Content_Manager   (Query Results, Visualization, Videos)
      04_Tickets           (Create / Assign / Link)
    ```

    Test types: UI, API, Integration, WebSocket. Priority: High / Medium / Low.

    ## 4. Test cases

    IDs follow `TC-<MODULE>-<FEATURE>-<NN>`. Each feature has positive, negative, edge, and real-world (GPS loss, latency, hardware failure) cases. Examples:

    - TC-DRN-QB-02 happy path drone streaming mission
    - - TC-DRN-QB-11 stream unreachable surfaces banner
      - - TC-DRN-LIVE-RW-01 GPS loss freezes track but keeps video
        - - TC-DRN-LIVE-RW-02 latency spike triggers LIVE-Ns indicator
          - - TC-DRN-LIVE-RW-03 heartbeat lost -> Link Lost
            - - TC-SAT-QB-01 happy path rectangle AOI + Optical
              - - TC-SAT-QB-04 missing AOI validation
                - - TC-SAT-QB-05 inverted date range error
                 
                  - ## 5. Framework layout
                 
                  - ```
                    playwright.config.ts        # multi-browser, parallel, Allure+HTML
                    tsconfig.json               # path aliases @pages, @api, @fixtures...
                    .github/workflows/e2e.yml   # CI: matrix sharding, Allure publish
                    src/
                      api/                      # AuthApi, QueryApi (+ DroneApi/SatelliteApi/TicketApi)
                      fixtures/base.ts          # extends Playwright test with POMs and chaos
                      pages/
                        BasePage.ts
                        queryBuilder/DroneQueryForm.ts
                        queryBuilder/SatelliteQueryForm.ts
                        components/VideoPlayer.ts
                        components/TelemetryHUD.ts
                      utils/chaos.ts            # latency, GPS loss, throttle, heartbeat
                    tests/
                      drone/query-builder.spec.ts
                      drone/live-streaming.spec.ts
                      satellite/query-builder.spec.ts
                    ```

                    Design principles:
                    - **POM** with role/label-based locators (no brittle CSS).
                    - - **Fixtures** inject authenticated page, POMs, and `chaos` helpers.
                      - - **Chaos engineering** as a first-class citizen for remote-sensing failure modes.
                        - - **No secrets** in code: env vars only, loaded via `dotenv`.
                         
                          - ## 6. Running locally
                         
                          - ```bash
                            npm ci
                            npx playwright install --with-deps
                            cp .env.example .env       # then fill credentials
                            npx playwright test
                            npx playwright test --project=chromium tests/drone
                            npx playwright show-report reports/html
                            ```

                            ## 7. CI/CD & reporting

                            - **GitHub Actions** (`.github/workflows/e2e.yml`): matrix of `chromium / firefox / webkit` x 4 shards, nightly cron + push + PR + manual.
                            - - Artifacts uploaded per shard: HTML report, Allure results, traces on failure.
                              - - Allure report aggregated and published to GitHub Pages on `main`.
                                - - Repository secrets required: `BASE_URL`, `API_URL`, `ANALYST_USER`, `ANALYST_PASS`, `ADMIN_USER`, `ADMIN_PASS`.
                                 
                                  - ## 8. QA Lead review
                                 
                                  - **Strengths**: clear module split, real-world chaos baked into fixtures, role-based auth via API, multi-browser sharding, Allure history.
                                 
                                  - **Improvements to add**:
                                  - - Visual regression (Percy/Argos) on map and result viewer.
                                    - - API contract tests (Pact) between FE and tasking service.
                                      - - Mock satellite tile server for deterministic geo tests.
                                        - - Network HAR replay for offline / air-gapped runs.
                                          - - Accessibility (axe) gate on PRs.
                                            - - Arabic RTL coverage (the app's map labels are Arabic).
                                              - - Lighthouse perf budget on the map page.
                                                - - k6 load tests on Query Manager.
                                                  - - Dedicated `chaos.spec.ts` smoke suite running every 15 min in staging.
                                                    - - App-side: introduce `data-testid` audit so locators stop relying on regex labels.
                                                      - 
