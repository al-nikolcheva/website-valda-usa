# System models

Generates the interactive 3D models in `public/models/<slug>.glb` for every
system in `src/data/valda-products.json`, so they are all drawn the same way.

    bun scripts/system-models/build.ts            # all systems
    bun scripts/system-models/build.ts series-88  # just one

- `catalog.ts` — one entry per system: material, opening type, depths, size.
  `confirm` marks dimensions still to check against manufacturer drawings.
- `sections.ts` — profile sections. Parametric templates for aluminium and PVC
  casement, sliding, folding and curtain wall. Kömmerling 76 MD uses the real
  section in `sections/76md.json`, extracted from
  `public/downloads/series-76-md/series-76-md-sections.dxf`.
- `assemblies.ts` — opening types (casement / tilt & turn / door, double,
  sliding / lift & slide, folding, curtain wall, window wall).
- `geometry.ts` — sweeps sections into mitred members; `build.ts` writes GLB.

Material names are fixed so the viewer can recolour them: `Aluminium exterior`,
`Aluminium interior`, `PVC`, `Polyamide`, `Insulating foam`,
`Steel reinforcement`, `EPDM`, `Spacer`, `Glass`, `Hardware`.

Geometry is indicative except where a real section is used. Not for construction.
When a manufacturer DWG/DXF section arrives, extract it like 76md.json and point
the system's catalog entry at it.
