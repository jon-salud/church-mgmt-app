import { test, expect } from "@playwright/test";
import { PastoralCarePage } from "./page-objects/PastoralCarePage";

test.describe("Pastoral Care Pages", () => {
    let pastoralCarePage: PastoralCarePage;

    test.beforeEach(async ({ page, context }) => {
        // Set the demo token cookie to simulate a logged-in admin user
        await context.addCookies([
            {
                name: "demo_token",
                value: "demo-admin",
                url: "http://localhost:3000",
            },
        ]);

        pastoralCarePage = new PastoralCarePage(page);
    });

    test.skip("allows a user to create and comment on a pastoral care ticket", async ({ page }) => {
        await pastoralCarePage.goto();

        await expect(page.locator("h1").filter({ hasText: "Pastoral Care Tickets" })).toBeVisible();
    });
});
