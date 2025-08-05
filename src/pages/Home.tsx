import { useEffect, useState } from "react";
import { StatisticheGiocatore } from "../types/GiocatoreTypes";
import { getAllGiocatori } from "../api/ApiService";
import { Link } from "react-router-dom";
import { GiocatoreCard } from "../components/Home/cards/GiocatoreCard";
import './Home.css'
import { FiltriSidebar } from "../components/Home/FiltriSidebar";
import { IntestazioniGiocatori } from "../components/Home/IntestazioniGiocatori";

type SortField = keyof StatisticheGiocatore;
type SortDirection = "asc" | "desc";

export const Home = () => {
  const [giocatori, setGiocatori] = useState<StatisticheGiocatore[]>([]);
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: "Fm",
    direction: "desc",
  });

  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="w-full bg-gray-900 text-white min-h-screen h-[100dvh] p-4 md:px-0">
      <div className="w-full md:w-4/6 mx-auto flex flex-col gap-2 h-full">
        <h2 className="mt-2">Elenco Giocatori</h2>
        <div className="ml-auto mr-0">
          <Link
            to="/statistiche-er"
            className="bg-emerald-600 px-3 py-1 rounded hover:bg-emerald-500 mb-2 inline-block"
          >
            Gestione Giocatori
          </Link>
        </div>

        <div className="flex gap-4 flex-1 overflow-hidden">

          {/* SIDEBAR DESKTOP */}
          <div className="hidden lg:flex">
            <FiltriSidebar
              search={search}
              setSearch={setSearch}
              minPv={minPv}
              setMinPv={setMinPv}
              minMv={minMv}
              setMinMv={setMinMv}
              minFm={minFm}
              setMinFm={setMinFm}
              role={role}
              setRole={setRole}
              onReset={resetFilters}
            />
          </div>

          {/* LISTA */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <IntestazioniGiocatori sortConfig={sortConfig} onSortClick={onHeaderClick} />
            <section className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
              {filteredGiocatori.map((g) => (
                <GiocatoreCard key={g.id} giocatore={g} />
              ))}
            </section>
          </div>
        </div>
      </div>

      {/* BOTTONE FLOTTANTE MOBILE */}
      <button
        onClick={() => setShowFilters(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg lg:hidden"
      >
        Filtra
      </button>

      {/* DRAWER FILTRI MOBILE */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          {/* drawer vero e proprio */}
          <aside className="relative ml-auto w-72 max-w-full h-full bg-gray-800 p-4 flex flex-col gap-4 custom-scrollbar overflow-auto">
            <button
              className="mb-2 self-end text-gray-400"
              onClick={() => setShowFilters(false)}
            >
              ✕
            </button>
            <FiltriSidebar
              search={search} setSearch={setSearch}
              minPv={minPv} setMinPv={setMinPv}
              minMv={minMv} setMinMv={setMinMv}
              minFm={minFm} setMinFm={setMinFm}
              role={role} setRole={setRole}
              onReset={resetFilters}
            />
          </aside>
        </div>
      )}
    </div>
  );
};
