import { StatisticheGiocatore } from "../../../types/GiocatoreTypes";
import { RuoloBadge } from "../RuoloBadge";

export const GiocatoreCardCompact = ({ giocatore }: { giocatore: StatisticheGiocatore }) => (
    <div className="flex flex-col sm:flex-row sm:items-center px-4 py-3 gap-3">
      <div className="flex items-center gap-3">
        <span className="text-xs w-10 text-gray-400">{giocatore.Cod}</span>
        <RuoloBadge ruolo={giocatore.R} />
        <div className="font-bold uppercase">{giocatore.Nome}</div>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end gap-3">
        <div className="w-28 text-right">{giocatore.Squadra}</div>
        <div className="w-12 text-right">{giocatore.Pv}</div>
        <div className="w-12 text-right">{giocatore.Mv}</div>
        <div className="w-12 text-right">{giocatore.Fm}</div>
      </div>
    </div>
  );
  