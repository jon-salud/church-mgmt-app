import { Page } from '@playwright/test';
import * as axe from 'axe-core';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    // Get current cookies to understand auth state
    const currentCookies = await this.page.context().cookies();
    const demoTokenCookie = currentCookies.find(c => c.name === 'demo_token');

    // If no demo token exists, set it (defensive)
    if (!demoTokenCookie) {
      await this.page.context().addCookies([
        {
          name: 'demo_token',
          value: 'demo-admin',
          url: 'http://localhost:3000',
        },
        {
          name: 'session_provider',
          value: 'demo',
          url: 'http://localhost:3000',
        },
      ]);
    }

    // Ensure onboarding is complete for non-onboarding tests
    try {
      // Get token value from current cookies
      const tokenValue = demoTokenCookie?.value || 'demo-admin';
      await this.page.request.put('http://localhost:3001/api/v1/settings/church-acc', {
        data: { onboardingComplete: true },
        headers: {
          Cookie: `demo_token=${tokenValue}; session_provider=demo`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
    } catch {
      // Ignore errors - onboarding status might already be set
    }

    // Navigate to the URL with cookies already set
    await this.page.goto(url, { waitUntil: 'networkidle' });
  }

  async checkAccessibility() {
    // Wait for page to be fully loaded and stable
    await this.page.waitForLoadState('networkidle');
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
