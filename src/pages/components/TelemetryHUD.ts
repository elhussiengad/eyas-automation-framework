import { Page, expect, Locator } from '@playwright/test';

/**
 * TelemetryHUD - asserts on the heads-up overlay during a drone mission.
 * Covers: GPS badge, last-fix age, altitude, battery, signal strength.
 */
export class TelemetryHUD {
    constructor(private readonly page: Page) {}

  gpsBadge(): Locator        { return this.page.getByTestId('hud-gps-badge'); }
    lastFixAge(): Locator      { return this.page.getByTestId('hud-last-fix-age'); }
    altitude(): Locator        { return this.page.getByTestId('hud-altitude'); }
    battery(): Locator         { return this.page.getByTestId('hud-battery'); }
    signalStrength(): Locator  { return this.page.getByTestId('hud-signal'); }
    linkStatus(): Locator      { return this.page.getByTestId('hud-link-status'); }

  async expectGpsLocked() {
        await expect(this.gpsBadge()).toHaveText(/GPS LOCK/i);
  }

  async expectGpsLost() {
        await expect(this.gpsBadge()).toHaveText(/GPS LOST/i, { timeout: 20_000 });
  }

  async expectBatteryAbove(percent: number) {
        const txt = await this.battery().innerText();
        const value = Number(txt.replace('%', ''));
        expect(value).toBeGreaterThanOrEqual(percent);
  }

  async expectLinkLost() {
        await expect(this.linkStatus()).toHaveText(/LINK LOST/i, { timeout: 20_000 });
  }
}
