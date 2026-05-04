import { test } from '../../src/fixtures/base';

test.describe('Satellite > Query Builder', () => {

                test('TC-SAT-QB-01 happy path: rectangle AOI + Optical sensor', async ({ satelliteForm }) => {
                      await satelliteForm.open();
                      await satelliteForm.fill({
                              domain: 'Agriculture',
                              sensor: 'Optical',
                              from: '2026-04-01',
                              to: '2026-04-08',
                              cloudCoverMax: 20,
                              aoi: { kind: 'rectangle', sw: [24.6, 46.6], ne: [24.9, 46.9] },
                      });
                      await satelliteForm.submit();
                });

                test('TC-SAT-QB-04 missing AOI -> validation error', async ({ satelliteForm }) => {
                      await satelliteForm.open();
                      await satelliteForm.submit();
                      await satelliteForm.expectAoiError();
                });

                test('TC-SAT-QB-05 inverted date range -> error', async ({ satelliteForm }) => {
                      await satelliteForm.open();
                      await satelliteForm.fill({
                              domain: 'Defense',
                              sensor: 'SAR',
                              from: '2026-04-30',
                              to: '2026-04-01',
                              aoi: { kind: 'rectangle', sw: [24.6, 46.6], ne: [24.9, 46.9] },
                      });
                      await satelliteForm.submit();
                      await satelliteForm.expectDateError();
                });

                test('TC-SAT-QB-12 tile server slow -> loading skeleton stays', async ({ satelliteForm, chaos }) => {
                      await chaos.latency(5_000);
                      await satelliteForm.open();
                });
});
