from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Log in as a volunteer user.
    page.goto('http://localhost:3000')
    page.evaluate('''() => {
        const session = {
            token: 'demo-volunteer',
            provider: 'demo'
        };
        localStorage.setItem('session', JSON.stringify(session));
    }''')
    page.goto('http://localhost:3000/dashboard')

    # Navigate to the check-in dashboard.
    page.goto('http://localhost:3000/checkin/dashboard')

    # Expect the "Child Check-In" heading to be visible.
    expect(page.get_by_role("heading", name="Child Check-In")).to_be_visible()

    # Take a screenshot.
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
