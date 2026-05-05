—–——import { test, expect } from '../../src/fixtures/base';

/**
 * Chaos / Resilience suite — simulates real-world remote-sensing failures.
 * Run only on `chaos` project (see playwright.config.ts).
 */
test.describe('Chaos – Resilience', () => {
    test('CH-01 GPS loss for 30s degrades gracefully', async ({ authedPage, chaos }) => {
          await authedPage.goto('/#/live/drone');
          await chaos.gpsLoss(30);
          await expect(authedPage.getByRole('alert', { name: /gps/i })).toBeVisible({ timeout: 5000 });
          await expect(authedPage.getByTestId('telemetry-hud')).toBeVisible();
    });

                test('CH-02 API latency 2s — no spinner stuck > 10s', async ({ authedPage, chaos }) => {
                      await chaos.injectLatency('**/api/queries**', 2000);
                      await authedPage.goto('/#/query-manager');
                      const spinner = authedPage.getByTestId('global-spinner');
                      await expect(spinner).toBeVisible();
                      await expect(spinner).toBeHidden({ timeout: 10_000 });
                });

                test('CH-03 Backend 500 on /queries triggers error boundary + retry', async ({ authedPage, chaos }) => {
                      await chaos.failRoute('**/api/queries**', 500);
                      await authedPage.goto('/#/query-manager');
                      await expect(authedPage.getByRole('alert', { name: /something went wrong|retry/i })).toBeVisible();
                      await chaos.restoreAll();
                      await authedPage.getByRole('button', { name: /retry/i }).click();
                      await expect(authedPage.getByTestId('query-list')).toBeVisible();
                });

                test('CH-04 Hardware failure marks drone offline', async ({ authedPage, chaos }) => {
                      await chaos.hardwareFailure('drone-001');
                      await authedPage.goto('/#/live/drone');
                      await expect(authedPage.getByTestId('drone-status-drone-001')).toContainText(/offline/i);
                });

                test('CH-05 WebSocket drop during live stream auto-reconnects', async ({ authedPage, chaos }) => {
                      await authedPage.goto('/#/live/drone');
                      await expect(authedPage.getByTestId('video-player')).toBeVisible();
                      await chaos.dropWebSocket();
                      await expect(authedPage.getByTestId('reconnect-banner')).toBeVisible();
                      await expect(authedPage.getByTestId('reconnect-banner')).toBeHidden({ timeout: 10_000 });
                });

                test('CH-06 Tile server 503 — fallback cached tiles served', async ({ authedPage, chaos }) => {
                      await chaos.failRoute('**/tiles/**', 503);
                      await authedPage.goto('/#/map');
                      await expect(authedPage.getByTestId('cached-tile-banner')).toBeVisible();
                      await expect(authedPage.getByRole('img', { name: /tile/i }).first()).toBeVisible();
                });
});
