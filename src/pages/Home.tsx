import { useEffect, useState } from "react";
import { StatisticheGiocatore } from "../types/GiocatoreTypes";
import { Link } from "react-router-dom";
import { GiocatoreCard } from "../components/Home/cards/GiocatoreCard";
import { FiltriSidebar } from "../components/Home/FiltriSidebar";
import { IntestazioniGiocatori } from "../components/Home/IntestazioniGiocatori";
import { Header } from "../components/Header";
import { Filter, Settings2, Loader2, RefreshCw } from "lucide-react"; // Loader2 è perfetto per la girella
import './Home.css'
import { useUserStore } from "../store/useUserStore";
import { useGiocatoriStore } from "../store/useGiocatoriStore";

type SortField = keyof StatisticheGiocatore;
type SortDirection = "asc" | "desc";

export const Home = () => {
  const { isEditor } = useUserStore();
  const { giocatori, loading, fetchGiocatori, lastFetched } = useGiocatoriStore();
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
  const timeAgo = lastFetched
    ? `Aggiornato il ${new Date(lastFetched).toLocaleDateString([], { day: '2-digit', month: '2-digit' })} alle ${new Date(lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : "Dati non sincronizzati";

  const handleRefresh = () => {
    // Chiamiamo il fetch con 'true' per ignorare la cache e scaricare tutto
    fetchGiocatori(true);
  };
  useEffect(() => {
    fetchGiocatori(); // Fa la query solo se necessario
  }, []);

  const resetFilters = () => {
    setSearch(""); setMinPv(0); setMinMv(2); setMinFm(2); setRole("TUTTI");
  };

  // ORDINAMENTO E FILTRAGGIO
  const filteredGiocatori = [...giocatori]
    .filter((g) =>
      g.Pv >= minPv &&
      g.Mv >= minMv &&
      g.Fm >= minFm &&
      g.Nome.toLowerCase().includes(search.toLowerCase()) &&
      (role === "TUTTI" || g.R === role)
    )
    .sort((a, b) => {
      const { field, direction } = sortConfig;
      let aV = a[field]; let bV = b[field];
      if (typeof aV === "string" && typeof bV === "string") {
        return direction === "asc" ? aV.localeCompare(bV) : bV.localeCompare(aV);
      }
      return direction === "asc" ? (aV as number) - (bV as number) : (bV as number) - (aV as number);
    });

  const onHeaderClick = (field: SortField) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === "desc" ? "asc" : "desc",
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white overflow-hidden">
      <Header />

      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 py-6 overflow-hidden">

        {/* ACTION BAR */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              Elenco <span className="text-emerald-500">Giocatori</span>
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              {loading ? "Caricamento in corso..." : `Trovati ${filteredGiocatori.length} giocatori`}
            </p>
          </div>

          <div className="flex flex-row gap-x-2 content-center">
            <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest flex items-center">
              {timeAgo}
            </p>

            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Aggiorna dati dal server"
              className={`p-2 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-700 transition-all ${loading ? "opacity-50 cursor-not-allowed" : "active:scale-90"
                }`}
            >
              <RefreshCw className={`w-4 h-4 text-emerald-500 ${loading ? "animate-spin" : ""}`} />
            </button></div>
          {isEditor && <Link
            to="/statistiche-er"
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl transition-all font-bold text-sm"
          >
            <Settings2 className="w-4 h-4" />
            Gestione Giocatori
          </Link>}
        </div>

        {/* CONTENT AREA */}
        <div className="flex gap-6 flex-1 overflow-hidden">

          <aside className="hidden lg:block">
            <FiltriSidebar
              search={search} setSearch={setSearch}
              minPv={minPv} setMinPv={setMinPv}
              minMv={minMv} setMinMv={setMinMv}
              minFm={minFm} setMinFm={setMinFm}
              role={role} setRole={setRole}
              onReset={resetFilters}
            />
          </aside>

          <div className="flex-1 flex flex-col bg-gray-800/20 rounded-2xl border border-gray-800 overflow-hidden relative">
            <IntestazioniGiocatori sortConfig={sortConfig} onSortClick={onHeaderClick} />

            <section className="flex-1 overflow-y-auto p-2 md:p-4 flex flex-col gap-3 custom-scrollbar">
              {loading ? (
                // LA GIRELLA
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-[2px] z-10">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <p className="mt-4 text-emerald-500 font-bold tracking-widest uppercase text-xs animate-pulse">
                    Recupero Dati...
                  </p>
                </div>
              ) : filteredGiocatori.length > 0 ? (
                filteredGiocatori.map((g) => (
                  <GiocatoreCard key={g.id} giocatore={g} />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 italic py-20">
                  <p>Nessun giocatore corrisponde ai filtri</p>
                  <button onClick={resetFilters} className="text-emerald-500 underline mt-2">Reset</button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* ... (resto del codice per Mobile rimane uguale) */}
      <button
        onClick={() => setShowFilters(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-2xl shadow-emerald-900/40 lg:hidden transition-transform active:scale-90 z-40"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* DRAWER FILTRI MOBILE */}
      {showFilters && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <aside className="relative ml-auto w-80 max-w-full h-full bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Filtra</h3>
              <button className="p-2 text-gray-500 hover:text-white" onClick={() => setShowFilters(false)}>✕</button>
            </div>
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