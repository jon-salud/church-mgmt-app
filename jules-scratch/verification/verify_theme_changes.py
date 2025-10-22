
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Set the authentication cookie
        await page.goto("http://localhost:3000")
        await page.context.add_cookies([{"name": "demo_token", "value": "demo-admin", "url": "http://localhost:3000"}])

        pages_to_verify = [
            "dashboard",
            "members",
            "groups",
            "events",
            "announcements",
            "giving",
            "roles",
            "audit-log",
        ]

        for page_name in pages_to_verify:
            await page.goto(f"http://localhost:3000/{page_name}")
            await page.wait_for_load_state("networkidle")

            # Light theme
            await page.evaluate("() => document.documentElement.classList.remove('dark')")
            await page.screenshot(path=f"jules-scratch/verification/{page_name}-light.png")

            # Dark theme
            await page.evaluate("() => document.documentElement.classList.add('dark')")
            await page.screenshot(path=f"jules-scratch/verification/{page_name}-dark.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
