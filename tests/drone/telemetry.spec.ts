–import { test, expect } from '../../src/fixtures/base';

test.describe('Drone – Telemetry HUD', () => {
    test('DR-TM-01 HUD displays altitude, speed, heading, battery', async ({ authedPage }) => {
          await authedPage.goto('/#/live/drone');
          const hud = authedPage.getByTestId('telemetry-hud');
          await expect(hud.getByTestId('altitude')).toBeVisible();
          await expect(hud.getByTestId('speed')).toBeVisible();
          await expect(hud.getByTestId('heading')).toBeVisible();
          await expect(hud.getByTestId('battery')).toBeVisible();
    });

                test('DR-TM-02 battery <15% triggers warning', async ({ authedPage, chaos }) => {
                      await chaos.injectTelemetry({ battery: 12 });
                      await authedPage.goto('/#/live/drone');
                      await expect(authedPage.getByTestId('battery')).toHaveAttribute('data-state', 'warning');
                      await expect(authedPage.getByRole('alert', { name: /low battery/i })).toBeVisible();
                });

                test('DR-TM-03 GPS loss hides coordinates and shows fallback', async ({ authedPage, chaos }) => {
                      await chaos.gpsLoss(30);
                      await authedPage.goto('/#/live/drone');
                      await expect(authedPage.getByTestId('coordinates')).toHaveText(/no signal|--/i);
                      await expect(authedPage.getByRole('alert', { name: /gps/i })).toBeVisible();
                });

                test('DR-TM-04 altitude exceeding ceiling logs audit event', async ({ authedPage, chaos, queryApi }) => {
                      await chaos.injectTelemetry({ altitude: 9999 });
                      await authedPage.goto('/#/live/drone');
                      const audit = await queryApi.getAuditEvents({ type: 'altitude_breach' });
                      expect(audit.length).toBeGreaterThan(0);
                });

                test('DR-TM-05 HUD survives 30-min idle without memory leak', async ({ authedPage }) => {
                      test.slow();
                      await authedPage.goto('/#/live/drone');
                      const before = await authedPage.evaluate(() => (performance as any).memory?.usedJSHeapSize ?? 0);
                      await authedPage.waitForTimeout(30 * 60 * 1000);
                      const after = await authedPage.evaluate(() => (performance as any).memory?.usedJSHeapSize ?? 0);
                      if (before && after) expect(after).toBeLessThan(before * 2);
                });
});
