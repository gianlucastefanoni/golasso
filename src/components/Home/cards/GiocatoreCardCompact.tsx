import { StatisticheGiocatore } from "../../../types/GiocatoreTypes";
import { RuoloBadge } from "../RuoloBadge";

export const GiocatoreCardCompact = ({ giocatore, isOpen }: { giocatore: StatisticheGiocatore, isOpen: boolean }) => {
  // STESSO IDENTICO LAYOUT DELL'INTESTAZIONE
  const gridLayout = "grid grid-cols-[45px_35px_1fr_100px_40px_50px_50px_25px] items-center gap-2 px-6 py-4";

  return (
    <div className={gridLayout}>
      {/* ID */}
      <span className="text-[10px] font-mono text-gray-500">#{giocatore.Cod}</span>
      
      {/* RUOLO */}
      <div className="flex justify-center">
        <RuoloBadge ruolo={giocatore.R} />
      </div>
      
      {/* NOME */}
      <div className="font-bold uppercase tracking-tight text-sm truncate text-white">
        {giocatore.Nome}
      </div>

      {/* TEAM */}
      <div className="text-right text-[10px] font-bold text-gray-400 uppercase truncate">
        {giocatore.Squadra}
      </div>

      {/* PV */}
      <div className="text-right text-sm text-gray-300">{giocatore.Pv}</div>
      
      {/* MV */}
      <div className="text-right text-sm text-gray-300 font-medium">{giocatore.Mv.toFixed(2)}</div>
      
      {/* FM */}
      <div className="text-right text-sm font-black text-emerald-400">{giocatore.Fm.toFixed(2)}</div>
      
      {/* FRECCIA */}
      <div className={`flex justify-end text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};