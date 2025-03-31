// store/BlipStore.ts

import { create } from "zustand";
import { BlipResponse } from "../app/actions/blips";

interface BlipsState {
  newBlips: BlipResponse[];
  blips: BlipResponse[];
  cursor: string;
  hasMore: boolean;
  addNewBlip: (blip: BlipResponse) => void;
  setBlips: (blips: BlipResponse[]) => void;
  appendBlips: (blips: BlipResponse[]) => void; // Nueva acción
  setCursor: (cursor: string) => void;
  setHasMore: (hasMore: boolean) => void;
  clearAllBlips: () => void;
}

export const useBlipsStore = create<BlipsState>((set) => ({
  newBlips: [],
  blips: [],
  cursor: "2100-01-01T00:00:00.000Z",
  hasMore: true,
  addNewBlip: (blip) =>
    set((state) => ({
      newBlips: [blip, ...state.newBlips],
      blips: [blip, ...state.blips].filter(
        (b, i, self) => i === self.findIndex((x) => x.blipId === b.blipId)
      ),
    })),
  setBlips: (blips) =>
    set((state) => ({
      blips: [...state.newBlips, ...blips].filter(
        (b, i, self) => i === self.findIndex((x) => x.blipId === b.blipId)
      ),
    })),
  appendBlips: (blips) =>
    set((state) => ({
      blips: [...state.blips, ...blips].filter(
        (b, i, self) => i === self.findIndex((x) => x.blipId === b.blipId)
      ),
    })),
  setCursor: (cursor) => set({ cursor }),
  setHasMore: (hasMore) => set({ hasMore }),
  clearAllBlips: () =>
    set({
      newBlips: [],
      blips: [],
      cursor: "2100-01-01T00:00:00.000Z",
      hasMore: true,
    }),
}));
