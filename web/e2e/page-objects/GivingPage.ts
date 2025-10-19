import { BasePage } from './BasePage';

export class GivingPage extends BasePage {
  async goto() {
    await super.goto('http://localhost:3000/giving');
  }
}
