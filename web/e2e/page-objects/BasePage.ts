import { Page, expect } from '@playwright/test';
import * as axe from 'axe-core';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async checkAccessibility() {
    await this.page.addScriptTag({ path: require.resolve('axe-core') });
    const accessibilityScanResults = await this.page.evaluate(() => axe.run());
    expect(accessibilityScanResults.violations).toEqual([]);
  }
}
