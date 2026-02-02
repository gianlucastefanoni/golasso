import { useState, useMemo } from "react";
import { useGiocatoriStore } from "../store/useGiocatoriStore";
import { Header } from "../components/Header";
import { Wallet, Info, AlertTriangle } from "lucide-react";
import { TEAM_NAMES } from "../types/GiocatoreTypes";
import { getFmColor, getMvColor, getPvColor } from "../components/FantaSquadra/FantaSquadraUtils";

export const FantaSquadraDetail = () => {
    const { giocatori } = useGiocatoriStore();
    const [selectedTeam, setSelectedTeam] = useState(TEAM_NAMES[0]);

    // Filtriamo i giocatori della squadra selezionata
    const teamPlayers = useMemo(() => {
        return giocatori.filter((g) =>
            g.FantaSquadra?.trim().toUpperCase() === selectedTeam.trim().toUpperCase()
        );
    }, [giocatori, selectedTeam]);

    // CALCOLO CREDITI
    const stats = useMemo(() => {
        const totaleSpeso = teamPlayers.reduce((acc, g) => acc + (g.Costo || 0), 0);
        // Solo quelli che NON sono fuori lista (Fl != 1)
        const spesaAttiva = teamPlayers
            .filter((g) => !g.Fl)
            .reduce((acc, g) => acc + (g.Costo || 0), 0);

        return {
            rimastiNominali: 500 - totaleSpeso,
            rimastiReali: 500 - spesaAttiva + 50,
            totaleSpeso,
            fuoriLista: teamPlayers.filter((g) => g.Fl).length,
        };
    }, [teamPlayers]);

    const ruoli = [
        { key: "P", label: "Portieri", color: "text-orange-400" },
        { key: "D", label: "Difensori", color: "text-emerald-400" },
        { key: "C", label: "Centrocampisti", color: "text-blue-400" },
        { key: "A", label: "Attaccanti", color: "text-red-400" },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* HEADER SQUADRA & SELECTOR */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Seleziona Team</label>
                        <select
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value as typeof selectedTeam)}
                            className="bg-gray-900 border-2 border-gray-800 text-2xl font-black italic uppercase p-3 rounded-2xl focus:border-emerald-500 outline-none transition-all cursor-pointer"
                        >
                            {TEAM_NAMES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
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
                                    +{stats.totaleSpeso - (500 - stats.rimastiReali)} RECUPERATI
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* LISTA PER RUOLI */}
                <div className="grid grid-cols-1">
                    {ruoli.map((ruolo) => {
                        const players = teamPlayers.filter(p => p.R === ruolo.key);
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
                                            key={p.Cod}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${Number(p.Fl) === 1
                                                ? "bg-red-500/5 border-red-500/20 opacity-60"
                                                : "bg-gray-800/40 border-gray-700/50 hover:border-gray-600"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-lg text-[10px] font-black border border-gray-700">
                                                    {p.Squadra.substring(0, 3).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm flex items-center gap-2">
                                                        {p.Nome}
                                                        {p.Fl && <span title="Fuori Lista">
                                                            <AlertTriangle className="w-3 h-3 text-red-500" />
                                                        </span>}
                                                    </p>
                                                    <p className="text-[9px] uppercase font-black tracking-widest flex gap-2">
                                                        <span className="text-gray-500">
                                                            MV: <span className={getMvColor(p.Mv)}>{p.Mv.toFixed(2)}</span>
                                                        </span>
                                                        <span className="text-gray-700">|</span>
                                                        <span className="text-gray-500">
                                                            FM: <span className={getFmColor(p.Fm)}>{p.Fm.toFixed(2)}</span>
                                                        </span>
                                                        <span className="text-gray-700">|</span>
                                                        <span className="text-gray-500">
                                                            PV: <span className={getPvColor(p.Pv)}>{p.Pv}</span>
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-emerald-500 font-black text-lg leading-none">{p.Costo}</p>
                                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">Crediti</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};