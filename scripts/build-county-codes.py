"""County code data for /build: IECC climate zone, Building America zone and coastal flag.

    python scripts/build-county-codes.py <eeweather metadata.db> <counties.json> > public/geo/codes.json

Sources
  - IECC climate zone / moisture regime / Building America zone: the county list published by
    DOE (Building America "Guide to Determining Climate Regions by County", the county map used
    by the IECC through the 2018 edition), as packaged in the open-source eeweather library
    (metadata.db). Its zone polygons are dissolved county outlines, so each county takes the
    zone that covers most of its area.
  - Coastal flag: counties whose outline touches the national coastline (us-atlas), limited to
    hurricane-coast states. Wind-borne debris regions follow ASCE 7 wind contours and the
    distance to the coast, so the site still has to be checked by address.

counties.json is us-atlas counties-10m as GeoJSON features: [{id, name, geom, outer}].
"""

import json
import sqlite3
import sys

from shapely.geometry import shape
from shapely.strtree import STRtree

db, counties_path = sys.argv[1], sys.argv[2]
c = sqlite3.connect(db)


def layer(table):
    rows = [(k, shape(json.loads(g)).buffer(0)) for k, g in c.execute(f"select * from {table}")]
    return [k for k, _ in rows], [g for _, g in rows]


LAYERS = {name: layer(table) for name, table in (
    ("cz", "iecc_climate_zone_metadata"),
    ("moist", "iecc_moisture_regime_metadata"),
    ("ba", "ba_climate_zone_metadata"),
)}
TREES = {name: STRtree(geoms) for name, (_, geoms) in LAYERS.items()}

HURRICANE_COAST = {"48", "22", "28", "01", "12", "13", "45", "37", "51", "24", "10", "34", "36", "09", "44", "25", "15", "33", "23"}


def best(name, geom):
    keys, geoms = LAYERS[name]
    top, area = None, 0.0
    for i in TREES[name].query(geom):
        a = geom.intersection(geoms[i]).area
        if a > area:
            top, area = keys[i], a
    return top


out = {}
for f in json.load(open(counties_path)):
    if not f["geom"]:
        continue
    g = shape(f["geom"]).buffer(0)
    if g.is_empty:
        continue
    st = f["id"][:2]
    cz, moist, ba = best("cz", g), best("moist", g), best("ba", g)
    pt = g.representative_point()
    lon, lat = pt.x, pt.y
    coast = f["outer"] and st in HURRICANE_COAST
    if st == "48" and lon < -97.6:  # Rio Grande border, not the Gulf
        coast = False
    if st == "36" and lat > 41.3:  # Great Lakes and Canada, not the Atlantic
        coast = False
    rec = {}
    if cz:
        rec["cz"] = f"{cz}{moist or ''}" if cz in ("1", "2", "3", "4", "5", "6") else str(cz)
    if ba:
        rec["ba"] = ba
    if coast:
        rec["coast"] = 1
    out[f["id"]] = rec

json.dump(out, sys.stdout, separators=(",", ":"))
