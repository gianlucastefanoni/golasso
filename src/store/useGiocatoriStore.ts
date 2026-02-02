import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAllGiocatori } from '../api/ApiService';
import { StatisticheGiocatore } from '../types/GiocatoreTypes';

interface GiocatoriState {
  giocatori: StatisticheGiocatore[];
  lastFetched: number | null;
  loading: boolean;
  fetchGiocatori: (force?: boolean) => Promise<void>;
  clearCache: () => void;
}

export const useGiocatoriStore = create<GiocatoriState>()(
  persist(
    (set, get) => ({
      giocatori: [],
      lastFetched: null,
      loading: false,

      fetchGiocatori: async (force = false) => {
        const { giocatori, lastFetched } = get();
        const ora = Date.now();
        // Aumentiamo a 30 minuti la cache visto che i dati dei calciatori non cambiano ogni istante
        const cacheTime = 30 * 60 * 1000; 

        // Ritorna se abbiamo dati validi e non è richiesto un force refresh
        if (
          !force && 
          giocatori.length > 0 && 
          lastFetched && 
          (ora - lastFetched < cacheTime)
        ) {
          console.log("🚀 Dati recuperati dal LocalStorage (Zustand Persist)");
          return;
        }

        set({ loading: true });
        try {
          const data = await getAllGiocatori();
          set({ 
            giocatori: data, 
            lastFetched: ora,
            loading: false 
          });
          console.log("📥 Query Firestore eseguita: Dati aggiornati");
        } catch (error) {
          console.error("Errore fetch:", error);
          set({ loading: false });
        }
      },
      clearCache: () => {
        set({ giocatori: [], lastFetched: null });
        // Questo svuota anche il LocalStorage grazie al middleware persist
        localStorage.removeItem('golasso-giocatori-cache');
      },
    }),
    {
      name: 'golasso-giocatori-cache', // Chiave nel LocalStorage
      storage: createJSONStorage(() => localStorage),
      // Evitiamo di salvare lo stato 'loading' nella cache
      partialize: (state) => ({ 
        giocatori: state.giocatori, 
        lastFetched: state.lastFetched 
      }),
    }
  )
);