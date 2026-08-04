import { supabase } from "../supabase/supabaseClient";

export interface SimulazioneRosa {
  id: string;
  id_asta: string;
  id_profile: string;
  id_giocatore: string;
  created_at: string;
}

/**
 * Recupera la rosa simulata dell'utente per una specifica asta
 */
export async function getSimulazioneRosa(
  idAsta: string,
  idProfile: string
): Promise<SimulazioneRosa[]> {
  const { data, error } = await supabase
    .from("Simulazione_rosa")
    .select("*")
    .eq("id_asta", idAsta)
    .eq("id_profile", idProfile);

  if (error) {
    console.error("Errore recupero simulazione rosa:", error);

    throw error;
  }

  return data ?? [];
}

/**
 * Aggiunge un giocatore alla simulazione
 */
export async function aggiungiGiocatoreSimulazione(
  idAsta: string,
  idProfile: string,
  idGiocatore: string
): Promise<void> {
  const { error } = await supabase.from("Simulazione_rosa").insert({
    id_asta: idAsta,
    id_profile: idProfile,
    id_giocatore: idGiocatore,
  });

  if (error) {
    // evita errore se già presente
    if (error.code === "23505") {
      return;
    }

    console.error("Errore inserimento giocatore simulazione:", error);

    throw error;
  }
}

/**
 * Rimuove un giocatore dalla simulazione
 */
export async function rimuoviGiocatoreSimulazione(
  idAsta: string,
  idProfile: string,
  idGiocatore: string
): Promise<void> {
  const { error } = await supabase
    .from("Simulazione_rosa")
    .delete()
    .eq("id_asta", idAsta)
    .eq("id_profile", idProfile)
    .eq("id_giocatore", idGiocatore);

  if (error) {
    console.error("Errore rimozione giocatore simulazione:", error);

    throw error;
  }
}

/**
 * Cancella tutta la simulazione dell'asta corrente
 */
export async function svuotaSimulazioneRosa(
  idAsta: string,
  idProfile: string
): Promise<void> {
  const { error } = await supabase
    .from("Simulazione_rosa")
    .delete()
    .eq("id_asta", idAsta)
    .eq("id_profile", idProfile);

  if (error) {
    console.error("Errore pulizia simulazione rosa:", error);

    throw error;
  }
}
