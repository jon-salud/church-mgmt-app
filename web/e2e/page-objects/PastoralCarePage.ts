import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class PastoralCarePage extends BasePage {
  readonly newTicketButton: Locator;
  readonly ticketRows: Locator;

  constructor(page: Page) {
    super(page);
    this.newTicketButton = page.getByRole('link', { name: 'New Ticket' });
    this.ticketRows = page.locator('tbody tr');
  }

  async goto() {
    await super.goto('http://localhost:3000/pastoral-care');
  }
}

export class NewPastoralCareTicketPage extends BasePage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly prioritySelect: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.locator('#new-ticket-title-input');
    this.descriptionInput = page.locator('#new-ticket-description-textarea');
    this.prioritySelect = page.locator('#new-ticket-priority-select');
    this.submitButton = page.locator('#new-ticket-submit-button');
  }

  async goto() {
    await this.page.goto('/pastoral-care/new');
  }
}

export class PastoralCareTicketDetailPage extends BasePage {
  readonly commentTextarea: Locator;
  readonly addCommentButton: Locator;
  readonly commentElements: Locator;

  constructor(page: Page) {
    super(page);
    this.commentTextarea = page.locator('#new-comment-textarea');
    this.addCommentButton = page.locator('#add-comment-button');
    this.commentElements = page.locator('div:has-text("Comments") >> div[class*="border"]');
  }
}
