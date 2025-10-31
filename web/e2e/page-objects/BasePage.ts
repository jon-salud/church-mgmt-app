import { Page } from '@playwright/test';
import * as axe from 'axe-core';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    // Navigate to the URL - cookies should already be set by login process
    await this.page.goto(url, { waitUntil: 'load' });
  }

  async checkAccessibility() {
    // Wait for page to be fully loaded and stable
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(500);

    // Next.js routes occasionally trigger a follow-up navigation after the
    // initial load which invalidates the execution context. Retry the script
    // injection once if that happens so the accessibility scans remain stable.
    let injected = false;
    for (let attempt = 0; attempt < 2 && !injected; attempt += 1) {
      try {
        await this.page.addScriptTag({ path: require.resolve('axe-core') });
        injected = true;
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('Execution context was destroyed') &&
          attempt === 0
        ) {
          await this.page.waitForLoadState('networkidle');
          await this.page.waitForTimeout(250);
          continue;
        }
        throw error;
      }
    }

    const accessibilityScanResults = await this.page.evaluate(() => axe.run());

    if (accessibilityScanResults.violations.length > 0) {
      console.warn(`Accessibility violations found on page: ${this.page.url()}`);
      console.warn('--------------------------------------------------');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.warn(`Violation ${index + 1}: ${violation.id} (${violation.impact})`);
        console.warn(`  Description: ${violation.description}`);
        console.warn(`  Help: ${violation.helpUrl}`);
        violation.nodes.forEach(node => {
          console.warn(`    - Target: ${node.target}`);
          console.warn(`      HTML: ${node.html}`);
        });
        console.warn('--------------------------------------------------');
      });
    }
  }
}
