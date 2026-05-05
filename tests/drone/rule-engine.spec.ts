–import { test, expect } from '../../src/fixtures/base';

test.describe('Drone – Rule Engine', () => {
    test('DR-RE-01 create rule: alert when battery < 20%', async ({ authedPage }) => {
          await authedPage.goto('/#/rules/drone');
          await authedPage.getByRole('button', { name: /new rule/i }).click();
          await authedPage.getByRole('textbox', { name: /name/i }).fill('Low battery alert');
          await authedPage.getByRole('combobox', { name: /metric/i }).selectOption('battery');
          await authedPage.getByRole('combobox', { name: /operator/i }).selectOption('<');
          await authedPage.getByRole('spinbutton', { name: /threshold/i }).fill('20');
          await authedPage.getByRole('button', { name: /save/i }).click();
          await expect(authedPage.getByText(/Low battery alert/)).toBeVisible();
    });

                test('DR-RE-02 edit existing rule and verify version bump', async ({ authedPage, queryApi }) => {
                      const rule = await queryApi.seedRule({ metric: 'battery', threshold: 25 });
                      await authedPage.goto(`/#/rules/drone/${rule.id}`);
                      await authedPage.getByRole('spinbutton', { name: /threshold/i }).fill('15');
                      await authedPage.getByRole('button', { name: /save/i }).click();
                      await expect(authedPage.getByTestId('rule-version')).toContainText(/v2/);
                });

                test('DR-RE-03 delete rule requires confirmation modal', async ({ authedPage, queryApi }) => {
                      const rule = await queryApi.seedRule({ metric: 'altitude', threshold: 500 });
                      await authedPage.goto(`/#/rules/drone/${rule.id}`);
                      await authedPage.getByRole('button', { name: /delete/i }).click();
                      await expect(authedPage.getByRole('dialog', { name: /confirm/i })).toBeVisible();
                      await authedPage.getByRole('button', { name: /confirm/i }).click();
                      await expect(authedPage.getByText(/deleted/i)).toBeVisible();
                });

                test('DR-RE-04 conflicting conditions are rejected', async ({ authedPage }) => {
                      await authedPage.goto('/#/rules/drone/new');
                      await authedPage.getByRole('textbox', { name: /name/i }).fill('Bad rule');
                      await authedPage.getByRole('button', { name: /add condition/i }).click();
                      await authedPage.getByRole('combobox', { name: /metric/i }).first().selectOption('battery');
                      await authedPage.getByRole('combobox', { name: /operator/i }).first().selectOption('>');
                      await authedPage.getByRole('spinbutton', { name: /threshold/i }).first().fill('80');
                      await authedPage.getByRole('button', { name: /add condition/i }).click();
                      await authedPage.getByRole('combobox', { name: /metric/i }).nth(1).selectOption('battery');
                      await authedPage.getByRole('combobox', { name: /operator/i }).nth(1).selectOption('<');
                      await authedPage.getByRole('spinbutton', { name: /threshold/i }).nth(1).fill('20');
                      await authedPage.getByRole('button', { name: /save/i }).click();
                      await expect(authedPage.getByRole('alert', { name: /conflict/i })).toBeVisible();
                });

                test('DR-RE-05 rule fires within 2s of matching telemetry', async ({ authedPage, chaos, queryApi }) => {
                      const rule = await queryApi.seedRule({ metric: 'battery', threshold: 20 });
                      await authedPage.goto('/#/live/drone');
                      const start = Date.now();
                      await chaos.injectTelemetry({ battery: 15 });
                      await expect(authedPage.getByRole('alert', { name: new RegExp(rule.name, 'i') })).toBeVisible({ timeout: 2500 });
                      expect(Date.now() - start).toBeLessThan(2500);
                });
});
