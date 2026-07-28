import { supabase } from "../supabase/supabaseClient";

export type FasciaRow = {
  id: number;
  created_at?: string;
  nome: string | null;
  colore: string | null;
};

export async function getAllFasce(): Promise<FasciaRow[]> {
  const { data, error } = await supabase
    .from("Fasce")
    .select("id, created_at, nome, colore")
    .order("id");

  if (error) {
    console.error("Errore nel recuperare le fasce:", error);
    throw error;
  }

  return (data ?? []).map(row => ({
    id: row.id,
    created_at: row.created_at ?? undefined,
    nome: row.nome ?? null,
    colore: row.colore ?? null,
  }));
}

export async function createFascia(
  nuovaFascia: Omit<FasciaRow, "id" | "created_at">
): Promise<FasciaRow> {
  const { data, error } = await supabase
    .from("Fasce")
    .insert({
      nome: nuovaFascia.nome,
      colore: nuovaFascia.colore,
    })
    .select("id, created_at, nome, colore")
    .single();

  if (error) {
    console.error("Errore nella creazione della fascia:", error);
    throw error;
  }

  return {
    id: data.id,
    created_at: data.created_at ?? undefined,
    nome: data.nome ?? null,
    colore: data.colore ?? null,
  };
}

export async function updateFascia(
  id: number,
  updates: Partial<Omit<FasciaRow, "id" | "created_at">>
): Promise<FasciaRow> {
  const { data, error } = await supabase
    .from("Fasce")
    .update({
      nome: updates.nome,
      colore: updates.colore,
    })
    .eq("id", id)
    .select("id, created_at, nome, colore")
    .single();

  if (error) {
    console.error("Errore nell'aggiornamento della fascia:", error);
    throw error;
  }

  return {
    id: data.id,
    created_at: data.created_at ?? undefined,
    nome: data.nome ?? null,
    colore: data.colore ?? null,
  };
}