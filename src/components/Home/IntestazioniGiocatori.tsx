import { StatisticheGiocatore } from "../../types/GiocatoreTypes";
type SortField = keyof StatisticheGiocatore;
type SortDirection = "asc" | "desc";

interface Props {
  sortConfig: { field: SortField; direction: SortDirection } | null;
  onSortClick: (field: SortField) => void;
}

export const IntestazioniGiocatori = ({ sortConfig, onSortClick }: Props) => {
  // Definiamo il layout delle colonne una volta sola
  // ID(45px) | Ruolo(35px) | Nome(auto) | Team(100px) | PV(40px) | MV(50px) | FM(50px) | Arrow(25px)
  const gridLayout = "grid grid-cols-[45px_35px_1fr_100px_40px_50px_50px_50px] items-center gap-2 px-6 py-3";

  const getSortIcon = (field: SortField) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className={`${gridLayout} bg-gray-900/50 text-gray-500 uppercase text-[10px] tracking-widest font-bold border-b border-gray-800`}>
      <div className="cursor-pointer hover:text-gray-300" onClick={() => onSortClick("Cod")}>
        ID{getSortIcon("Cod")}
      </div>
      <div></div> {/* Spazio Ruolo */}
      <div className="cursor-pointer hover:text-gray-300" onClick={() => onSortClick("Nome")}>
        Giocatore{getSortIcon("Nome")}
      </div>
      <div className="text-right cursor-pointer hover:text-gray-300" onClick={() => onSortClick("Squadra")}>
        Team{getSortIcon("Squadra")}
      </div>
      <div className="text-right cursor-pointer hover:text-gray-300" onClick={() => onSortClick("Pv")}>
        PV{getSortIcon("Pv")}
      </div>
      <div className="text-right cursor-pointer hover:text-gray-300" onClick={() => onSortClick("Mv")}>
        MV{getSortIcon("Mv")}
      </div>
      <div className="text-right text-emerald-500 cursor-pointer" onClick={() => onSortClick("Fm")}>
        FM{getSortIcon("Fm")}
      </div>
      <div></div> {/* Spazio Freccia */}
    </div>
  );
};