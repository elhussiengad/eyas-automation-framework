import { expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export type Sensor = 'Optical' | 'SAR' | 'Thermal' | 'Multispectral';
export type Domain = 'Agriculture' | 'Defense' | 'Environment' | 'Urban';

export type AOI =
    | { kind: 'rectangle'; sw: [number, number]; ne: [number, number] }
  | { kind: 'polygon';   coords: [number, number][] }private readonly toDate       = this.page.getByLabel(/to/i);
  private readonly cloudInput   = this.page.getByLabel(/cloud cover/i);
  private readonly drawRect     = this.page.getByRole('button', { name: /draw rectangle/i });
  private readonly drawPoly     = this.page.getByRole('button', { name: /draw polygon/i });
  private readonly createBtn    = this.page.getByRole('button', { name: /create query/i });
  private readonly mapCanvas    = this.page.locator('canvas').first();

  async open() {
        await this.page.goto('/#/query-builder/generate-query?type=satellite');
        await expect(this.page.getByRole('heading', { name: /generate new query/i })).toBeVisible();
  }

  async fill(input: SatelliteQueryInput) {
        await this.domainSelect.click();
        await this.page.getByRole('option', { name: input.domain }).click();

        await this.sensorSelect.click();
        await this.page.getByRole('option', { name: input.sensor }).click();

        await this.fromDate.fill(input.from);
        await this.toDate.fill(input.to);
        if (input.cloudCoverMax !== undefined) await this.cloudInput.fill(String(input.cloudCoverMax));

              await this.drawAoi(input.aoi);
  }

  private async drawAoi(aoi: AOI) {
        if (aoi.kind === 'rectangle') {
                await this.drawRect.click();
                const box = await this.mapCanvas.boundingBox();
                if (!box) throw new Error('Map canvas missing');
                        await this.page.mouse.move(box.x + 100, box.y + 100);
                await this.page.mouse.down();
                await this.page.mouse.move(box.x + 300, box.y + 250);
                await this.page.mouse.up();
        } else if (aoi.kind === 'polygon') {
                await this.drawPoly.click();
                const box = await this.mapCanvas.boundingBox();
                if (!box) throw new Error('Map canvas missing');
                        for (const [x, y] of aoi.coords) await this.page.mouse.click(box.x + x, box.y + y);
                await this.page.keyboard.press('Enter');
        } else {
                const box = await this.mapCanvas.boundingBox();
                if (!box) throw new Error('Map canvas missing');
                        await this.page.mouse.click(box.x + aoi.at[0], box.y + aoi.at[1]);
        }
  }

  async submit() { await this.createBtn.click(); }
  async expectAoiError() { await expect(this.page.getByTestId('error-aoi')).toBeVisible(); }
  async expectDateError() { await expect(this.page.getByTestId('error-date')).toBeVisible(); }
}

  | { kind: 'point';     at: [number, number] };

export type SatelliteQueryInput = {
    domain: Domain;
    aoi: AOI;
    sensor: Sensor;
    from: string; // ISO date
    to: string;   // ISO date
    cloudCoverMax?: number; // 0-100
};

export class SatelliteQueryForm extends BasePage {
    private readonly domainSelect = this.page.getByLabel('Domain');
    private readonly sensorSelect = this.page.getByLabel(/sensor/i);
    private readonly fromDate     = this.page.getByLabel(/from/i);
    
