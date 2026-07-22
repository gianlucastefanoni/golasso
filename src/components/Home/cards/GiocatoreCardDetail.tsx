import { StatisticheGiocatore } from "../../../types/GiocatoreTypes";

export const GiocatoreCardDetail = ({ giocatore }: { giocatore: StatisticheGiocatore }) => (
  <div className="px-4 py-5 bg-gray-900/80 rounded-b-xl grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
    <Stat label="Gol" value={giocatore.gf} isPositive={giocatore.gf > 0} />
    <Stat label="Assist" value={giocatore.ass} isPositive={giocatore.ass > 0} />

    {giocatore.r === "P" ? (
      <>
        <Stat label="Subiti" value={giocatore.gs} isNegative={giocatore.gs > 0} />
        <Stat label="Parati" value={giocatore.rp} isPositive={giocatore.rp > 0} />
      </>
    ) : (
      <>
        <Stat label="Rig. F" value={giocatore.rf} />
        <Stat label="Rig. S" value={giocatore.rs} isNegative={giocatore.rs > 0} />
      </>
    )}

    <Stat label="Amm" value={giocatore.amm} color="text-yellow-500" />
    <Stat label="Esp" value={giocatore.esp} color="text-red-500" />
    <Stat label="Autogol" value={giocatore.au} isNegative={giocatore.au > 0} />
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