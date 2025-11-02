import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class RequestsPage extends BasePage {
  readonly requestTypeSelect: Locator;
  readonly titleInput: Locator;
  readonly bodyTextarea: Locator;
  readonly confidentialCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.requestTypeSelect = page.locator('#request-type');
    this.titleInput = page.locator('#title');
    this.bodyTextarea = page.locator('#body');
    this.confidentialCheckbox = page.locator('#isConfidential');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await super.goto('http://localhost:3000/requests');
  }

  async selectRequestType(type: 'Prayer' | 'Benevolence' | 'Improvement' | 'Suggestion') {
    // Click the trigger to open the dropdown
    await this.page.locator('[data-testid="request-type-select"]').click();

    // Wait for the dropdown to be visible by checking for the listbox role
    await this.page.locator('[role="listbox"]').waitFor({ state: 'visible' });

    // The option text is just the type name (e.g., "Prayer", not "Prayer Request")
    await this.page.locator('[role="option"]').filter({ hasText: type }).click();
  }
  async fillRequestForm(title: string, body: string, isConfidential = false) {
    await this.titleInput.fill(title);
    await this.bodyTextarea.fill(body);
    if (isConfidential) {
      await this.confidentialCheckbox.check();
    }
  }

  async submitRequest() {
    await this.submitButton.click();
  }

  async verifyRequestsPage() {
    await expect(this.page).toHaveURL('http://localhost:3000/requests');
    await expect(this.page.getByRole('heading', { name: 'Requests' })).toBeVisible();
  }

  async verifyRequestTypeDropdown() {
    await expect(this.requestTypeSelect).toBeVisible();
  }

  async getAvailableRequestTypes(): Promise<string[]> {
    // Click the trigger to open the dropdown
    await this.page.locator('[data-testid="request-type-select"]').click();

    // Wait for the dropdown to be visible
    await this.page.locator('[role="listbox"]').waitFor({ state: 'visible' });

    // Get all options - text is just the type name (e.g., "Prayer", not "Prayer Request")
    const options = this.page.locator('[role="option"]');
    const count = await options.count();
    const types: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text) types.push(text);
    }

    // Close the dropdown by clicking the trigger again
    await this.page.locator('[data-testid="request-type-select"]').click();

    return types;
  }

  async verifyPrayerRequestForm() {
    await expect(this.titleInput).toBeVisible();
    await expect(this.bodyTextarea).toBeVisible();
    await expect(this.confidentialCheckbox).toBeVisible();
  }

  async verifyRequestSubmitted() {
    // Check for success message or redirect
    try {
      await expect(this.page.getByText('Request submitted successfully')).toBeVisible();
    } catch (err) {
      try {
        // May redirect to pastoral-care page
        await expect(this.page).toHaveURL(/pastoral-care/);
      } catch (err2) {
        throw new Error(
          `Neither success message was visible nor was the page redirected to pastoral-care. ` +
            `Original error: ${err}; Redirect check error: ${err2}`
        );
      }
    }
  }

  async verifyConfidentialOptionVisible() {
    await expect(this.confidentialCheckbox).toBeVisible();
  }
}
