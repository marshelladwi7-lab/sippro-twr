---
name: spatial-postgis
description: Executes spatial queries, radius searches, ST_DWithin clustering, GeoJSON serializations, and PostGIS index optimizations for property locations. Activates on map queries, distance search, coordinates, or spatial SQL.
---

# PostGIS Geospatial Engine

## Spatial Matching Protocol
When a valuer requests comparable data points around a subject property, execute radius matching using indexed spatial queries in Supabase/PostgreSQL:

```sql
-- Efficient spatial comps query using ST_DWithin with geography cast
SELECT 
    id,
    address,
    land_area,
    building_area,
    market_price_raw,
    ST_Distance(geom::geography, ST_SetSRID(ST_MakePoint(:target_lng, :target_lat), 4326)::geography) AS distance_meters
FROM properties
WHERE ST_DWithin(
    geom::geography,
    ST_SetSRID(ST_MakePoint(:target_lng, :target_lat), 4326)::geography,
    :radius_meters -- e.g., 1000m to 3000m
)
AND id != :target_property_id
ORDER BY distance_meters ASC
LIMIT 10;
```

## Spatial Indexing Rule
Every spatial table MUST have a GIST index on geom:
```sql
CREATE INDEX idx_properties_geom ON properties USING GIST (geom);
```
