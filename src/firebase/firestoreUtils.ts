// src/firebase/firestoreUtils.ts

import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth'; // Importa User dall'SDK Auth
import { db } from './firebaseconfig'; // Assicurati di importare l'istanza di Firestore
import { FirestoreUser, UserProfile } from '../types/UserTypes';
/**
 * Crea un documento utente in Firestore se non esiste.
 * Imposta il ruolo predefinito su 'Lettore' (0).
 *
 * @param user L'oggetto User di Firebase Authentication.
 */
export const ensureUserProfileExists = async (user: User): Promise<void> => {
  const userRef = doc(db, 'users', user.uid); // Il doc ID sarà l'UID dell'utente

  try {
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // Il profilo utente non esiste, creiamolo con ruolo predefinito (Lettore)
      const newUserProfile: FirestoreUser = {
        ID: user.uid, // Campo ID come richiesto
        idProfilo: UserProfile.Lettore, // Default a Lettore
        // email: user.email || '', // Puoi aggiungere l'email
        // displayName: user.displayName || '', // Puoi aggiungere il nome
      };
      await setDoc(userRef, newUserProfile);
      console.log(`Profilo utente creato per ${user.uid} con ruolo Lettore.`);
    } else {
      console.log(`Profilo utente esistente per ${user.uid}.`);
    }
  } catch (error) {
    console.error("Errore durante la verifica o creazione del profilo utente:", error);
    throw error;
  }
};

/**
 * Ottiene il profilo utente da Firestore.
 * @param uid L'UID dell'utente.
 * @returns Il profilo utente Firestore o null se non trovato.
 */
export const getUserProfile = async (uid: string): Promise<FirestoreUser | null> => {
  const userRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreUser;
    }
    return null;
  } catch (error) {
    console.error("Errore durante il recupero del profilo utente:", error);
    throw error;
  }
};

/**
 * Aggiorna il ruolo di un utente.
 * Questa funzione dovrebbe essere chiamata solo da un ambiente sicuro (Cloud Function)
 * o da un utente con privilegi di Admin, gestito dalle regole di sicurezza.
 * @param uid L'UID dell'utente da aggiornare.
 * @param newRole Il nuovo ruolo.
 */
export const updateUserRole = async (uid: string, newRole: UserProfile): Promise<void> => {
  const userRef = doc(db, 'users', uid);
  try {
    await setDoc(userRef, { idProfilo: newRole }, { merge: true });
    console.log(`Ruolo utente ${uid} aggiornato a ${newRole}.`);
  } catch (error) {
    console.error("Errore durante l'aggiornamento del ruolo utente:", error);
    throw error;
  }
};

/**
 * Recupera tutti i profili utente dalla collezione 'users' di Firestore.
 * Questa funzione si basa sulle regole di sicurezza Firestore per autorizzare l'accesso.
 * Dati le regole modificate, sarà accessibile solo agli utenti con idProfilo = Admin (2).
 *
 * @returns Una Promise che si risolve con un array di oggetti FirestoreUser.
 */
export async function getAllUserProfiles(): Promise<FirestoreUser[]> {
    const userProfiles: FirestoreUser[] = [];
  
    try {
      const usersCollectionRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollectionRef); // Questa è l'operazione che richiede il permesso 'list'
  
      querySnapshot.forEach((doc) => {
        userProfiles.push({
          ID: doc.id,
          ...doc.data() as Omit<FirestoreUser, 'ID'> // doc.data() contiene i campi idProfilo, ecc.
        });
      });
  
      return userProfiles;
  
    } catch (e) {
      console.error("Errore nel recuperare tutti i profili utente dal client:", e);
      // Verrà generato un errore di "Permission Denied" se le regole non sono corrette
      throw e;
    }
  }