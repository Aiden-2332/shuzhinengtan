# TopBuildingSearch specification

## Overview

- Target: `src/components/dashboard/campus-map-overlay-controls.tsx`
- Interaction model: text input, keyboard, and click

## Structure

- Search icon, building-name input and clear button.
- Result list with building name and USTB source category.
- Selected-result carbon summary:
  - annual carbon emission;
  - energy intensity or annual energy use;
  - explicit `暂无碳数据` fallback.

## Behavior

- Case-insensitive building-name/category filter.
- Results are capped and rendered from the locally extracted public POI list.
- Enter selects the first result; Escape closes the result list.
- Selecting a result calls `onBuildingSelect(id)`, centers/highlights the
  building, and exposes its carbon summary.
- Search controls stop pointer/wheel propagation so they never pan or zoom the
  map.

## Styling

- Dark translucent dashboard surface using the existing cyan/blue visual
  language.
- 36 px input, 12 px result text, scrollable result list.
- Search panel remains legible above both bright 2D and 2.5D basemaps.
