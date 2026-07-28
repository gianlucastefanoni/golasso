import { supabase } from "../supabase/supabaseClient";
import { GiocatoreAnalisiRow } from "../types/GiocatoreTypes";

export async function getGiocatoreAnalisi(
  id: number,
  stagione: number,
): Promise<GiocatoreAnalisiRow | null> {
  const { data, error } = await supabase
    .from("Giocatori_analisi")
    .select("id, stagione, creazione_dt, fascia_id, obiettivo, note")
    .eq("id", id)
    .eq("stagione", stagione)
    .maybeSingle();

  if (error) {
    console.error("Errore nel recuperare l'analisi del giocatore:", error);
    throw error;
  }

  return data ?? null;
}

// Insert-or-update sulla coppia (id, stagione).
// Richiede un vincolo UNIQUE su (id, stagione) nella tabella Giocatori_analisi,
// altrimenti onConflict non ha una constraint su cui basarsi e Supabase inserirà
// sempre una nuova riga invece di aggiornare quella esistente.
export async function upsertGiocatoreAnalisi(
  id: number,
  stagione: number,
  updates: Partial<Omit<GiocatoreAnalisiRow, "id" | "stagione" | "creazione_dt">>,
): Promise<GiocatoreAnalisiRow> {
  const { data, error } = await supabase
    .from("Giocatori_analisi")
    .upsert(
      {
        id,
        stagione,
        fascia_id: updates.fascia_id,
        obiettivo: updates.obiettivo,
        note: updates.note,
      },
      { onConflict: "id,stagione" },
    )
    .select("id, stagione, creazione_dt, fascia_id, obiettivo, note")
    .single();

  if (error) {
    console.error("Errore nell'aggiornamento dell'analisi del giocatore:", error);
    throw error;
  }

  return data;
}