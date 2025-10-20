import subprocess
import time
import os
from playwright.sync_api import sync_playwright

def run():
    api_process = None
    web_process = None
    try:
        # Start servers
        print("Starting API and web servers...")
        api_process = subprocess.Popen("pnpm dev:api:mock > api.log 2>&1 &", shell=True, cwd=os.path.abspath('.'))
        web_process = subprocess.Popen("pnpm -C web dev > web.log 2>&1 &", shell=True, cwd=os.path.abspath('.'))

        # Wait for servers to start
        time.sleep(15)
        print("Servers started.")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            print("Navigating to login page...")
            page.goto("http://localhost:3000/login")

            print("Performing demo login...")
            page.click('button:has-text("Explore demo mode")')
            page.wait_for_url("http://localhost:3000/dashboard")

            print("Navigating to user profile...")
            page.click('span:has-text("Demo Admin")')

            print("Opening 'Manage Children' modal...")
            page.click('button:has-text("Manage Children")')

            # Wait for the modal to appear
            modal = page.wait_for_selector('[role="dialog"]')

            screenshot_path = "manage_children_modal.png"
            print(f"Taking screenshot: {screenshot_path}")
            modal.screenshot(path=screenshot_path)

            browser.close()
            print(f"SUCCESS: Screenshot saved to {os.path.abspath(screenshot_path)}")

    finally:
        print("Cleaning up server processes...")
        subprocess.run("pkill -f 'pnpm'", shell=True)
        subprocess.run("pkill -f 'node'", shell=True)
        if api_process:
            api_process.terminate()
        if web_process:
            web_process.terminate()
        print("Cleanup complete.")

if __name__ == "__main__":
    run()
