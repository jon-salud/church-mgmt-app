
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        context.add_cookies([{"name": "demo_token", "value": "demo-admin", "url": "http://localhost:3000"}])
        page = context.new_page()
        page.goto("http://localhost:3000", timeout=120000)
        page.wait_for_selector("#theme-switcher-button", timeout=120000)
        page.screenshot(path="jules-scratch/verification/light-theme.png")
        theme_switcher = page.locator("#theme-switcher-button")
        theme_switcher.click()
        page.screenshot(path="jules-scratch/verification/dark-theme.png")
        browser.close()

run()
