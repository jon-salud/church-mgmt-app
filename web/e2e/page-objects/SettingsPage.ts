import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SettingsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/settings');
    // Wait for page to fully load
    await this.page.waitForLoadState('networkidle');
    // Log current URL for debugging
    console.log('Current URL after navigation:', this.page.url());
  }

  async verifySettingsPage() {
    // Check if we're on the right page
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/settings')) {
      console.warn(`Expected to be on /settings page, but URL is: ${currentUrl}`);
    }
    
    // Try to find any heading on the page
    const headings = await this.page.locator('h1, h2').all();
    console.log(`Found ${headings.length} headings on page`);
    for (const heading of headings) {
      const text = await heading.textContent();
      console.log(`Heading text: ${text}`);
    }
    
    await expect(this.page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  }
}
