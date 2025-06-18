export type GiocatoreType = {
  id: string
  cod: number
  ruolo: Ruolo
  nome: string
  squadra: string
}

export type TeamData = {
  squadra: string;
  giocatori: GiocatoreType[];
}

export type Ruolo = 'P' | 'D' | 'C' | 'A' | 'ALL'

export type StatisticheGiocatore = {
  cod: number
  voto: number
  gf: number
  gs: number
  rp: number
  rs: number
  rf: number
  au: number
  amm: number
  esp: number
  ass: number
  giornata: number
}