
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:3000/members/1")
        page.get_by_role("button", name="Edit").click()
        page.screenshot(path="jules-scratch/verification/edit-member-form.png")
        browser.close()

run()
