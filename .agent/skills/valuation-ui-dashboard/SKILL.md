---
name: valuation-ui-dashboard
description: Builds responsive, high-density property valuation interfaces, interactive MapLibre/Leaflet maps with free tiles, adjustment calculation tables, and property inspection forms using Tailwind and Shadcn UI. Activates on UI, map components, dashboard, or frontend layout tasks.
---

# UI & GIS Dashboard Principles

## Map Implementation ($0 Tile Providers)
Never call proprietary map APIs. Use MapLibre GL JS or React-Leaflet with zero-auth open vector/raster tiles:
- CARTO Positron: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- OpenStreetMap Standard: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

## High-Density Data Tables
Valuers analyze 30+ property variables simultaneously. Implement the comps adjustment matrix using compact Tailwind classes:
- Font: `font-mono text-xs` for numerical financial inputs.
- Layout: Fixed column widths for Subject Property vs. Comparable 1, 2, 3.
- Instant Calculations: Compute percentage and dollar changes via React `useMemo` client-side before sending commits to the server action.
