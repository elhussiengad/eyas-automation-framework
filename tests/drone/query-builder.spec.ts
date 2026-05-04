import { test, expect } from '../../src/fixtures/base';

test.describe('Drone > Query Builder', () => {

                test('TC-DRN-QB-02 happy path: create streaming mission', async ({ droneForm, authedPage }) => {
                      await droneForm.open();
                      await droneForm.fill({
                              missionName: `Riyadh-North-${Date.now()}`,
                              domain: 'Agriculture',
                              drone: 'DJI-M300-A1',
                              primary: 'Optical',
                              mode: 'STREAM',
                      });
                      await droneForm.expectStreamUrlResolved();
                      await droneForm.submit();
                      await expect(authedPage).toHaveURL(/query-manager/);
                });

                test('TC-DRN-QB-05 mission name is required', async ({ droneForm }) => {
                      await droneForm.open();
                      await droneForm.expectCreateDisabled();
                });

                test('TC-DRN-QB-07 sanitizes XSS in mission name', async ({ droneForm }) => {
                      await droneForm.open();
                      await droneForm.fill({
                              missionName: '<script>alert(1)</script>',
                              domain: 'Defense',
                              drone: 'DJI-M300-A1',
                              primary: 'Optical',
                              mode: 'STREAM',
                      });
                      await droneForm.submit();
                      await droneForm.expectFieldError('mission');
                });

                test('TC-DRN-QB-11 stream unreachable surfaces banner', async ({ droneForm, chaos }) => {
                      await chaos.dropStream();
                      await droneForm.open();
                      await droneForm.fill({
                              missionName: 'unreachable-stream',
                              domain: 'Defense',
                              drone: 'DJI-M300-A1',
                              primary: 'Optical',
                              mode: 'STREAM',
                      });
                      await droneForm.submit();
                      await droneForm.expectToast(/stream unreachable/i);
                });
});
