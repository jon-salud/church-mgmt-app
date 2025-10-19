import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class GivingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('http://localhost:3000/giving');
  }
}
