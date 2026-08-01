import { supabase } from "./supabaseClient";
import { FirestoreUser, UserProfile } from "../types/UserTypes";

/**
 * Ottiene il profilo utente dalla tabella 'profiles'.
 */
export const getUserProfile = async (
  uid: string,
): Promise<FirestoreUser | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, id_profilo")
    .eq("id", uid)
    .maybeSingle();

  if (error) {
    console.error("Errore durante il recupero del profilo utente:", error);
    throw error;
  }

  if (!data) return null;

  return { ID: data.id, idProfilo: data.id_profilo as UserProfile };
};

/**
 * Aggiorna il ruolo di un utente. Le policy RLS devono permettere
 * questa update solo agli Admin (vedi SQL sopra).
 */
export const updateUserRole = async (
  uid: string,
  newRole: UserProfile,
): Promise<void> => {
  const { error } = await supabase
    .from("profiles")
    .update({ id_profilo: newRole })
    .eq("id", uid);

  if (error) {
    console.error("Errore durante l'aggiornamento del ruolo utente:", error);
    throw error;
  }
};

/**
 * Recupera tutti i profili utente. Le policy RLS limitano
 * l'accesso solo agli Admin.
 */
export const getAllUserProfiles = async (): Promise<FirestoreUser[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, id_profilo");

  if (error) {
    console.error("Errore nel recuperare tutti i profili utente:", error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    ID: row.id,
    idProfilo: row.id_profilo as UserProfile,
  }));
};

/**
 * Sincronizza l'email dell'utente autenticato sulla tabella 'profiles'.
 * Questa operazione non gestisce la creazione del profilo: aggiorna solo la mail.
 */
export const syncUserProfileEmail = async (
  uid: string,
  email?: string | null,
): Promise<void> => {
  if (!email) return;

  const { error } = await supabase
    .from("profiles")
    .update({ email })
    .eq("id", uid);

  if (error) {
    console.warn("Impossibile sincronizzare l'email del profilo:", error);
  }
};
