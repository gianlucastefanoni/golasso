import { StatisticheGiocatore } from "../../../types/GiocatoreTypes";
import { RuoloBadge } from "../RuoloBadge";

export const GiocatoreCardCompact = ({
  giocatore,
  isOpen,
}: {
  giocatore: StatisticheGiocatore;
  isOpen: boolean;
}) => {
  const gridLayout =
    "grid grid-cols-[35px_minmax(120px,1fr)_72px_40px_50px_50px_50px] md:grid-cols-[35px_minmax(140px,1fr)_100px_40px_50px_50px_50px] items-center gap-2 px-4 md:px-6 py-4";

  return (
    <div className={gridLayout}>
      <div className="flex justify-center">
        <RuoloBadge ruolo={giocatore.r} />
      </div>

      <div className="font-bold uppercase tracking-tight text-sm truncate text-white">
        {giocatore.nome}
      </div>

      <div className="text-left md:text-right text-[10px] font-bold text-gray-400 uppercase truncate">
        {giocatore.squadra}
      </div>

      <div className="text-right text-sm text-gray-300">{giocatore.pv}</div>

      <div className="text-right text-sm text-gray-300 font-medium">
        {giocatore.mv.toFixed(2)}
      </div>

      <div className="text-right text-sm font-black text-emerald-400">
        {giocatore.fm.toFixed(2)}
      </div>

      <div
        className={`flex justify-end text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
};
