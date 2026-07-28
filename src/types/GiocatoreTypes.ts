export type Ruolo = "P" | "D" | "C" | "A";
export type RuoloMantra =
  | "Por"
  | "Dd"
  | "Dc"
  | "Ds"
  | "B"
  | "E"
  | "M"
  | "C"
  | "W"
  | "T"
  | "A"
  | "Pc";

export type StatisticheGiocatore = {
  id: number;
  stagione: number;
  creazione_dt?: Date;
  nome: string;
  id_squadra: number | null;
  squadra: string;
  r: string;
  rm: string[];
  pv: number;
  mv: number;
  fm: number;
  gf: number;
  gs: number;
  rp: number;
  rc: number;
  rf: number;
  rs: number;
  ass: number;
  amm: number;
  esp: number;
  au: number;
  id_fanta_squadra: number | null;
  FantaSquadra: string;
  id_asta: number | null;
  costo: number | null;
  costo_prev: number | null;
  fl?: boolean;
};

export type FantaSquadra = {
  id: number;
  nome: string;
};

export type Squadra = {
  id: number;
  nome: string;
  stagione: number;
};

export type ConfigAsta = {
  budget: number;
  giocatoriPerRuolo: {
    P: number;
    D: number;
    C: number;
    A: number;
  };
  minPartite: number;
};

// Rispecchia 1:1 le colonne Postgres, snake_case, nomi tabella esatti (case-sensitive)

export type AstaRow = {
  id: number;
  creazione_dt: string;
  stagione: number | null;
  budget: number | null;
  partecipanti: number | null;
};

export type SquadraRow = {
  id: number;
  creazione_dt: string;
  nome: string | null;
  stagione: number | null;
};

export type FantaSquadraRow = {
  id: number;
  creazione_dt: string;
  nome: string | null;
};

export type GiocatoreRow = {
  id: number;
  stagione: number;
  creazione_dt: string;
  nome: string | null;
  id_squadra: number | null;
  r: string | null;
  rm: string | null;
  pv: number | null;
  mv: number | null;
  fm: number | null;
  gf: number | null;
  gs: number | null;
  rp: number | null;
  rc: number | null;
  rf: number | null;
  rs: number | null;
  ass: number | null;
  amm: number | null;
  esp: number | null;
  au: number | null;
  id_fanta_squadra: number | null;
  id_asta: number | null;
  costo: number | null;
  costo_prev: number | null;
  fl: boolean | null;
  // presenti solo se richiesti con la join nella select
  Squadre?: { nome: string | null } | null;
  Fanta_squadre?: { nome: string | null } | null;
  fascia_id?: number | null;
  obiettivo?: boolean | null;
  note?: string | null;
};

export type FasciaRow = {
  id: number;
  created_at?: string;
  nome: string | null;
  colore: string | null;
};

export type GiocatoreAnalisiRow = {
  id: number;
  stagione: number;
  creazione_dt?: string;
  fascia_id?: number;
  obiettivo?: boolean;
  note?: string;
};
