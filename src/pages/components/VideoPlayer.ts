import { Page, expect } from '@playwright/test';

export class VideoPlayer {
    constructor(private readonly page: Page) {}

  private readonly video = this.page.locator('video[data-testid="live-stream"]').first();
    private readonly liveBadge = this.page.getByTestId('live-indicator');

  async expectPlaying() {
        await expect(this.video).toBeVisible();
        const paused = await this.video.evaluate((v: HTMLVideoElement) => v.paused);
        expect(paused, 'video must be playing').toBe(false);
  }

  async expectPaused() {
        const paused = await this.video.evaluate((v: HTMLVideoElement) => v.paused);
        expect(paused).toBe(true);
  }

  async expectLatencyIndicator(pattern: RegExp) {
        await expect(this.liveBadge).toHaveText(pattern);
  }

  async getCurrentTime() {
        return this.video.evaluate((v: HTMLVideoElement) => v.currentTime);
  }

  async expectAdvancing() {
        const t1 = await this.getCurrentTime();
        await this.page.waitForTimeout(2_000);
        const t2 = await this.getCurrentTime();
        expect(t2, `video should advance, was ${t1} -> ${t2}`).toBeGreaterThan(t1);
  }
}
