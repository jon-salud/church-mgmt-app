
import { Page, Locator } from '@playwright/test';
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

  async navigate() {
    await this.page.goto('/requests');
  }

  async selectRequestType(type: 'Prayer' | 'Benevolence' | 'Improvement' | 'Suggestion') {
    await this.requestTypeSelect.selectOption({ label: `${type} Request` });
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
}
