# USTB campus-map overlay behavior research

## Scope

This pass intentionally excludes the base map, 2D/2.5D switching, zooming, and panning. Those capabilities already exist in `CampusTileBackground`.

Reference sources:

- `https://map.ustb.edu.cn/`
- `https://map.ustb.edu.cn/2d/`
- User-provided selected-building screenshot from 2026-07-28
- Public POI endpoint `japi/get_poi_by_sort_xq`
- Public hit-area endpoint `xml/tips/1/{x},{y}.xml`
- Existing `src/data/campus-data.ts` energy/carbon fields

The original runtime creates one HTML `<area shape="poly">` per building. The
area carries a `coords` hit polygon. On `mouseover`, the runtime creates an SVG
`polygon` with a `#00ff33` fill/stroke, `1px` stroke and `0.2` fill opacity. On
`mouseout`, that polygon is removed. The public XML response contains the
authoritative building id, title, POI anchor and polygon x/y arrays.

The original label is a 12 px Microsoft Yahei/PingFang SC white label on
`#3366ff`, with a one-pixel white border, 4 px horizontal padding, 4 px corner
radius, white glow and a small downward arrow image.

## Interaction model

- Building polygons: pointer/click-driven; the hit geometry remains active even
  while its fill is transparent.
- Labels: controlled by a `建筑标签` switch and remain screen-readable while the
  map transforms.
- Search: placed in the system top area; a result exposes existing/demo carbon
  data and can select the building.
- Selection: one building at a time. Clicking a polygon or label selects it; clicking empty map space clears it.
- Focus: selecting from a polygon, label, or search moves the building anchor to
  the viewport center while retaining a useful zoom.
- Popup: anchored to the selected building centroid. This pass provides an empty,
  replaceable shell only.

## States

### Building polygon

- Default: transparent fill and stroke; pointer hit target remains active.
- Hover: original-site green `#00ff33`, `0.2` fill opacity and 1 px
  non-scaling outline.
- Selected: same green geometry remains visible until another building or empty
  map space is selected.

### Building label

- White text on `#3366ff`, 12 px regular, 1 px 4 px padding and 4 px radius.
- A small blue/white triangular pointer targets the POI anchor.
- Selected label keeps the original blue treatment; selection is communicated
  by the building polygon.
- Labels do not inherit map scale; their text remains readable as the map zooms.

### Search

- Results filter by building name and source category.
- Choosing a result selects the building, exposes carbon/energy figures when a
  matching system record exists, and centers the building.
- Buildings without an existing carbon record explicitly show `暂无碳数据`; the
  search never invents authoritative data.
- Escape closes the result menu; the clear button resets the query.

### Popup anchor

- Anchored above the selected centroid and remains screen-sized.
- Contains only an accessible empty shell and close button in this pass; future
  energy/carbon content can replace the body without changing selection logic.
- Close button clears selection.

## Responsive behavior

- Desktop: compact label switch overlays the map; search sits in the map's top
  action row; zoom controls remain available.
- Narrow viewports: search width is capped to the viewport and its result list
  remains scrollable.
- Labels are culled outside the viewport and use source POI anchors. At the
  all-campus fit level, priority labels are shown first to avoid unreadable
  overlap; zooming in progressively reveals the full set.
