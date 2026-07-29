# Campus map overlay topology

1. Existing tiled raster layers (`z-0`, `z-1`).
2. Existing dashboard tint (`z-10`, pointer-events none).
3. Building polygon SVG layer (`z-12`) using map-specific calibrated source
   image-pixel coordinates.
4. Screen-space labels (`z-14`).
5. Label switch (`z-20`) and top-area building search.
6. Existing zoom/reset controls (`z-20`, top right).
7. Selected-building popup anchor (`z-30`).

The public USTB world polygon is retained as provenance, then converted into
separate `2d` and `2_5d` image-pixel polygons using calibrated transforms. Both
render through the exact same `ViewState` transform as their raster tile layer,
so pan and zoom cannot introduce overlay drift.
