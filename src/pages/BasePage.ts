import { Page, expect, Locator } from '@playwright/test';

/**
 * BasePage - shared utilities for all Page Objects.
 * Provides safe interactions, toast assertions, and idle waits.
 */
export abstract class BasePage {
    constructor(protected readonly page: Page) {}

  protected async safeClick(loc: Locator) {
        await loc.waitFor({ state: 'visible' });
        await loc.scrollIntoViewIfNeeded();
        await loc.click();
  }

  async expectToast(text: string | RegExp) {
        await expect(this.page.getByRole('status').filter({ hasText: text })).toBeVisible();
  }

  async waitForIdle() {
        await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshotOnFailure(name: string) {
        return this.page.screenshot({ path: `reports/screenshots/${name}-${Date.now()}.png`, fullPage: true });
  }
}
