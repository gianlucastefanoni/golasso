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
}