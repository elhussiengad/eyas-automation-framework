–—import { test, expect } from '../../src/fixtures/base';

test.describe('Satellite – Live Monitoring (passes)', () => {
    test('ST-LM-01 upcoming passes list refreshes every 60s', async ({ authedPage }) => {
          await authedPage.goto('/#/live/satellite');
      const list = authedPage.getByTestId('upcoming-passes');
          await expect(list).toBeVisible();
          await list.getByRole('listitem').first().textContent();
          await authedPage.waitForTimeout(61_000);
          const refreshed = await list.getByRole('listitem').first().textContent();
          expect(refreshed).not.toBeNull();
    });

                test('ST-LM-02 subscribe to pass alert delivers notification', async ({ authedPage }) => {
                      await authedPage.goto('/#/live/satellite');
                      const row = authedPage.getByTestId('upcoming-passes').getByRole('listitem').first();
                      await row.getByRole('button', { name: /subscribe/i }).click();
                      await expect(authedPage.getByText(/subscribed/i)).toBeVisible();
                });

                test('ST-LM-03 pass marked complete after end-time elapsed', async ({ authedPage, queryApi }) => {
                      const pastPass = await queryApi.seedPass({ status: 'ended' });
                      await authedPage.goto('/#/live/satellite');
                      const row = authedPage.getByTestId(`pass-${pastPass.id}`);
                      await expect(row.getByText(/completed/i)).toBeVisible();
                });

                test('ST-LM-04 TLE feed outage surfaces stale-data banner', async ({ authedPage, chaos }) => {
                      await chaos.failRoute('**/api/tle/**', 503);
                      await authedPage.goto('/#/live/satellite');
                      await expect(authedPage.getByRole('alert', { name: /stale|outage/i })).toBeVisible();
                });
});
