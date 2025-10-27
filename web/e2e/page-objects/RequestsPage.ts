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
    // Use the select element directly to avoid conflicts with shadcn/ui text display
    await this.page.locator('select[name="requestTypeId"]').selectOption({ label: type });
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
    await this.requestTypeSelect.click();
    const options = this.page.getByRole('option');
    const count = await options.count();
    const types: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await options.nth(i).textContent();
      if (text) types.push(text.replace(' Request', ''));
    }
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
