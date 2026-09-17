# -*- coding: utf-8 -*-
"""
Script to capture all GIS views in Satellite Imagery mode on http://localhost:3000/
"""
from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = r"S:\TWR Bank Data Project\docs\demo_screenshots"

def capture_satellite_views():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        
        print("Navigating to http://localhost:3000/ ...")
        page.goto("http://localhost:3000/", wait_until="networkidle")
        page.wait_for_timeout(2500)
        
        # 1. Switch to Satellite Imagery
        print("Switching basemap to Satellite Imagery...")
        sat_btn = page.locator("button:has-text('Satelit'), button:has-text('Citra'), [title*='Satelit']").first
        if sat_btn.count() > 0:
            sat_btn.click()
            page.wait_for_timeout(4000)
            
        shot1 = os.path.join(OUTPUT_DIR, "gis_satelit_01_tampilan_utama.png")
        page.screenshot(path=shot1)
        print(f"Captured: {shot1} ({os.path.getsize(shot1):,} bytes)")
        
        # 2. Header and Telemetry Metrics
        shot2 = os.path.join(OUTPUT_DIR, "gis_satelit_02_summary_telemetry.png")
        page.screenshot(path=shot2, clip={"x": 0, "y": 0, "width": 1920, "height": 115})
        print(f"Captured: {shot2} ({os.path.getsize(shot2):,} bytes)")
        
        # 3. Search & Filter Sidebar
        shot3 = os.path.join(OUTPUT_DIR, "gis_satelit_03_panel_pencarian.png")
        page.screenshot(path=shot3, clip={"x": 20, "y": 125, "width": 420, "height": 260})
        print(f"Captured: {shot3} ({os.path.getsize(shot3):,} bytes)")
        
        # 4. Interactive Search in Satellite Mode: 'Bekasi'
        print("Searching 'Bekasi' in Satellite Mode...")
        search_input = page.locator("input[placeholder*='Cari']").first
        if search_input.count() > 0:
            search_input.fill("Bekasi")
            page.wait_for_timeout(2500)
        shot4 = os.path.join(OUTPUT_DIR, "gis_satelit_04_pencarian_bekasi.png")
        page.screenshot(path=shot4)
        print(f"Captured: {shot4} ({os.path.getsize(shot4):,} bytes)")
        
        # 5. Select Property Card & Fly-to Marker on Satellite
        print("Selecting property card...")
        card = page.locator("div[class*='cursor-pointer']").first
        if card.count() > 0:
            card.click()
            page.wait_for_timeout(3000)
        shot5 = os.path.join(OUTPUT_DIR, "gis_satelit_05_properti_terpilih.png")
        page.screenshot(path=shot5)
        print(f"Captured: {shot5} ({os.path.getsize(shot5):,} bytes)")
        
        # 6. Detail Map Marker Popup on Satellite
        print("Clicking marker on satellite map...")
        # Marker near center
        page.mouse.click(1050, 480)
        page.wait_for_timeout(1500)
        shot6 = os.path.join(OUTPUT_DIR, "gis_satelit_06_popup_detail_satelit.png")
        page.screenshot(path=shot6)
        print(f"Captured: {shot6} ({os.path.getsize(shot6):,} bytes)")
        
        # 7. Form Tambah Data Baru
        print("Opening 'Tambah Data' modal...")
        tambah_btn = page.locator("header button:has-text('Tambah Data')").first
        if tambah_btn.count() > 0:
            tambah_btn.click()
            page.wait_for_timeout(1500)
        shot7 = os.path.join(OUTPUT_DIR, "gis_satelit_07_form_tambah_data.png")
        page.screenshot(path=shot7)
        print(f"Captured: {shot7} ({os.path.getsize(shot7):,} bytes)")
        
        # Close modal via Batal button or navigation
        batal_btn = page.locator("button:has-text('Batal')").first
        if batal_btn.count() > 0:
            batal_btn.click()
            page.wait_for_timeout(1000)
        else:
            page.goto("http://localhost:3000/", wait_until="networkidle")
            page.wait_for_timeout(2000)
        
        # 8. Spreadsheet Mode
        print("Switching to Spreadsheet mode...")
        sheet_btn = page.locator("header button", has_text="Spreadsheet").first
        if sheet_btn.count() > 0:
            sheet_btn.click()
            page.wait_for_timeout(2500)
        shot8 = os.path.join(OUTPUT_DIR, "gis_satelit_08_tampilan_spreadsheet.png")
        page.screenshot(path=shot8)
        print(f"Captured: {shot8} ({os.path.getsize(shot8):,} bytes)")
        
        # 9. Spreadsheet Filter
        print("Searching in Spreadsheet mode...")
        tbl_search = page.locator("input[placeholder*='Cari'], input[type='text']").first
        if tbl_search.count() > 0:
            tbl_search.fill("Jakarta")
            page.wait_for_timeout(1500)
        shot9 = os.path.join(OUTPUT_DIR, "gis_satelit_09_filter_spreadsheet.png")
        page.screenshot(path=shot9)
        print(f"Captured: {shot9} ({os.path.getsize(shot9):,} bytes)")
        
        # 10. Import Excel View
        print("Switching to Import File view...")
        import_btn = page.locator("header button", has_text="Import File").first
        if import_btn.count() > 0:
            import_btn.click()
            page.wait_for_timeout(2000)
        shot10 = os.path.join(OUTPUT_DIR, "gis_satelit_10_upload_excel.png")
        page.screenshot(path=shot10)
        print(f"Captured: {shot10} ({os.path.getsize(shot10):,} bytes)")
        
        # 11. 1-Click Export Controls
        print("Capturing 1-Click Export buttons...")
        shot11 = os.path.join(OUTPUT_DIR, "gis_satelit_11_tombol_ekspor.png")
        page.screenshot(path=shot11, clip={"x": 1050, "y": 0, "width": 550, "height": 70})
        print(f"Captured: {shot11} ({os.path.getsize(shot11):,} bytes)")
        
        browser.close()
        print("\n=== ALL SATELLITE GIS CAPTURES COMPLETE ===")

if __name__ == "__main__":
    capture_satellite_views()
