from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Log in as an admin user.
    page.goto('http://localhost:3000')
    page.evaluate('''() => {
        const session = {
            token: 'demo-admin',
            provider: 'demo'
        };
        localStorage.setItem('session', JSON.stringify(session));
    }''')
    page.goto('http://localhost:3000/dashboard')

    # Navigate to the profile page of a specific member.
    page.goto('http://localhost:3000/members/user-member-3')

    # Open the "Manage Children" modal.
    page.get_by_role("button", name="Manage Children").click()
    expect(page.get_by_role("heading", name="Manage Children")).to_be_visible()

    # Add a new child.
    page.get_by_label('Full Name').fill('Test Child')
    page.get_by_label('Date of Birth').fill('2020-01-01')
    page.get_by_role('button', { name: 'Add Child' }).click()

    # Take a screenshot.
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
