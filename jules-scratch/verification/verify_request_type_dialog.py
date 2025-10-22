
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        await context.add_cookies([{"name": "demo_token", "value": "demo-admin", "url": "http://localhost:3000"}])
        page = await context.new_page()
        await page.goto("http://localhost:3000/settings")
        await page.get_by_role("button", name="Add Request Type").click()
        await page.fill("input[placeholder='Request type name']", "Test Request Type")
        await page.click("#confidential-switch")
        await page.screenshot(path="jules-scratch/verification/verification.png")
        await browser.close()

asyncio.run(main())
