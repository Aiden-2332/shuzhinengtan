"use client";

import { startTransition } from "react";
import { create } from "zustand";

import type {
  CampusLayerFilter,
  CampusMapBuilding,
} from "@/data/campus-map-buildings";

export interface CampusMapToolbarRegistration {
  ownerId: string;
  buildings: CampusMapBuilding[];
  selectedBuildingId: string | null;
  showLabels: boolean;
  showBuildingFrames: boolean;
  activeLayer: CampusLayerFilter;
  onShowLabelsChange: (show: boolean) => void;
  onShowBuildingFramesChange: (show: boolean) => void;
  onLayerChange: (layer: CampusLayerFilter) => void;
  onBuildingSelect: (id: string) => void;
}

interface CampusMapToolbarStore {
  toolbar: CampusMapToolbarRegistration | null;
  registerToolbar: (toolbar: CampusMapToolbarRegistration) => void;
  unregisterToolbar: (ownerId: string) => void;
  setShowLabels: (show: boolean) => void;
  setShowBuildingFrames: (show: boolean) => void;
  setActiveLayer: (layer: CampusLayerFilter) => void;
  selectBuilding: (id: string) => void;
}

export const useCampusMapToolbarStore = create<CampusMapToolbarStore>((set, get) => ({
  toolbar: null,

  registerToolbar: (toolbar) => set({ toolbar }),

  unregisterToolbar: (ownerId) =>
    set((state) =>
      state.toolbar?.ownerId === ownerId ? { toolbar: null } : state,
    ),

  setShowLabels: (show) => {
    const handler = get().toolbar?.onShowLabelsChange;
    set((state) =>
      state.toolbar
        ? { toolbar: { ...state.toolbar, showLabels: show } }
        : state,
    );
    if (handler) startTransition(() => handler(show));
  },

  setShowBuildingFrames: (show) => {
    const handler = get().toolbar?.onShowBuildingFramesChange;
    set((state) =>
      state.toolbar
        ? { toolbar: { ...state.toolbar, showBuildingFrames: show } }
        : state,
    );
    if (handler) startTransition(() => handler(show));
  },

  setActiveLayer: (layer) => {
    const handler = get().toolbar?.onLayerChange;
    set((state) =>
      state.toolbar
        ? { toolbar: { ...state.toolbar, activeLayer: layer } }
        : state,
    );
    if (handler) startTransition(() => handler(layer));
  },

  selectBuilding: (id) => {
    const handler = get().toolbar?.onBuildingSelect;
    set((state) =>
      state.toolbar
        ? { toolbar: { ...state.toolbar, selectedBuildingId: id } }
        : state,
    );
    if (handler) startTransition(() => handler(id));
  },
}));
