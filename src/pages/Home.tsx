import { useEffect, useMemo, useState } from "react";
import { StatisticheGiocatore, FantaSquadra } from "../types/GiocatoreTypes";
import { Link } from "react-router-dom";
import { GiocatoreCard } from "../components/Home/cards/GiocatoreCard";
import { FiltriSidebar } from "../components/Home/FiltriSidebar";
import { IntestazioniGiocatori } from "../components/Home/IntestazioniGiocatori";
import { Header } from "../components/Header";
import { Filter, Settings2, Loader2, RefreshCw } from "lucide-react";
import './Home.css'
import { useUserStore } from "../store/useUserStore";
import { useGiocatoriStore } from "../store/useGiocatoriStore";
import { getAllFantaSquadre } from "../api/fantaSquadreApi";
import { getAllStagioni } from "../api/astaApi";

type SortField = keyof StatisticheGiocatore;
type SortDirection = "asc" | "desc";

export const Home = () => {
  const { isEditor } = useUserStore();
  const { giocatori, loading, fetchGiocatori, lastFetched } = useGiocatoriStore();
  const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({
    field: "fm",
    direction: "desc",
  });

  const [showFilters, setShowFilters] = useState(false);

  // DATI DI SUPPORTO (stagioni disponibili, fanta squadre)
  const [stagioni, setStagioni] = useState<number[]>([]);
  const [fantaSquadre, setFantaSquadre] = useState<FantaSquadra[]>([]);
  const [selectedStagione, setSelectedStagione] = useState<number | "TUTTE">("TUTTE");

  // FILTRI
  const [search, setSearch] = useState("");
  const [minPv, setMinPv] = useState(0);
  const [minMv, setMinMv] = useState(0);
  const [minFm, setMinFm] = useState(0);
  const [role, setRole] = useState<"TUTTI" | "P" | "D" | "C" | "A">("TUTTI");
  const [selectedTeam, setSelectedTeam] = useState("TUTTE");
  const [showFuoriLista, setShowFuoriLista] = useState(false);
  const timeAgo = lastFetched
    ? `Aggiornato il ${new Date(lastFetched).toLocaleDateString([], { day: '2-digit', month: '2-digit' })} alle ${new Date(lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : "Dati non sincronizzati";

  const handleRefresh = () => {
    fetchGiocatori(true);
  };

  useEffect(() => {
    fetchGiocatori();

    Promise.all([getAllStagioni(), getAllFantaSquadre()])
      .then(([stagioniList, fantaList]) => {
        setStagioni(stagioniList);
        setFantaSquadre(fantaList);
        if (stagioniList.length > 0) setSelectedStagione(stagioniList[0]); // più recente di default
      })
      .catch((err) => console.error("Errore caricamento stagioni/fanta squadre:", err));
  }, []);

  const resetFilters = () => {
    setSearch(""); setMinPv(0); setMinMv(2); setMinFm(2); setRole("TUTTI"); setSelectedTeam("TUTTE"); setShowFuoriLista(false);
    if (stagioni.length > 0) setSelectedStagione(stagioni[0]);
  };

  // ORDINAMENTO E FILTRAGGIO
  const filteredGiocatori = useMemo(() => {
    return [...giocatori]
      .filter((g) =>
        (selectedStagione === "TUTTE" || g.stagione === selectedStagione) &&
        g.pv >= minPv &&
        g.mv >= minMv &&
        g.fm >= minFm &&
        g.nome.toLowerCase().includes(search.toLowerCase()) &&
        (role === "TUTTI" || g.r === role) &&
        (selectedTeam === "TUTTE" ||
          (selectedTeam === "LIBERI" && (g.FantaSquadra === "-" || !g.FantaSquadra)) ||
          g.FantaSquadra === selectedTeam) &&
        (showFuoriLista || !g.fl)
      )
      .sort((a, b) => {
        const { field, direction } = sortConfig;
        const aV = a[field]; const bV = b[field];
        if (typeof aV === "string" && typeof bV === "string") {
          return direction === "asc" ? aV.localeCompare(bV) : bV.localeCompare(aV);
        }
        return direction === "asc" ? (Number(aV) - Number(bV)) : (Number(bV) - Number(aV));
      });
  }, [giocatori, selectedStagione, minPv, minMv, minFm, search, role, selectedTeam, showFuoriLista, sortConfig]);

  const onHeaderClick = (field: SortField) => {
    setSortConfig({
      field,
      direction: sortConfig.field === field && sortConfig.direction === "desc" ? "asc" : "desc",
    });
  };

  const filtriProps = {
    search, setSearch,
    minPv, setMinPv,
    minMv, setMinMv,
    minFm, setMinFm,
    role, setRole,
    selectedTeam, setSelectedTeam,
    showFuoriLista, setShowFuoriLista,
    stagioni, selectedStagione, setSelectedStagione,
    fantaSquadre,
    onReset: resetFilters,
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

          <aside className="hidden lg:block h-full">
            <FiltriSidebar {...filtriProps} />
          </aside>

          <div className="flex-1 flex flex-col bg-gray-800/20 rounded-2xl border border-gray-800 overflow-hidden relative">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/40 backdrop-blur-[2px] z-20">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="mt-4 text-emerald-500 font-bold tracking-widest uppercase text-xs animate-pulse">
                  Recupero Dati...
                </p>
              </div>
            )}

            {/* Un solo contenitore per scroll orizzontale + verticale: intestazione e righe si muovono sempre insieme */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <div className="min-w-[420px]">
                <IntestazioniGiocatori sortConfig={sortConfig} onSortClick={onHeaderClick} />

                <section className="p-2 md:p-4 flex flex-col gap-3">
                  {!loading && filteredGiocatori.length > 0 ? (
                    filteredGiocatori.map((g) => (
                      <GiocatoreCard key={`${g.id}-${g.stagione}`} giocatore={g} />
                    ))
                  ) : !loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 italic py-20">
                      <p>Nessun giocatore corrisponde ai filtri</p>
                      <button onClick={resetFilters} className="text-emerald-500 underline mt-2">Reset</button>
                    </div>
                  ) : null}
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <button
        onClick={() => setShowFilters(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-2xl shadow-emerald-900/40 lg:hidden transition-transform active:scale-90 z-40"
      >
        <Filter className="w-6 h-6" />
      </button>

      {showFilters && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <aside className="relative ml-auto w-80 max-w-full h-full bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Filtra</h3>
              <button className="p-2 text-gray-500 hover:text-white" onClick={() => setShowFilters(false)}>✕</button>
            </div>
            <FiltriSidebar {...filtriProps} />
          </aside>
        </div>
      )}
    </div>
  );
};