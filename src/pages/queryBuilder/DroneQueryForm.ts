import { Page, expect } from '@playwright/test';
import { BasePage } from '../BasePage';

export type DroneQueryInput = {
    missionName: string;
    domain: 'Agriculture' | 'Defense' | 'Environment' | 'Urban';
    drone: string;
    primary: 'Optical' | 'Thermal' | 'IR';
    secondary?: 'Optical' | 'Thermal' | 'IR';
    mode: 'STREAM' | 'RECORDED';
};

export class DroneQueryForm extends BasePage {
    // Locators (resilient: prefer labels, roles, placeholders over CSS)
  private readonly streamRadio    = this.page.getByRole('radio', { name: /video stream/i });
    private readonly recordedRadio  = this.page.getByRole('radio', { name: /recorded video/i });
    private readonly domainSelect   = this.page.getByLabel('Domain');
    private readonly missionInput   = this.page.getByPlaceholder('Enter mission name');
    private readonly droneSelect    = this.page.getByLabel('Drone');
    private readonly addSecondary   = this.page.getByRole('button', { name: /add secondary video/i });
    private readonly createBtn      = this.page.getByRole('button', { name: /create query/i });
    private readonly streamUrlInput = this.page.getByPlaceholder(/stream url/i);

  async open() {
        await this.page.goto('/#/query-builder/generate-query?type=drone');
        await expect(this.page.getByRole('heading', { name: /generate new query/i })).toBeVisible();
  }

  async fill(input: DroneQueryInput) {
        if (input.mode === 'RECORDED') await this.recordedRadio.check();
        else await this.streamRadio.check();

      await this.domainSelect.click();
        await this.page.getByRole('option', { name: input.domain }).click();

      await this.missionInput.fill(input.missionName);

      await this.droneSelect.click();
        await this.page.getByRole('option', { name: input.drone }).click();

      if (input.secondary) await this.addSecondary.click();
  }

  async submit() {
        await this.createBtn.click();
  }

  async expectStreamUrlResolved() {
        await expect(this.streamUrlInput).not.toHaveValue('');
  }

  async expectFieldError(field: 'mission' | 'drone' | 'domain') {
        await expect(this.page.getByTestId(`error-${field}`)).toBeVisible();
  }

  async expectCreateDisabled() {
        await expect(this.createBtn).toBeDisabled();
  }
}
