# -*- coding: utf-8 -*-
"""
Script: capture_root_site_perfect.py
Purpose: Perfectly capture all features and states of the live application
         running exclusively at http://localhost:3000/
"""

import os
import sys
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"S:\TWR Bank Data Project\docs\demo_screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def capture_root_site():
    print("=== CAPTURING LIVE APPLICATION AT http://localhost:3000/ ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1600x950 at 2x scale for sharp, high-res captures
        context = browser.new_context(
            viewport={"width": 1600, "height": 950},
            device_scale_factor=2
        )
        page = context.new_page()

        # 1. Main View: Peta Spasial (Default Load)
        print("\n[1/12] Capturing Main Spatial Map View...")
        page.goto("http://localhost:3000/", wait_until="networkidle")
        page.wait_for_timeout(4000)  # Wait for map tiles and pins to render
        shot1 = os.path.join(OUTPUT_DIR, "01_beranda_peta_spasial_utama.png")
        page.screenshot(path=shot1)
        print(f" -> Captured: {shot1} ({os.path.getsize(shot1):,} bytes)")

        # 2. Header & Summary Metrics Strip
        print("\n[2/12] Capturing Header and Metrics Strip...")
        header_and_metrics = page.locator("header, div.bg-slate-900\\/60")
        # We can take a screenshot of top 120px
        shot2 = os.path.join(OUTPUT_DIR, "02_bilah_metrik_ringkasan_data.png")
        page.screenshot(path=shot2, clip={"x": 0, "y": 0, "width": 1600, "height": 130})
        print(f" -> Captured: {shot2} ({os.path.getsize(shot2):,} bytes)")

        # 3. Sidebar Browser: Filter Chips & Region Dropdown
        print("\n[3/12] Capturing Left Sidebar Property Browser...")
        sidebar = page.locator("aside")
        shot3 = os.path.join(OUTPUT_DIR, "03_panel_pencarian_dan_filter.png")
        sidebar.screenshot(path=shot3)
        print(f" -> Captured: {shot3} ({os.path.getsize(shot3):,} bytes)")

        # 4. Search Filter in Action (Search "Bekasi")
        print("\n[4/12] Filtering by Search Keyword 'Bekasi'...")
        search_input = page.locator("aside input[placeholder*='Cari']")
        search_input.fill("Bekasi")
        page.wait_for_timeout(1000)
        shot4 = os.path.join(OUTPUT_DIR, "04_pencarian_interaktif_bekasi.png")
        page.screenshot(path=shot4)
        print(f" -> Captured: {shot4} ({os.path.getsize(shot4):,} bytes)")

        # Clear search
        clear_btn = page.locator("aside button:has-text('✕')")
        if clear_btn.count() > 0:
            clear_btn.click()
            page.wait_for_timeout(500)

        # 5. Selecting a Property Card (Fly to & Highlight)
        print("\n[5/12] Selecting Property Card #1...")
        card1 = page.locator("aside .p-3").first
        card1.click()
        page.wait_for_timeout(2000)
        shot5 = os.path.join(OUTPUT_DIR, "05_kartu_properti_dan_seleksi.png")
        page.screenshot(path=shot5)
        print(f" -> Captured: {shot5} ({os.path.getsize(shot5):,} bytes)")

        # 6. Map Popup Balloon
        print("\n[6/12] Capturing Interactive Map Marker Popup...")
        # If popup is open on map
        popup = page.locator(".maplibregl-popup, [class*='popup']")
        if popup.count() > 0:
            print("Popup visible!")
        else:
            # Click on the center marker
            page.mouse.click(1050, 480)
            page.wait_for_timeout(1000)
        shot6 = os.path.join(OUTPUT_DIR, "06_popup_detail_marker_peta.png")
        page.screenshot(path=shot6)
        print(f" -> Captured: {shot6} ({os.path.getsize(shot6):,} bytes)")

        # 7. Basemap Switcher (Satellite Esri World Imagery)
        print("\n[7/12] Switching to Satellite Imagery...")
        # Check basemap buttons on map
        sat_btn = page.locator("button:has-text('Satelit'), button:has-text('Citra'), [title*='Satelit']").first
        if sat_btn.count() > 0:
            sat_btn.click()
            page.wait_for_timeout(3500)
        shot7 = os.path.join(OUTPUT_DIR, "07_pengalih_peta_satelit_esri.png")
        page.screenshot(path=shot7)
        print(f" -> Captured: {shot7} ({os.path.getsize(shot7):,} bytes)")

        # Switch back to default map
        osm_btn = page.locator("button:has-text('Peta'), button:has-text('OSM'), button:has-text('Positron')").first
        if osm_btn.count() > 0:
            osm_btn.click()
            page.wait_for_timeout(1500)

        # 8. Modal Tambah Data Baru
        print("\n[8/12] Opening 'Tambah Data' Modal...")
        tambah_btn = page.locator("header button:has-text('Tambah Data')").first
        tambah_btn.click()
        page.wait_for_timeout(1000)
        shot8 = os.path.join(OUTPUT_DIR, "08_modal_tambah_data_baru.png")
        page.screenshot(path=shot8)
        print(f" -> Captured: {shot8} ({os.path.getsize(shot8):,} bytes)")

        # Close modal via Escape key or reload
        print("Closing modal...")
        page.keyboard.press("Escape")
        page.wait_for_timeout(800)
        # If still modal visible, refresh to main page
        if page.locator("button:has-text('Simpan Data')").count() > 0:
            page.goto("http://localhost:3000/", wait_until="networkidle")
            page.wait_for_timeout(2000)

        # 9. Spreadsheet View
        print("\n[9/12] Switching to 'Spreadsheet' View...")
        sheet_btn = page.locator("header button", has_text="Spreadsheet").first
        sheet_btn.click()
        page.wait_for_timeout(2500)
        shot9 = os.path.join(OUTPUT_DIR, "09_tampilan_spreadsheet_lengkap.png")
        page.screenshot(path=shot9)
        print(f" -> Captured: {shot9} ({os.path.getsize(shot9):,} bytes)")

        # 10. Spreadsheet Filter & Search
        print("\n[10/12] Searching within Spreadsheet...")
        table_search = page.locator("input[placeholder*='Cari'], input[type='text']").first
        if table_search.count() > 0:
            table_search.fill("Jakarta")
            page.wait_for_timeout(1000)
        shot10 = os.path.join(OUTPUT_DIR, "10_spreadsheet_filter_dan_aksi.png")
        page.screenshot(path=shot10)
        print(f" -> Captured: {shot10} ({os.path.getsize(shot10):,} bytes)")

        # 11. Batch Excel Importer View
        print("\n[11/12] Switching to 'Import File' View...")
        import_btn = page.locator("header button", has_text="Import File").first
        import_btn.click()
        page.wait_for_timeout(2000)
        shot11 = os.path.join(OUTPUT_DIR, "11_modul_impor_excel_batch.png")
        page.screenshot(path=shot11)
        print(f" -> Captured: {shot11} ({os.path.getsize(shot11):,} bytes)")

        # 12. 1-Click Export Features (Excel & KML)
        print("\n[12/12] Capturing Header Export Action Controls...")
        shot12 = os.path.join(OUTPUT_DIR, "12_ekspor_excel_dan_kml.png")
        page.screenshot(path=shot12, clip={"x": 1050, "y": 0, "width": 550, "height": 70})
        print(f" -> Captured: {shot12} ({os.path.getsize(shot12):,} bytes)")

        browser.close()
        print("\n=== ALL SCREENSHOTS CAPTURED PERFECTLY FROM http://localhost:3000/ ===")

if __name__ == "__main__":
    capture_root_site()
