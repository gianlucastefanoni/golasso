import { supabase } from "../supabase/supabaseClient";
import {
  StatisticheGiocatore,
  GiocatoreRow,
  GiocatoreAnalisiRow,
} from "../types/GiocatoreTypes";

function chiaveAnalisi(id: number, stagione: number): string {
  return `${id}-${stagione}`;
}

// Recupera le righe di Giocatori_analisi corrispondenti alle coppie (id, stagione)
// passate e le restituisce come mappa per un merge lato client rapido (O(1) per giocatore).
// Se per una coppia (id, stagione) non esiste la riga, semplicemente non comparirà
// nella mappa: chi la consulta userà valori null/undefined di default.
async function getAnalisiMap(
  righe: { id: number; stagione: number }[],
): Promise<Map<string, GiocatoreAnalisiRow>> {
  if (righe.length === 0) return new Map();

  const ids = Array.from(new Set(righe.map(r => r.id)));
  const stagioni = Array.from(new Set(righe.map(r => r.stagione)));

  const { data, error } = await supabase
    .from("Giocatori_analisi")
    .select("id, stagione, creazione_dt, fascia_id, obiettivo, note")
    .in("id", ids)
    .in("stagione", stagioni);

  if (error) {
    console.error("Errore nel recuperare Giocatori_analisi:", error);
    throw error;
  }

  const map = new Map<string, GiocatoreAnalisiRow>();
  (data ?? []).forEach((row: GiocatoreAnalisiRow) => {
    map.set(chiaveAnalisi(row.id, row.stagione), row);
  });

  return map;
}

function mapRowToGiocatore(
  row: GiocatoreRow,
  analisi?: GiocatoreAnalisiRow,
): StatisticheGiocatore {
  return {
    id: row.id,
    stagione: row.stagione,
    creazione_dt: row.creazione_dt ? new Date(row.creazione_dt) : undefined,
    nome: row.nome ?? "",
    id_squadra: row.id_squadra,
    squadra: row.Squadre?.nome ?? "",
    r: row.r ?? "",
    rm: row.rm
      ? row.rm
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    pv: row.pv ?? 0,
    mv: row.mv ?? 0,
    fm: row.fm ?? 0,
    gf: row.gf ?? 0,
    gs: row.gs ?? 0,
    rp: row.rp ?? 0,
    rc: row.rc ?? 0,
    rf: row.rf ?? 0,
    rs: row.rs ?? 0,
    ass: row.ass ?? 0,
    amm: row.amm ?? 0,
    esp: row.esp ?? 0,
    au: row.au ?? 0,
    id_fanta_squadra: row.id_fanta_squadra,
    FantaSquadra: row.Fanta_squadre?.nome ?? "",
    id_asta: row.id_asta,
    costo: row.costo,
    costo_prev: row.costo_prev,
    fl: row.fl ?? false,
    // --- dati da Giocatori_analisi (left join lato client) ---
    fascia_id: analisi?.fascia_id ?? null,
    obiettivo: analisi?.obiettivo ?? null,
    note: analisi?.note ?? null,
  };
}

// Query con join automatiche: richiede la FK su id_fanta_squadra (vedi nota sopra).
// Se non vuoi aggiungerla, usa getAllGiocatoriSenzaJoinFanta() più sotto.
export async function getAllGiocatori(
  stagione?: number,
): Promise<StatisticheGiocatore[]> {
  let query = supabase.from("Giocatori").select(`
      id, stagione, creazione_dt, nome, id_squadra, r, rm, pv, mv, fm, gf, gs,
      rp, rc, rf, rs, ass, amm, esp, au, id_fanta_squadra, id_asta, costo, costo_prev, fl, 
      Squadre ( nome ),
      Fanta_squadre ( nome )
    `);

  if (stagione !== undefined) {
    query = query.eq("stagione", stagione);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Errore nel recuperare i giocatori:", error);
    throw error;
  }

  const rows = (data ?? []) as unknown as GiocatoreRow[];
  const analisiMap = await getAnalisiMap(
    rows.map(r => ({ id: r.id, stagione: r.stagione })),
  );

  return rows.map(row =>
    mapRowToGiocatore(row, analisiMap.get(chiaveAnalisi(row.id, row.stagione))),
  );
}

