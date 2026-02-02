import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebaseconfig";
import { ensureUserProfileExists } from "./firestoreUtils";

export const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      // --- NUOVA LOGICA: Assicurati che il profilo utente esista in Firestore ---
      if (user) {
        await ensureUserProfileExists(user);
      }
      // ----------------------------------------------------------------------
  
      return user;
    } catch (error) {
      console.error("Errore durante il login con Google:", error);
      throw error;
    }
  };

export const logout = () => signOut(auth);