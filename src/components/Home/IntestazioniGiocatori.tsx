import { StatisticheGiocatore } from "../../types/GiocatoreTypes";
type SortField = keyof StatisticheGiocatore;
type SortDirection = "asc" | "desc";

interface Props {
  sortConfig: { field: SortField; direction: SortDirection } | null;
  onSortClick: (field: SortField) => void;
}

export const IntestazioniGiocatori = ({ sortConfig, onSortClick }: Props) => {
  const gridLayout = "grid grid-cols-[35px_minmax(140px,1fr)_100px_40px_50px_50px_50px] items-center gap-2 px-6 py-3";

  const getSortIcon = (field: SortField) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className={`${gridLayout} sticky top-0 z-10 bg-gray-900 text-gray-500 uppercase text-[10px] tracking-widest font-bold border-b border-gray-800`}>
      <div></div> {/* Spazio Ruolo */}
      <div className="cursor-pointer hover:text-gray-300" onClick={() => onSortClick("nome")}>
        Giocatore{getSortIcon("nome")}
      </div>
      <div className="text-right cursor-pointer hover:text-gray-300" onClick={() => onSortClick("squadra")}>
        Team{getSortIcon("squadra")}
      </div>
      <div className="text-right cursor-pointer hover:text-gray-300" onClick={() => onSortClick("pv")}>
        PV{getSortIcon("pv")}
      </div>
      <div className="text-right cursor-pointer hover:text-gray-300" onClick={() => onSortClick("mv")}>
        MV{getSortIcon("mv")}
      </div>
      <div className="text-right text-emerald-500 cursor-pointer" onClick={() => onSortClick("fm")}>
        FM{getSortIcon("fm")}
      </div>
      <div></div> {/* Spazio Freccia */}
    </div>
  );
};