import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async checkAccessibility() {
    const accessibilityScanResults = await new AxeBuilder(this.page).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  }
}
