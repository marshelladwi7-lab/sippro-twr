# -*- coding: utf-8 -*-
"""
Script: capture_all_features.py
Purpose: Simulate complete end-to-end user workflows in SIPPRO-TWR via Playwright
         and capture high-resolution screenshots of every feature without missing a single thing.
"""

import os
import sys
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"S:\TWR Bank Data Project\docs\demo_screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def run_simulation_and_capture():
    print("=== STARTING PLAYWRIGHT LIVE APPLICATION SIMULATION ===")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 1920x1080 with 2x scale factor for crisp high-DPI screenshots
        context = browser.new_context(
            viewport={"width": 1600, "height": 950},
            device_scale_factor=2
        )
        page = context.new_page()

        # -------------------------------------------------------------
        # 1. LANDING & LOGIN PORTAL (/login)
        # -------------------------------------------------------------
        print("\n[1/17] Navigating to Login Portal...")
        page.goto("http://localhost:3000/login", wait_until="networkidle")
        page.wait_for_timeout(1000)
        shot1 = os.path.join(OUTPUT_DIR, "01_portal_landing_login.png")
        page.screenshot(path=shot1)
        print(f" -> Captured: {shot1} ({os.path.getsize(shot1):,} bytes)")

        # -------------------------------------------------------------
        # 2. ROLE PERSONA SELECTOR HOVER / FOCUS
        # -------------------------------------------------------------
        print("\n[2/17] Demonstrating RBAC Role Personas...")
        penilai_btn = page.locator("button", has_text="Penilai").first
        if penilai_btn.count() > 0:
            penilai_btn.hover()
            page.wait_for_timeout(500)
        shot2 = os.path.join(OUTPUT_DIR, "02_portal_role_personas.png")
        page.screenshot(path=shot2)
        print(f" -> Captured: {shot2} ({os.path.getsize(shot2):,} bytes)")

        # Log in as Admin / Penilai
        print("Logging in as Admin...")
        admin_btn = page.locator("button", has_text="Admin").first
        admin_btn.click()
        page.wait_for_timeout(400)
        submit_btn = page.locator("button", has_text="Masuk ke Sistem Penilaian").first
        submit_btn.click()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(3500)  # Wait for MapLibre tiles and pins to render
        print("Logged in! Current URL:", page.url)

        # -------------------------------------------------------------
        # 3. WORKSTATION GIS COCKPIT (/workstation - Tab "map")
        # -------------------------------------------------------------
        print("\n[3/17] Capturing GIS Cockpit Overview...")
        shot3 = os.path.join(OUTPUT_DIR, "03_gis_cockpit_overview.png")
        page.screenshot(path=shot3)
        print(f" -> Captured: {shot3} ({os.path.getsize(shot3):,} bytes)")

        # -------------------------------------------------------------
        # 4. GIS BASEMAP SWITCHER (Satellite Esri / Dark)
        # -------------------------------------------------------------
        print("\n[4/17] Switching Basemap to Esri World Imagery / Satellite...")
        sat_btn = page.locator("button", has_text="Satelit").first
        if sat_btn.count() > 0:
            sat_btn.click()
            page.wait_for_timeout(3000)
        shot4 = os.path.join(OUTPUT_DIR, "04_gis_basemap_satellite.png")
        page.screenshot(path=shot4)
        print(f" -> Captured: {shot4} ({os.path.getsize(shot4):,} bytes)")

        # Switch back to Positron / Vector
        positron_btn = page.locator("button", has_text="Positron").first
        if positron_btn.count() > 0:
            positron_btn.click()
            page.wait_for_timeout(1500)

        # -------------------------------------------------------------
        # 5. SPATIAL RADIUS BUFFER (3 km)
        # -------------------------------------------------------------
        print("\n[5/17] Triggering 3km Spatial Radius Buffer...")
        r3_btn = page.locator("button", has_text="3km").first
        if r3_btn.count() > 0:
            r3_btn.click()
            page.wait_for_timeout(2000)
        shot5 = os.path.join(OUTPUT_DIR, "05_gis_spatial_radius_buffer.png")
        page.screenshot(path=shot5)
        print(f" -> Captured: {shot5} ({os.path.getsize(shot5):,} bytes)")

        # -------------------------------------------------------------
        # 6. PROPERTY DETAIL MODAL (Popup Modal)
        # -------------------------------------------------------------
        print("\n[6/17] Opening Property Detail Modal...")
        # Check if there is an inspect or detail button in bottom list or marker
        detail_btn = page.locator("button", has_text="Detail").first
        if detail_btn.count() > 0:
            detail_btn.click()
            page.wait_for_timeout(1000)
            shot6 = os.path.join(OUTPUT_DIR, "06_gis_property_detail_modal.png")
            page.screenshot(path=shot6)
            print(f" -> Captured: {shot6} ({os.path.getsize(shot6):,} bytes)")
            
            # Close modal if open
            close_btn = page.locator("button", has_text="Tutup").first
            if close_btn.count() > 0:
                close_btn.click()
                page.wait_for_timeout(500)
        else:
            # Click directly on map canvas center to trigger popup
            page.mouse.click(800, 500)
            page.wait_for_timeout(1000)
            shot6 = os.path.join(OUTPUT_DIR, "06_gis_property_detail_modal.png")
            page.screenshot(path=shot6)
            print(f" -> Captured: {shot6} ({os.path.getsize(shot6):,} bytes)")

        # -------------------------------------------------------------
        # 7. COMPARABLE INSPECTOR DRAWER
        # -------------------------------------------------------------
        print("\n[7/17] Capturing Comparable Inspector Drawer...")
        inspect_btn = page.locator("button", has_text="Inspeksi").first
        if inspect_btn.count() > 0:
            inspect_btn.click()
            page.wait_for_timeout(1000)
        shot7 = os.path.join(OUTPUT_DIR, "07_gis_comparable_inspector_drawer.png")
        page.screenshot(path=shot7)
        print(f" -> Captured: {shot7} ({os.path.getsize(shot7):,} bytes)")

        # -------------------------------------------------------------
        # 8. ADD COMPARABLE / ON-MAP PINPOINTING MODAL
        # -------------------------------------------------------------
        print("\n[8/17] Opening On-Map Pinpointing Add Modal...")
        add_btn = page.locator("button", has_text="Tambah Data").first
        if add_btn.count() > 0:
            add_btn.click()
            page.wait_for_timeout(1000)
            shot8 = os.path.join(OUTPUT_DIR, "08_gis_on_map_pinpoint_modal.png")
            page.screenshot(path=shot8)
            print(f" -> Captured: {shot8} ({os.path.getsize(shot8):,} bytes)")
            
            # Close add modal
            batal_btn = page.locator("button", has_text="Batal").first
            if batal_btn.count() > 0:
                batal_btn.click()
                page.wait_for_timeout(500)

        # -------------------------------------------------------------
        # 9. SPATIAL VALUE ESTIMATOR (Tab "estimator")
        # -------------------------------------------------------------
        print("\n[9/17] Switching to Tab: Analisis Estimasi Nilai...")
        estimator_tab = page.locator("button", has_text="Analisis Estimasi Nilai").first
        estimator_tab.click()
        page.wait_for_timeout(2000)
        shot9 = os.path.join(OUTPUT_DIR, "09_spatial_estimator_overview.png")
        page.screenshot(path=shot9)
        print(f" -> Captured: {shot9} ({os.path.getsize(shot9):,} bytes)")

        # -------------------------------------------------------------
        # 10. RCN BUILDING SPEC CALCULATOR & RADIUS INTERACTION
        # -------------------------------------------------------------
        print("\n[10/17] Interacting with RCN Building Cost & Statistics...")
        # Scroll slightly to show statistics and building replacement cost controls
        page.mouse.wheel(0, 300)
        page.wait_for_timeout(1000)
        shot10 = os.path.join(OUTPUT_DIR, "10_spatial_estimator_rcn_calculator.png")
        page.screenshot(path=shot10)
        print(f" -> Captured: {shot10} ({os.path.getsize(shot10):,} bytes)")

        # -------------------------------------------------------------
        # 11. HIGH-DENSITY KKP ADJUSTMENT GRID (SPI 106)
        # -------------------------------------------------------------
        print("\n[11/17] Scrolling to High-Density KKP Adjustment Grid (SPI 106)...")
        page.mouse.wheel(0, 500)
        page.wait_for_timeout(1200)
        shot11 = os.path.join(OUTPUT_DIR, "11_high_density_kkp_adjustment_grid.png")
        page.screenshot(path=shot11)
        print(f" -> Captured: {shot11} ({os.path.getsize(shot11):,} bytes)")

        # -------------------------------------------------------------
        # 12 & 13. COLLATERAL RISK GAUGE (POJK 40) & EXECUTIVE BANK CARD
        # -------------------------------------------------------------
        print("\n[12 & 13/17] Scrolling to Collateral Risk Gauge & Executive Bank Summary Card...")
        page.mouse.wheel(0, 600)
        page.wait_for_timeout(1200)
        shot12 = os.path.join(OUTPUT_DIR, "12_collateral_risk_gauge_pojk40.png")
        page.screenshot(path=shot12)
        print(f" -> Captured: {shot12} ({os.path.getsize(shot12):,} bytes)")

        # -------------------------------------------------------------
        # 14. TABULAR RECORDS SPREADSHEET (Tab "records")
        # -------------------------------------------------------------
        print("\n[14/17] Switching to Tab: Pangkalan Data Riwayat (Spreadsheet)...")
        # Scroll back up first
        page.mouse.wheel(0, -2000)
        page.wait_for_timeout(500)
        records_tab = page.locator("button", has_text="Pangkalan Data Riwayat").first
        records_tab.click()
        page.wait_for_timeout(2000)
        shot14 = os.path.join(OUTPUT_DIR, "14_spreadsheet_records_view.png")
        page.screenshot(path=shot14)
        print(f" -> Captured: {shot14} ({os.path.getsize(shot14):,} bytes)")

        # -------------------------------------------------------------
        # 15. SPREADSHEET SEARCH & MULTI-PARAMETER FILTER
        # -------------------------------------------------------------
        print("\n[15/17] Applying Search & Filter in Spreadsheet...")
        search_input = page.locator("input[placeholder*='Cari'], input[type='text']").first
        if search_input.count() > 0:
            search_input.fill("Bekasi")
            page.wait_for_timeout(1000)
        shot15 = os.path.join(OUTPUT_DIR, "15_spreadsheet_search_and_filter.png")
        page.screenshot(path=shot15)
        print(f" -> Captured: {shot15} ({os.path.getsize(shot15):,} bytes)")

        # -------------------------------------------------------------
        # 16. BATCH EXCEL IMPORTER & COORDINATE SANITIZER (Tab "importer")
        # -------------------------------------------------------------
        print("\n[16/17] Switching to Tab: Batch Excel Importer...")
        importer_tab = page.locator("button", has_text="Batch Excel Importer").first
        importer_tab.click()
        page.wait_for_timeout(2000)
        shot16 = os.path.join(OUTPUT_DIR, "16_batch_excel_uploader.png")
        page.screenshot(path=shot16)
        print(f" -> Captured: {shot16} ({os.path.getsize(shot16):,} bytes)")

        # -------------------------------------------------------------
        # 17. LEGACY GIS DASHBOARD (Homepage /)
        # -------------------------------------------------------------
        print("\n[17/17] Navigating to Home GIS Dashboard (http://localhost:3000/)...")
        page.goto("http://localhost:3000/", wait_until="networkidle")
        page.wait_for_timeout(3000)
        shot17 = os.path.join(OUTPUT_DIR, "17_legacy_gis_dashboard_home.png")
        page.screenshot(path=shot17)
        print(f" -> Captured: {shot17} ({os.path.getsize(shot17):,} bytes)")

        browser.close()
        print("\n=== ALL PLAYWRIGHT SIMULATIONS COMPLETED SUCCESSFULLY! ===")

if __name__ == "__main__":
    run_simulation_and_capture()
