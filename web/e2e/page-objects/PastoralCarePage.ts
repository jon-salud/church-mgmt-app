import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PastoralCarePage extends BasePage {
    readonly newTicketButton: Locator;
    readonly ticketRows: Locator;

    constructor(page: Page) {
        super(page);
        this.newTicketButton = page.getByRole("link", { name: "New Ticket" });
        this.ticketRows = page.locator("tbody tr");
    }

    async goto() {
        await this.page.goto("http://localhost:3000/pastoral-care");
        // const pastoralCareMenu = this.page.locator("#nav-link-pastoral-care");
        // await pastoralCareMenu.waitFor({ state: "visible" });
        // await pastoralCareMenu.click();
        // await this.page.waitForURL("**/pastoral-care");
    }
}

export class NewPastoralCareTicketPage extends BasePage {
    readonly titleInput: Locator;
    readonly descriptionInput: Locator;
    readonly prioritySelect: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.titleInput = page.getByLabel("Title");
        this.descriptionInput = page.getByLabel("Description");
        this.prioritySelect = page.getByLabel("Priority");
        this.submitButton = page.getByRole("button", { name: "Submit" });
    }

    async goto() {
        await this.page.goto("/pastoral-care/new");
    }
}

export class PastoralCareTicketDetailPage extends BasePage {
    readonly commentTextarea: Locator;
    readonly addCommentButton: Locator;
    readonly commentElements: Locator;

    constructor(page: Page) {
        super(page);
        this.commentTextarea = page.getByLabel("Add a Comment");
        this.addCommentButton = page.getByRole("button", { name: "Add Comment" });
        this.commentElements = page.locator('div:has-text("Comments") >> div[class*="border"]');
    }
}
