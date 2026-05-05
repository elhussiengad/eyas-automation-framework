–import { test, expect } from '../../src/fixtures/base';

test.describe('Satellite – Content Manager', () => {
    test('ST-CM-01 browse imagery results with infinite scroll', async ({ authedPage }) => {
          await authedPage.goto('/#/query-builder/content-manager');
          const grid = authedPage.getByTestId('imagery-grid');
          await expect(grid).toBeVisible();
          const initial = await grid.getByRole('img').count();
          await authedPage.mouse.wheel(0, 4000);
          await authedPage.waitForTimeout(1500);
          const after = await grid.getByRole('img').count();
          expect(after).toBeGreaterThan(initial);
    });

                test('ST-CM-02 open image detail and inspect metadata', async ({ authedPage }) => {
                      await authedPage.goto('/#/query-builder/content-manager');
                      await authedPage.getByTestId('imagery-grid').getByRole('img').first().click();
                      await expect(authedPage.getByRole('dialog', { name: /image details/i })).toBeVisible();
                      await expect(authedPage.getByText(/captured/i)).toBeVisible();
                      await expect(authedPage.getByText(/sensor/i)).toBeVisible();
                });

                test('ST-CM-03 bulk-tag selection of >20 items', async ({ authedPage }) => {
                      await authedPage.goto('/#/query-builder/content-manager');
                      const checkboxes = authedPage.getByTestId('imagery-grid').getByRole('checkbox');
                      const count = Math.min(await checkboxes.count(), 25);
                      for (let i = 0; i < count; i++) await checkboxes.nth(i).check();
                      await authedPage.getByRole('button', { name: /bulk tag/i }).click();
                      await authedPage.getByRole('textbox', { name: /tag/i }).fill('mission-2026');
                      await authedPage.getByRole('button', { name: /apply/i }).click();
                      await expect(authedPage.getByText(/tagged/i)).toBeVisible();
                });

                test('ST-CM-04 zero results renders empty state', async ({ authedPage }) => {
                      await authedPage.goto('/#/query-builder/content-manager?q=__none__');
                      await expect(authedPage.getByText(/no results/i)).toBeVisible();
                });

                test('ST-CM-05 corrupted thumbnail shows placeholder', async ({ authedPage, chaos }) => {
                      await chaos.failRoute('**/thumbnails/**', 500);
                      await authedPage.goto('/#/query-builder/content-manager');
                      await expect(authedPage.getByTestId('thumb-fallback').first()).toBeVisible();
                });
});
