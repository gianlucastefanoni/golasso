export type Ruolo = 'P' | 'D' | 'C' | 'A'
export type RuoloMantra = 'Por' | 'Dd' | 'Dc' | 'Ds' | 'B' | 'E' | 'M' | 'C' | 'W' | 'T' | 'A' | 'Pc'

export type StatisticheGiocatore = {
  id?: number
  stagione: number
  creazione_dt?: Date
  nome: string
  id_squadra: number
  squadra: string
  r: string
  rm: string[]
  pv: number
  mv: number
  fm: number
  gf: number
  gs: number
  rp: number
  rc: number
  rf: number
  rs: number
  ass: number
  amm: number
  esp: number
  au: number
  id_fanta_squadra: number
  FantaSquadra: string
  id_asta: number
  costo: number
  fl?: boolean 
}

export const FANTA_TEAMS = [
  { id: 10, FantaSquadra: "Coca Kolarov" },
  { id: 4, FantaSquadra: "Mannigger United" },
  { id: 1, FantaSquadra: "FC Ingiocabili" },
  { id: 3, FantaSquadra: "Dio" }, // Nota: occhio che questo potrebbe dare nell'occhio se scali l'app!
  { id: 7, FantaSquadra: "AC PICCHIA" },
  { id: 5, FantaSquadra: "As Borra" },
  { id: 8, FantaSquadra: "AS Piliqueta" },
  { id: 2, FantaSquadra: "Hiroshima Atomic" },
  { id: 9, FantaSquadra: "Pieronekalulu20" },
  { id: 6, FantaSquadra: "Orlando Tragic" }
] as const;

// Se ti serve solo l'elenco dei nomi come stringhe
export const TEAM_NAMES = FANTA_TEAMS.map(team => team.FantaSquadra);

export type ConfigAsta = {
  budget: number
  giocatoriPerRuolo: {
    P: number
    D: number
    C: number
    A: number
  }
  minPartite: number
}