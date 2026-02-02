// src/types/UserTypes.ts

export enum UserProfile {
    Lettore = 0,
    Scrittore = 1,
    Admin = 2,
}

// Interfaccia per il documento utente in Firestore
export interface FirestoreUser {
    ID: string; // L'UID dell'utente, memorizzato come campo nel documento
    idProfilo: UserProfile; // Il ruolo dell'utente
    // Puoi aggiungere altri campi qui, ad esempio:
    // email: string;
    // displayName: string;
}
