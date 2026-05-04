import { test, expect } from '../../src/fixtures/base';

test.describe('Drone > Live streaming - real-world scenarios', () => {

                test('TC-DRN-LIVE-RW-01 GPS loss freezes track but keeps video', async ({ authedPage, videoPlayer, telemetry, chaos }) => {
                      await authedPage.goto('/#/workspace?mission=demo-1');
                      await videoPlayer.expectPlaying();
                      await telemetry.expectGpsLocked();
                      await chaos.gpsLoss();
                      await telemetry.expectGpsLost();
                      await videoPlayer.expectAdvancing();
                });

                test('TC-DRN-LIVE-RW-02 latency spike triggers LIVE-Ns indicator', async ({ authedPage, videoPlayer, chaos }) => {
                      await authedPage.goto('/#/workspace?mission=demo-2');
                      await videoPlayer.expectPlaying();
                      await chaos.latency(3_000);
                      await videoPlayer.expectLatencyIndicator(/LIVE-\ds/);
                });

                test('TC-DRN-LIVE-RW-03 hardware failure: heartbeat lost -> Link Lost', async ({ authedPage, telemetry, chaos }) => {
                      await authedPage.goto('/#/workspace?mission=demo-3');
                      await chaos.killHeart();
                      await telemetry.expectLinkLost();
                });

                test('TC-DRN-LIVE-RW-04 token expiry refreshes silently', async ({ authedPage, videoPlayer }) => {
                      await authedPage.goto('/#/workspace?mission=demo-4');
                      await authedPage.evaluate(() => localStorage.setItem('auth_token', 'expired'));
                      await authedPage.waitForTimeout(1_500);
                      await expect(authedPage).not.toHaveURL(/login/);
                      await videoPlayer.expectPlaying();
                });
});