// Fallback SENZA la FK su Fanta_squadre: due query + merge lato client.
export async function getAllGiocatoriSenzaJoinFanta(
  stagione?: number,
): Promise<StatisticheGiocatore[]> {
  let query = supabase.from("Giocatori").select(`
      id, stagione, creazione_dt, nome, id_squadra, r, rm, pv, mv, fm, gf, gs,
      rp, rc, rf, rs, ass, amm, esp, au, id_fanta_squadra, id_asta, costo, costo_prev,
      Squadre ( nome )
    `);

  if (stagione !== undefined) query = query.eq("stagione", stagione);

  const [giocatoriRes, fantaRes] = await Promise.all([
    query,
    supabase.from("Fanta_squadre").select("id, nome"),
  ]);

  if (giocatoriRes.error) throw giocatoriRes.error;
  if (fantaRes.error) throw fantaRes.error;

  const fantaMap = new Map(
    (fantaRes.data ?? []).map((f: any) => [f.id, f.nome ?? ""]),
  );

  const rows = (giocatoriRes.data ?? []) as unknown as GiocatoreRow[];
  const analisiMap = await getAnalisiMap(
    rows.map(r => ({ id: r.id, stagione: r.stagione })),
  );

  return rows.map(row => {
    const mapped = mapRowToGiocatore(
      row,
      analisiMap.get(chiaveAnalisi(row.id, row.stagione)),
    );
    mapped.FantaSquadra = (fantaMap.get(mapped.id_fanta_squadra) as string) ?? "";
    return mapped;
  });
}

export async function addStatisticheFromData(
  statisticheData: StatisticheGiocatore[],
): Promise<void> {

  const rows = statisticheData.map((s) => ({
    id: s.id,
    stagione: s.stagione,
    nome: s.nome,
    id_squadra: s.id_squadra,
    r: s.r,
    rm: Array.isArray(s.rm) ? s.rm.join(",") : s.rm,
    pv: s.pv,
    mv: s.mv,
    fm: s.fm,
    gf: s.gf,
    gs: s.gs,
    rp: s.rp,
    rc: s.rc,
    rf: s.rf,
    rs: s.rs,
    ass: s.ass,
    amm: s.amm,
    esp: s.esp,
    au: s.au,
    id_fanta_squadra: s.id_fanta_squadra,
    id_asta: s.id_asta,
    costo: s.costo,
    costo_prev: s.costo_prev,
    fl: s.fl,
  }));


  const { error } = await supabase.rpc(
    "upsert_statistiche_giocatori",
    {
      giocatori: rows
    }
  );


  if (error) {
    console.error(
      "Errore durante sincronizzazione statistiche:",
      error
    );
    throw error;
  }

  console.log("Sincronizzazione completata");
}

export async function getStoricoGiocatore(
  id: number,
): Promise<StatisticheGiocatore[]> {
  const { data, error } = await supabase
    .from("Giocatori")
    .select(
      `
      id, stagione, creazione_dt, nome, id_squadra, r, rm, pv, mv, fm, gf, gs,
      rp, rc, rf, rs, ass, amm, esp, au, id_fanta_squadra, id_asta, costo, costo_prev, fl,
      Squadre ( nome ),
      Fanta_squadre ( nome )
    `,
    )
    .eq("id", id)
    .order("stagione", { ascending: true });

  if (error) {
    console.error("Errore nel recuperare lo storico del giocatore:", error);
    throw error;
  }

  const rows = (data ?? []) as unknown as GiocatoreRow[];
  const analisiMap = await getAnalisiMap(
    rows.map(r => ({ id: r.id, stagione: r.stagione })),
  );

  return rows.map(row =>
    mapRowToGiocatore(row, analisiMap.get(chiaveAnalisi(row.id, row.stagione))),
  );
}

export async function assegnaGiocatore(
  id: number,
  stagione: number,
  id_fanta_squadra: number | null,
  costo: number | null,
  costo_prev: number | null,
): Promise<void> {
  const { error } = await supabase
    .from("Giocatori")
    .update({ id_fanta_squadra, costo, costo_prev })
    .eq("id", id)
    .eq("stagione", stagione); // chiave composita: entrambe le condizioni sono necessarie

  if (error) {
    console.error("Errore durante l'assegnazione del giocatore:", error);
    throw error;
  }
}