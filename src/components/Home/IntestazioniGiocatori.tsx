import { StatisticheGiocatore } from "../../types/GiocatoreTypes";

type SortField = keyof StatisticheGiocatore;
type SortDirection = "asc" | "desc";

interface Props {
  sortConfig: { field: SortField; direction: SortDirection } | null;
  onSortClick: (field: SortField) => void;
}

export const IntestazioniGiocatori = ({ sortConfig, onSortClick }: Props) => {
  const getArrow = (field: SortField) =>
    sortConfig?.field === field ? (sortConfig.direction === "asc" ? "▲" : "▼") : null;

  return (
    <div className="flex items-center px-4 py-3 gap-3 text-gray-400 uppercase text-xs font-semibold select-none border-b border-gray-700 flex-shrink-0">
      <div className="w-10 cursor-pointer" onClick={() => onSortClick("Cod")}>
        Cod {getArrow("Cod")}
      </div>
      <div className="w-6"></div>
      <div className="flex-1 cursor-pointer" onClick={() => onSortClick("Nome")}>
        Nome {getArrow("Nome")}
      </div>
      <div className="w-28 text-right cursor-pointer" onClick={() => onSortClick("Squadra")}>
        Squadra {getArrow("Squadra")}
      </div>
      <div className="w-12 text-right cursor-pointer" onClick={() => onSortClick("Pv")}>
        PV {getArrow("Pv")}
      </div>
      <div className="w-12 text-right cursor-pointer" onClick={() => onSortClick("Mv")}>
        MV {getArrow("Mv")}
      </div>
      <div className="w-12 text-right cursor-pointer" onClick={() => onSortClick("Fm")}>
        FM {getArrow("Fm")}
      </div>
    </div>
  );
};
