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