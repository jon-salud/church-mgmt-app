
import re
from playwright.sync_api import Page, expect, sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Set demo token to bypass login
    context.add_cookies([{
        "name": "demo_token",
        "value": "demo-admin",
        "url": "http://localhost:3000"
    }])

    page.goto("http://localhost:3000/dashboard")

    # Wait for the main content to be visible
    expect(page.locator("#main-content")).to_be_visible()

    # Switch to light theme first
    theme_switcher = page.locator('#theme-switcher-button')
    theme_switcher.click()

    # Wait for a moment before taking the screenshot
    page.wait_for_timeout(1000)

    # Take a screenshot of the light theme
    page.screenshot(path="jules-scratch/verification/light-theme-contrast.png")

    # Switch to dark theme
    theme_switcher.click()

    # Wait for a moment before taking the screenshot
    page.wait_for_timeout(1000)

    # Take a screenshot of the dark theme
    page.screenshot(path="jules-scratch/verification/dark-theme-contrast.png")

    context.close()
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
