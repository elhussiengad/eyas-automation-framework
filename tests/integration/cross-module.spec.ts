–import { test, expect } from '../../src/fixtures/base';

test.describe('Integration – Cross Module (Drone + Satellite)', () => {
    test('INT-01 drone telemetry overlay rendered on satellite map', async ({ authedPage, queryApi }) => {
          const drone = await queryApi.seedDrone({ active: true });
          await authedPage.goto('/#/map');
          await authedPage.getByRole('checkbox', { name: /show drones/i }).check();
          await expect(authedPage.getByTestId(`drone-marker-${drone.id}`)).toBeVisible();
    });

                test('INT-02 single query references both Drone and Satellite assets', async ({ authedPage, queryApi }) => {
                      const query = await queryApi.createMixedQuery();
                      await authedPage.goto(`/#/query-manager/${query.id}`);
                      await expect(authedPage.getByText(/drone:/i)).toBeVisible();
                      await expect(authedPage.getByText(/satellite:/i)).toBeVisible();
                });

                test('INT-03 ticket created from drone alert links satellite context', async ({ authedPage, queryApi }) => {
                      const alert = await queryApi.seedAlert({ source: 'drone', linkedSatPass: 'PASS-42' });
                      await authedPage.goto(`/#/alerts/${alert.id}`);
                      await authedPage.getByRole('button', { name: /create ticket/i }).click();
                      await authedPage.getByRole('button', { name: /confirm/i }).click();
                      await expect(authedPage.getByText('PASS-42')).toBeVisible();
                });

                test('INT-04 auth token refresh works across both modules in one session', async ({ authedPage, authApi }) => {
                      await authedPage.goto('/#/live/drone');
                      await expect(authedPage.getByTestId('telemetry-hud')).toBeVisible();
                      await authApi.expireCurrentToken();
                      await authedPage.goto('/#/live/satellite');
                      await expect(authedPage.getByTestId('upcoming-passes')).toBeVisible();
                });
});
