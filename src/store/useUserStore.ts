import { create } from 'zustand';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile } from '../firebase/firestoreUtils';
import { FirestoreUser, UserProfile } from '../types/UserTypes';
import { app } from '../firebase/firebaseconfig';

interface UserState {
  user: User | null;
  profile: FirestoreUser | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  clearStore: () => void;
  initialize: () => void;
}

const auth = getAuth(app);

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  profile: null,
  loading: true, // Inizia true per evitare flash di contenuti protetti
  isAdmin: false,
  isEditor: false,

  clearStore: () => set({ 
    user: null, profile: null, loading: false, isAdmin: false, isEditor: false 
  }),

  initialize: () => {
    // Ascolta i cambiamenti di autenticazione
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profileData = await getUserProfile(firebaseUser.uid);
          set({
            user: firebaseUser,
            profile: profileData,
            isAdmin: profileData?.idProfilo === UserProfile.Admin,
            isEditor: (profileData?.idProfilo ?? 0) >= UserProfile.Scrittore,
            loading: false,
          });
        } catch (err) {
          console.error("Errore store user:", err);
          get().clearStore();
        }
      } else {
        get().clearStore();
      }
    });
  },
}));