import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type RoleType = "TUTTI" | "P" | "D" | "C" | "A";

interface HomeFiltersState {
  search: string;
  minPv: number;
  minMv: number;
  minFm: number;
  role: RoleType;
  selectedTeam: string;
  showFuoriLista: boolean;
  selectedStagione: number | "TUTTE";
  setSearch: (value: string) => void;
  setMinPv: (value: number) => void;
  setMinMv: (value: number) => void;
  setMinFm: (value: number) => void;
  setRole: (value: RoleType) => void;
  setSelectedTeam: (value: string) => void;
  setShowFuoriLista: (value: boolean) => void;
  setSelectedStagione: (value: number | "TUTTE") => void;
  resetFilters: () => void;
}

const initialState = {
  search: "",
  minPv: 0,
  minMv: 2,
  minFm: 2,
  role: "TUTTI" as RoleType,
  selectedTeam: "TUTTE",
  showFuoriLista: false,
  selectedStagione: "TUTTE" as number | "TUTTE",
};

export const useHomeFiltersStore = create<HomeFiltersState>()(
  persist(
    (set) => ({
      ...initialState,
      setSearch: (search) => set({ search }),
      setMinPv: (minPv) => set({ minPv }),
      setMinMv: (minMv) => set({ minMv }),
      setMinFm: (minFm) => set({ minFm }),
      setRole: (role) => set({ role }),
      setSelectedTeam: (selectedTeam) => set({ selectedTeam }),
      setShowFuoriLista: (showFuoriLista) => set({ showFuoriLista }),
      setSelectedStagione: (selectedStagione) => set({ selectedStagione }),
      resetFilters: () => set(initialState),
    }),
    {
      name: "golasso-home-filters",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        search: state.search,
        minPv: state.minPv,
        minMv: state.minMv,
        minFm: state.minFm,
        role: state.role,
        selectedTeam: state.selectedTeam,
        showFuoriLista: state.showFuoriLista,
        selectedStagione: state.selectedStagione,
      }),
    },
  ),
);
