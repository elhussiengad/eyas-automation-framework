import { Page } from '@playwright/test';

/**
 * Chaos engineering helpers for remote-sensing real-world scenarios.
 */

export async function injectLatency(page: Page, ms: number) {
    await page.route('**/*', async route => {
          await new Promise(r => setTimeout(r, ms));
          await route.continue();
    });
}

export async function dropWebSocket(page: Page, urlPattern: RegExp) {
    await page.route(urlPattern, route => route.abort());
}

export async function simulateGpsLoss(page: Page) {
    await page.evaluate(() => {
          const w = window as any;
          w.__gpsLostUntil = Date.now() + 15_000;
          w.dispatchEvent(new CustomEvent('telemetry:gps-lost'));
    });
}

export async function throttleNetwork(page: Page, downloadKbps: number) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', {
          offline: false,
          downloadThroughput: (downloadKbps * 1024) / 8,
          uploadThroughput:   (downloadKbps * 1024) / 8,
          latency: 100,
    });
}

export async function killDroneHeartbeat(page: Page) {
    await page.route(/\/heartbeat/, route => route.abort());
}

export async function restoreNetwork(page: Page) {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
}
