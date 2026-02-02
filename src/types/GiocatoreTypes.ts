export type Ruolo = 'P' | 'D' | 'C' | 'A'
export type RuoloMantra = 'Por' | 'Dd' | 'Dc' | 'Ds' | 'B' | 'E' | 'M' | 'C' | 'W' | 'T' | 'A' | 'Pc'

export type StatisticheGiocatore = {
  id?: string
  Cod: number
  R: string
  Rm: string[]
  Nome: string
  Squadra: string
  Pv: number
  Mv: number
  Fm: number
  Gf: number
  Gs: number
  Rp: number
  Rc: number
  Rf: number
  Rs: number
  Ass: number
  Amm: number
  Esp: number
  Au: number
  FantaSquadra: string
  Costo: number
}

export const FANTA_TEAMS = [
  { id: "CK", FantaSquadra: "Coca Kolarov" },
  { id: "MU", FantaSquadra: "Mannigger United" },
  { id: "ING", FantaSquadra: "FC Ingiocabili" },
  { id: "DIO", FantaSquadra: "Dio" }, // Nota: occhio che questo potrebbe dare nell'occhio se scali l'app!
  { id: "ACP", FantaSquadra: "AC PICCHIA" },
  { id: "ASB", FantaSquadra: "As Borra" },
  { id: "ASP", FantaSquadra: "AS Piliqueta" },
  { id: "HA", FantaSquadra: "Hiroshima Atomic" },
  { id: "PK20", FantaSquadra: "Pieronekalulu20" },
  { id: "OT", FantaSquadra: "Orlando Tragic" }
] as const;

// Se ti serve solo l'elenco dei nomi come stringhe
export const TEAM_NAMES = FANTA_TEAMS.map(team => team.FantaSquadra);