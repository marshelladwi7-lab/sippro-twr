# -*- coding: utf-8 -*-
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1600, "height": 900})
    page.goto("http://localhost:3000/", wait_until="networkidle")
    page.wait_for_timeout(2000)

    print("Title:", page.title())
    print("URL:", page.url)

    # Header buttons
    header_buttons = page.locator("header button, header a").all()
    print(f"\nHeader elements ({len(header_buttons)}):")
    for i, b in enumerate(header_buttons):
        print(f"  [{i}] {b.text_content().strip().replace('\n', ' ')}")

    # Metrics
    metrics_text = page.locator("div.bg-slate-900\\/60").inner_text().replace("\n", " | ")
    print(f"\nMetrics Strip: {metrics_text}")

    # Sidebar cards
    cards = page.locator("aside .p-3").all()
    print(f"\nSidebar cards visible: {len(cards)}")
    for i, c in enumerate(cards[:5]):
        print(f"  Card {i}: {c.inner_text().replace('\n', ' -- ')}")

    # Map container
    map_el = page.locator(".maplibregl-map, .leaflet-container, [class*='map']")
    print(f"\nMap element count: {map_el.count()}")

    browser.close()
