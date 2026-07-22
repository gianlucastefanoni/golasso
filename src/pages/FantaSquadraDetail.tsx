import { useState, useMemo, useEffect } from "react";
import { useGiocatoriStore } from "../store/useGiocatoriStore";
import { Header } from "../components/Header";
import { Wallet, Info, AlertTriangle, TrendingUp } from "lucide-react";
import { FantaSquadra } from "../types/GiocatoreTypes";
import { getAllFantaSquadre } from "../api/fantaSquadreApi";
import { getAllStagioni, getAstaByStagione } from "../api/astaApi";
import { getFmColor, getMvColor, getPvColor } from "../components/FantaSquadra/FantaSquadraUtils";
import { calculateScouting } from "../components/FantaSquadra/ScoutingUtils";

export const FantaSquadraDetail = () => {
    const { giocatori, fetchGiocatori } = useGiocatoriStore();

    const [stagioni, setStagioni] = useState<number[]>([]);
    const [fantaSquadre, setFantaSquadre] = useState<FantaSquadra[]>([]);
    const [selectedStagione, setSelectedStagione] = useState<number | null>(null);
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
    const [budgetTotale, setBudgetTotale] = useState<number>(500);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Carica giocatori (se non già in cache) + stagioni + fanta squadre
    useEffect(() => {
        fetchGiocatori();

        Promise.all([getAllStagioni(), getAllFantaSquadre()])
            .then(([stagioniList, teamsList]) => {
                setStagioni(stagioniList);
                setFantaSquadre(teamsList);
                if (stagioniList.length > 0) setSelectedStagione(stagioniList[0]); // più recente
                if (teamsList.length > 0) setSelectedTeamId(teamsList[0].id);
            })
            .catch((err) => console.error("Errore caricamento stagioni/fanta squadre:", err))
            .finally(() => setLoadingOptions(false));
    }, [fetchGiocatori]);

    // Budget dell'asta per la stagione selezionata
    useEffect(() => {
        if (selectedStagione === null) return;
        getAstaByStagione(selectedStagione)
            .then((asta) => setBudgetTotale(asta?.budget ?? 500))
            .catch((err) => console.error("Errore caricamento asta:", err));
    }, [selectedStagione]);

    const selectedTeamNome = useMemo(
        () => fantaSquadre.find((f) => f.id === selectedTeamId)?.nome ?? "",
        [fantaSquadre, selectedTeamId]
    );

    // Giocatori della sola stagione selezionata (serve anche per lo scouting)
    const giocatoriStagione = useMemo(() => {
        if (selectedStagione === null) return [];
        return giocatori.filter((g) => g.stagione === selectedStagione);
    }, [giocatori, selectedStagione]);

    // Giocatori della squadra selezionata, in quella stagione
    const teamPlayers = useMemo(() => {
        if (selectedTeamId === null) return [];
        return giocatoriStagione.filter((g) => g.id_fanta_squadra === selectedTeamId);
    }, [giocatoriStagione, selectedTeamId]);

    // CALCOLO CREDITI
    const stats = useMemo(() => {
        const totaleSpeso = teamPlayers.reduce((acc, g) => acc + (g.costo || 0), 0);
        const spesaAttiva = teamPlayers
            .filter((g) => !g.fl)
            .reduce((acc, g) => acc + (g.costo || 0), 0);

        return {
            rimastiNominali: budgetTotale - totaleSpeso,
            rimastiReali: budgetTotale - spesaAttiva + 50,
            totaleSpeso,
            fuoriLista: teamPlayers.filter((g) => g.fl).length,
        };
    }, [teamPlayers, budgetTotale]);

    const scouting = useMemo(() => {
        const nomiSquadre = fantaSquadre.map((f) => f.nome);
        return calculateScouting(giocatoriStagione, teamPlayers, nomiSquadre, budgetTotale);
    }, [giocatoriStagione, teamPlayers, fantaSquadre, budgetTotale]);

    const ruoli = [
        { key: "P", label: "Portieri", color: "text-orange-400" },
        { key: "D", label: "Difensori", color: "text-emerald-400" },
        { key: "C", label: "Centrocampisti", color: "text-blue-400" },
        { key: "A", label: "Attaccanti", color: "text-red-400" },
    ];

    if (loadingOptions) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Caricamento...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* HEADER SQUADRA & SELECTOR */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Stagione</label>
                            <select
                                value={selectedStagione ?? ""}
                                onChange={(e) => setSelectedStagione(Number(e.target.value))}
                                className="bg-gray-900 border-2 border-gray-800 text-xl font-black italic p-3 rounded-2xl focus:border-emerald-500 outline-none transition-all cursor-pointer"
                            >
                                {stagioni.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Seleziona Team</label>
                            <select
                                value={selectedTeamId ?? ""}
                                onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                                className="bg-gray-900 border-2 border-gray-800 text-2xl font-black italic uppercase p-3 rounded-2xl focus:border-emerald-500 outline-none transition-all cursor-pointer"
                            >
                                {fantaSquadre.map((t) => (
                                    <option key={t.id} value={t.id}>{t.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* BOX CREDITI */}
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-48 bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Wallet className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Crediti Residui</span>
                            </div>
                            <p className="text-3xl font-black text-white">{stats.rimastiNominali}</p>
                        </div>

                        <div className="flex-1 md:w-48 bg-emerald-900/20 p-4 rounded-2xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
                            <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                <Info className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Residui Reali</span>
                            </div>
                            <p className="text-3xl font-black text-emerald-400">{stats.rimastiReali}</p>
                            {stats.fuoriLista > 0 && (
                                <div className="absolute top-2 right-2 text-[8px] bg-emerald-500 text-black px-1.5 py-0.5 rounded font-black animate-pulse">
                                    +{stats.totaleSpeso - (budgetTotale - stats.rimastiReali)} RECUPERATI
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {teamPlayers.length === 0 ? (
                    <div className="bg-gray-800/20 p-12 rounded-3xl border border-gray-800 border-dashed text-center text-gray-600 italic">
                        Nessun giocatore trovato per {selectedTeamNome || "questa squadra"} nella stagione {selectedStagione}.
                    </div>
                ) : (
                    <>
                        {/* LISTA PER RUOLI */}
                        <div className="grid grid-cols-1">
                            {ruoli.map((ruolo) => {
                                const players = teamPlayers.filter(p => p.r === ruolo.key);
                                if (players.length === 0) return null;

                                return (
                                    <section key={ruolo.key} className="p-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className={`text-xl font-black italic uppercase tracking-tighter ${ruolo.color}`}>
                                                {ruolo.label}
                                            </h3>
                                            <span className="text-xs font-bold text-gray-600 bg-gray-800 px-3 py-1 rounded-full">
                                                {players.length} GIOCATORI
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {players.map((p) => (
                                                <div
                                                    key={p.id}
                                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${p.fl
                                                        ? "bg-red-500/5 border-red-500/20 opacity-60"
                                                        : "bg-gray-800/40 border-gray-700/50 hover:border-gray-600"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-lg text-[10px] font-black border border-gray-700">
                                                            {p.squadra.substring(0, 3).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm flex items-center gap-2">
                                                                {p.nome}
                                                                {p.fl && <span title="Fuori Lista">
                                                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                                                </span>}
                                                            </p>
                                                            <p className="text-[9px] uppercase font-black tracking-widest flex gap-2">
                                                                <span className="text-gray-500">
                                                                    MV: <span className={getMvColor(p.mv)}>{p.mv.toFixed(2)}</span>
                                                                </span>
                                                                <span className="text-gray-700">|</span>
                                                                <span className="text-gray-500">
                                                                    FM: <span className={getFmColor(p.fm)}>{p.fm.toFixed(2)}</span>
                                                                </span>
                                                                <span className="text-gray-700">|</span>
                                                                <span className="text-gray-500">
                                                                    PV: <span className={getPvColor(p.pv)}>{p.pv}</span>
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-emerald-500 font-black text-lg leading-none">{p.costo}</p>
                                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Crediti</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>

                        {/* SCOUTING */}
                        <section className="mt-12 bg-gray-900/60 rounded-3xl border border-emerald-500/20 p-8 backdrop-blur-md">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <TrendingUp className="text-emerald-500 w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                                        Analisi <span className="text-emerald-500">Mercato</span>
                                    </h2>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sostituzioni consigliate per ruolo</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    {scouting.daTagliare.map(p => (
                                        <div key={p.id} className={`p-3 rounded-xl border ${p.fl ? 'bg-red-500/20 border-red-500' : 'bg-gray-800/40 border-gray-700'}`}>
                                            <div className="flex justify-between items-center">
                                                <p className="font-bold">{p.nome}</p>
                                                {p.fl && <span className="text-[8px] bg-red-600 px-2 py-1 rounded-md animate-pulse">NON IN LISTA</span>}
                                            </div>
                                            <p className="text-[10px] text-gray-500">Recuperi: {p.costo} cr.</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    {scouting.suggerimenti.slice(0, 10).map(s => (
                                        <div key={s.id} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex justify-between items-center">
                                            <div>
                                                <p className="font-black text-emerald-400">{s.nome} <span className="text-[9px] text-gray-500">({s.squadra})</span></p>
                                                <p className="text-[10px] font-bold">Stima asta: <span className="text-white">{s.stimaPrezzo} cr.</span></p>
                                            </div>
                                            <div className={`text-[9px] font-black px-2 py-1 rounded ${s.convenienza === 'ALTA' ? 'bg-emerald-500 text-black' : 'bg-yellow-500 text-black'}`}>
                                                {s.convenienza}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};