# BuildingLayer specification

## Overview

- Target: `src/components/dashboard/campus-building-layer.tsx`
- Interaction model: pointer/click-driven
- Coordinate space: map-specific source pixels, transformed with the same
  `ViewState` as map tiles

## DOM structure

- Full-map SVG transformed by `translate3d(offsetX, offsetY, 0) scale(scale)`
- One polygon per building
- Screen-space HTML label container per visible building
- Selected-building popup anchor

## States and styles

- Default polygon: transparent, with pointer hit testing enabled.
- Hover/selected polygon: `#00ff33` fill at 0.2 opacity, `#00ff33`
  non-scaling 1 px stroke.
- Default label: original `#3366ff`, white 12 px regular text, white 1 px
  border/glow and downward pointer.
- Popup: empty anchored shell, positioned above the selected anchor, close
  button only, no copied content.

## Behavior

- Pointer down on a polygon/label stops map dragging.
- Click selects one building, invokes `onSelect`, and the parent centers it.
- Empty map click clears selection through the parent component.
- Labels follow `offsetX`, `offsetY`, and `scale` but remain unscaled themselves.
- Low zoom renders only priority labels; higher zoom reveals all labels.
- All text and controls expose accessible labels.

## Responsive

- Popup and labels are screen-space overlays.
- Popup clamps inside the current viewport.
