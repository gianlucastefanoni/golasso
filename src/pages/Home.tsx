import { useEffect, useState } from "react";
import { StatisticheGiocatore } from "../types/GiocatoreTypes";
import { getAllGiocatori } from "../api/ApiService";
import { Link } from "react-router-dom";
import { GiocatoreCard } from "../components/Home/cards/GiocatoreCard";
import './Home.css'

type SortField = keyof StatisticheGiocatore;
type SortDirection = "asc" | "desc";

export const Home = () => {
  const [giocatori, setGiocatori] = useState<StatisticheGiocatore[]>([]);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection } | null>(null);

  // FILTRI
  const [search, setSearch] = useState("");
  const [minPv, setMinPv] = useState(0);
  const [minMv, setMinMv] = useState(2);
  const [minFm, setMinFm] = useState(2);
  const [role, setRole] = useState<"TUTTI" | "P" | "D" | "C" | "A">("TUTTI");

  useEffect(() => {
    const fetchGiocatori = async () => {
      const data = await getAllGiocatori();
      setGiocatori(data);
    };

    fetchGiocatori();
  }, []);

  const resetFilters = () => {
    setSearch("");
    setMinPv(0);
    setMinMv(2);
    setMinFm(2);
    setRole("TUTTI");
  };

  // ORDINAMENTO
  const sortedGiocatori = [...giocatori];
  if (sortConfig) {
    sortedGiocatori.sort((a, b) => {
      const { field, direction } = sortConfig;
      let aValue = a[field];
      let bValue = b[field];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }

  // FILTRAGGIO
  const filteredGiocatori = sortedGiocatori.filter((g) =>
    g.Pv >= minPv &&
    g.Mv >= minMv &&
    g.Fm >= minFm &&
    g.Nome.toLowerCase().includes(search.toLowerCase()) &&
    (role === "TUTTI" || g.R === role)
  );

  const onHeaderClick = (field: SortField) => {
    if (sortConfig?.field === field) {
      setSortConfig({
        field,
        direction: sortConfig.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortConfig({ field, direction: "asc" });
    }
  };

  const getArrow = (field: SortField) =>
    sortConfig?.field === field ? (sortConfig.direction === "asc" ? "▲" : "▼") : null;

  return (
    <div className="w-full bg-gray-900 text-white min-h-screen h-[100dvh] py-4">
      <div className="w-4/6 mx-auto flex flex-col gap-2 h-full">
        <h2 className="mt-2">Elenco Giocatori</h2>
        <div className="ml-auto mr-0">
          <Link
            to="/statistiche-er"
            className="bg-emerald-800 px-3 py-1 rounded hover:bg-emerald-600 mb-2 inline-block"
          >
            Vai alla pagina ER
          </Link>
        </div>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* FILTRI */}
          <aside className="w-64 flex flex-col gap-4 overflow-auto">
            <input
              type="text"
              placeholder="Cerca per nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-800 text-white rounded px-3 py-2"
            />
            <div className="flex flex-wrap gap-2 justify-between text-xs">
              {["TUTTI", "P", "D", "C", "A"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r as any)}
                  className={`flex-1 py-1 rounded cursor-pointer hover:bg-emerald-500 ${role === r ? "bg-emerald-500" : "bg-emerald-800"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div>
              <label className="text-sm">PV ≥ {minPv}</label>
              <input
                type="range"
                min={0}
                max={38}
                value={minPv}
                onChange={(e) => setMinPv(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm">MV ≥ {minMv}</label>
              <input
                type="range"
                min={2}
                max={10}
                step={0.1}
                value={minMv}
                onChange={(e) => setMinMv(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="text-sm">FM ≥ {minFm}</label>
              <input
                type="range"
                min={2}
                max={10}
                step={0.1}
                value={minFm}
                onChange={(e) => setMinFm(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <button onClick={resetFilters} className="bg-emerald-600 rounded py-1 cursor-pointer hover:bg-emerald-500">
              Reset filtri
            </button>
          </aside>

          {/* LISTA */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* intestazioni fisse */}
            <div className="flex items-center px-4 py-3 gap-3 text-gray-400 uppercase text-xs font-semibold select-none border-b border-gray-700 flex-shrink-0">
              <div className="w-10 cursor-pointer" onClick={() => onHeaderClick("Cod")}>Cod {getArrow("Cod")}</div>
              <div className="w-6"></div>
              <div className="flex-1 cursor-pointer" onClick={() => onHeaderClick("Nome")}>Nome {getArrow("Nome")}</div>
              <div className="w-28 text-right cursor-pointer" onClick={() => onHeaderClick("Squadra")}>Squadra {getArrow("Squadra")}</div>
              <div className="w-12 text-right cursor-pointer" onClick={() => onHeaderClick("Pv")}>PV {getArrow("Pv")}</div>
              <div className="w-12 text-right cursor-pointer" onClick={() => onHeaderClick("Mv")}>MV {getArrow("Mv")}</div>
              <div className="w-12 text-right cursor-pointer" onClick={() => onHeaderClick("Fm")}>FM {getArrow("Fm")}</div>
            </div>

            {/* scroller */}
            <section className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
              {filteredGiocatori.map((g) => (
                <GiocatoreCard key={g.id} giocatore={g} />
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
