from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Set auth cookie
    context.add_cookies([{'name': 'demo_token', 'value': 'demo-admin', 'url': 'http://localhost:3000'}])

    # Verify settings page
    page.goto("http://localhost:3000/settings")

    # Wait for the dynamic component to load
    expect(page.get_by_role("heading", name="Request Form Settings")).to_be_visible(timeout=10000)

    add_button = page.get_by_role("button", name="Add Request Type")
    expect(add_button).to_be_visible()
    add_button.click()

    dialog_input = page.get_by_placeholder("Request type name")
    expect(dialog_input).to_be_visible()
    dialog_input.fill("Test Request Type")

    dialog_add_button = page.locator('//div[contains(@class, "DialogFooter")]//button[text()="Add Request Type"]')
    expect(dialog_add_button).to_be_visible()
    dialog_add_button.click()

    expect(page.get_by_text("Test Request Type")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/settings-page.png")

    # Verify requests page
    page.goto("http://localhost:3000/requests")

    request_type_dropdown = page.get_by_role("combobox")
    expect(request_type_dropdown).to_be_visible()
    request_type_dropdown.click()

    expect(page.get_by_text("Test Request Type")).to_be_visible()
    page.screenshot(path="jules-scratch/verification/requests-page.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
