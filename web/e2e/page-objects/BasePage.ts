import { Page } from '@playwright/test';
import * as axe from 'axe-core';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    // Set demo authentication cookies for testing
    await this.page.context().addCookies([
      {
        name: 'demo_token',
        value: 'demo-admin',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
      },
      {
        name: 'session_provider',
        value: 'demo',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
      },
    ]);
    await this.page.goto(url);
  }

  async checkAccessibility() {
    // Add delay for theme transitions to complete
    await this.page.waitForTimeout(500);

    await this.page.addScriptTag({ path: require.resolve('axe-core') });
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
