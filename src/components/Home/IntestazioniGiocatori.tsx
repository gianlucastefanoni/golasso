import { StatisticheGiocatore } from "../../types/GiocatoreTypes";
type SortField = keyof StatisticheGiocatore;
type SortDirection = "asc" | "desc";

interface Props {
  sortConfig: { field: SortField; direction: SortDirection } | null;
  onSortClick: (field: SortField) => void;
}

export const IntestazioniGiocatori = ({ sortConfig, onSortClick }: Props) => {
  const gridLayout = "grid grid-cols-[45px_35px_1fr_100px_40px_50px_50px_50px] items-center gap-2 px-6 py-3";

  const getSortIcon = (field: SortField) => {
    if (sortConfig?.field !== field) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  return (
    <div className={`${gridLayout} bg-gray-900/50 text-gray-500 uppercase text-[10px] tracking-widest font-bold border-b border-gray-800`}>
      <div className="cursor-pointer hover:text-gray-300" onClick={() => onSortClick("id")}>
        ID{getSortIcon("id")}
      </div>
      <div></div>
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
      <div></div>
    </div>
  );
};