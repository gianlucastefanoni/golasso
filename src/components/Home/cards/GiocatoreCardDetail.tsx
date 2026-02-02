import { StatisticheGiocatore } from "../../../types/GiocatoreTypes";

export const GiocatoreCardDetail = ({ giocatore }: { giocatore: StatisticheGiocatore }) => (
  <div className="px-4 py-5 bg-gray-900/80 rounded-b-xl grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
    <Stat label="Gol" value={giocatore.Gf} isPositive={giocatore.Gf > 0} />
    <Stat label="Assist" value={giocatore.Ass} isPositive={giocatore.Ass > 0} />

    {giocatore.R === "P" ? (
      <>
        <Stat label="Subiti" value={giocatore.Gs} isNegative={giocatore.Gs > 0} />
        <Stat label="Parati" value={giocatore.Rp} isPositive={giocatore.Rp > 0} />
      </>
    ) : (
      <>
        <Stat label="Rig. F" value={giocatore.Rf} />
        <Stat label="Rig. S" value={giocatore.Rs} isNegative={giocatore.Rs > 0} />
      </>
    )}

    <Stat label="Amm" value={giocatore.Amm} color="text-yellow-500" />
    <Stat label="Esp" value={giocatore.Esp} color="text-red-500" />
    <Stat label="Autogol" value={giocatore.Au} isNegative={giocatore.Au > 0} />
  </div>
);

const Stat = ({ label, value, isPositive, isNegative, color }: any) => (
  <div className="bg-gray-800/50 p-2 rounded-lg border border-gray-700/50 flex flex-col items-center">
    <div className="text-[9px] uppercase tracking-tighter text-gray-500 font-bold mb-1">{label}</div>
    <div className={`text-sm font-black ${
      color ? color : 
      isPositive ? "text-emerald-400" : 
      isNegative ? "text-red-400" : "text-white"
    }`}>
      {value}
    </div>
  </div>
);
