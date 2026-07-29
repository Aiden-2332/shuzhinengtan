# MapOverlayControls specification

## Overview

- Target: `src/components/dashboard/campus-map-overlay-controls.tsx`
- Interaction model: click-driven

## Structure

- One original-site-inspired checkbox/switch: `建筑标签`.

## Behavior

- Controls stop pointer propagation so map dragging is not started.
- Toggling the switch changes label visibility only. Building hit targets remain
  available so hover/click still works.

## Styles

- Compact dashboard surface with a blue active state and white label.

## Responsive

- The control stays compact and does not cover the map on narrow viewports.
