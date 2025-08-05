import { StatisticheGiocatore } from "../../../types/GiocatoreTypes";

export const GiocatoreCardDetail = ({ giocatore }: { giocatore: StatisticheGiocatore }) => (
  <div className="px-4 py-3 bg-gray-700 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-sm">
    <Stat label="Gol fatti" value={giocatore.Gf} />
    <Stat label="Assist" value={giocatore.Ass} />

    {giocatore.R === "P" ? (
      <>
        <Stat label="Gol subiti" value={giocatore.Gs} />
        <Stat label="Rigori parati" value={giocatore.Rp} />
      </>
    ) : (
      <>
        <Stat label="Rigori calciati" value={giocatore.Rc} />
        <Stat label="Rigori fatti" value={giocatore.Rf} />
        <Stat label="Rigori sbagliati" value={giocatore.Rs} />
      </>
    )}

    <Stat label="Ammonizioni" value={giocatore.Amm} />
    <Stat label="Espulsioni" value={giocatore.Esp} />
    <Stat label="Autogol" value={giocatore.Au} />
  </div>
);

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="text-left">
    <div className="text-xs text-gray-400">{label}</div>
    <div className="font-bold">{value}</div>
  </div>
);
