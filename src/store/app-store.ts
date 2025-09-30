'use client';

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserSummary } from "@/types";

type AppStore = {
  currentUser: UserSummary | null;
  selectedLocationId: string | null;
  setUser: (user: UserSummary | null) => void;
  setSelectedLocation: (locationId: string | null) => void;
  logout: () => void;
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      currentUser: null,
      selectedLocationId: null,
      setUser: (user) =>
        set({
          currentUser: user,
          selectedLocationId: user?.manages[0]?.id ?? null,
        }),
      setSelectedLocation: (locationId) => set({ selectedLocationId: locationId }),
      logout: () => set({ currentUser: null, selectedLocationId: null }),
    }),
    {
      name: "booking-app-store",
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedLocationId: state.selectedLocationId,
      }),
    },
  ),
);
