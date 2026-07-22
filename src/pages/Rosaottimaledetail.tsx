import { useState, useMemo, useCallback, useEffect } from "react";
import { useGiocatoriStore } from "../store/useGiocatoriStore";
import { Header } from "../components/Header";
import { Wallet, Sparkles, AlertTriangle, Loader2, Trophy } from "lucide-react";
import { Ruolo, ConfigAsta, StatisticheGiocatore } from "../types/GiocatoreTypes";
import { getAllStagioni } from "../api/astaApi";
import { getFmColor, getMvColor, getPvColor } from "../components/FantaSquadra/FantaSquadraUtils";
import { trovaRosaOttimale, valoreGiocatore } from "../utils/utilsFunction";

const RUOLI_CONFIG: { key: Ruolo; label: string; color: string }[] = [
    { key: "P", label: "Portieri", color: "text-orange-400" },
    { key: "D", label: "Difensori", color: "text-emerald-400" },
    { key: "C", label: "Centrocampisti", color: "text-blue-400" },
    { key: "A", label: "Attaccanti", color: "text-red-400" },
];

const DEFAULT_CONFIG: ConfigAsta = {
    budget: 500,
    minPartite: 10,
    giocatoriPerRuolo: { P: 3, D: 8, C: 8, A: 6 },
};

export const RosaOttimaleDetail = () => {
    const { giocatori, fetchGiocatori } = useGiocatoriStore();

    const [stagioni, setStagioni] = useState<number[]>([]);
    const [selectedStagione, setSelectedStagione] = useState<number | null>(null);
    const [loadingStagioni, setLoadingStagioni] = useState(true);

    const [config, setConfig] = useState<ConfigAsta>(DEFAULT_CONFIG);
    const [isCalcolando, setIsCalcolando] = useState(false);
    const [errore, setErrore] = useState<string | null>(null);
    const [rosa, setRosa] = useState<StatisticheGiocatore[] | null>(null);

    useEffect(() => {
        fetchGiocatori();

        getAllStagioni()
            .then((list) => {
                setStagioni(list);
                if (list.length > 0) setSelectedStagione(list[0]); // più recente
            })
            .catch((err) => console.error("Errore caricamento stagioni:", err))
            .finally(() => setLoadingStagioni(false));
    }, [fetchGiocatori]);

    // Giocatori della sola stagione selezionata: include anche quelli già assegnati,
    // serve come guida per la stagione successiva (richiesta esplicita).
    const giocatoriStagione = useMemo(() => {
        if (selectedStagione === null) return [];
        return giocatori.filter((g) => g.stagione === selectedStagione);
    }, [giocatori, selectedStagione]);

    const totaleSlot = useMemo(() => {
        return RUOLI_CONFIG.reduce((acc, r) => acc + (config.giocatoriPerRuolo[r.key] || 0), 0);
    }, [config]);

    const statsRosa = useMemo(() => {
        if (!rosa) return null;
        const costoTotale = rosa.reduce((acc, g) => acc + (g.costo ?? 0), 0);
        const punteggioTotale = rosa.reduce((acc, g) => acc + valoreGiocatore(g), 0);
        return {
            costoTotale,
            creditiResidui: config.budget - costoTotale,
            punteggioTotale,
        };
    }, [rosa, config.budget]);

    const handleChangeRuolo = (ruolo: Ruolo, value: string) => {
        const n = Math.max(0, parseInt(value || "0", 10));
        setConfig(prev => ({
            ...prev,
            giocatoriPerRuolo: { ...prev.giocatoriPerRuolo, [ruolo]: n },
        }));
    };

    const handleCalcola = useCallback(() => {
        setErrore(null);
        setRosa(null);
        setIsCalcolando(true);

        setTimeout(() => {
            try {
                const risultato = trovaRosaOttimale(giocatoriStagione, config);
                if (risultato.length === 0) {
                    setErrore("Nessuna rosa fattibile con questi parametri: prova ad alzare il budget o rivedere il numero di giocatori per ruolo.");
                } else {
                    setRosa(risultato);
                }
            } catch (e) {
                setErrore(e instanceof Error ? e.message : "Errore durante il calcolo della rosa.");
            } finally {
                setIsCalcolando(false);
            }
        }, 30);
    }, [giocatoriStagione, config]);

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* HEADER */}
                <div className="flex flex-col gap-2 mb-8">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                        Ottimizzatore Asta
                    </label>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                        Calcola la tua <span className="text-emerald-500">Rosa Ottimale</span>
                    </h1>
                </div>

                {/* PANNELLO CONFIGURAZIONE */}
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 shadow-xl mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
                        <div className="col-span-2 md:col-span-1 flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Stagione</label>
                            <select
                                value={selectedStagione ?? ""}
                                onChange={(e) => setSelectedStagione(Number(e.target.value))}
                                disabled={loadingStagioni}
                                className="bg-gray-800/60 border border-gray-700 rounded-xl p-2.5 text-lg font-black text-white outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            >
                                {stagioni.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2 md:col-span-1 flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Budget</label>
                            <input
                                type="number"
                                min={1}
                                value={config.budget}
                                onChange={(e) => setConfig(prev => ({ ...prev, budget: Math.max(1, parseInt(e.target.value || "0", 10)) }))}
                                className="bg-gray-800/60 border border-gray-700 rounded-xl p-2.5 text-lg font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1 flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Partite Min.</label>
                            <input
                                type="number"
                                min={0}
                                value={config.minPartite}
                                onChange={(e) => setConfig(prev => ({ ...prev, minPartite: Math.max(0, parseInt(e.target.value || "0", 10)) }))}
                                className="bg-gray-800/60 border border-gray-700 rounded-xl p-2.5 text-lg font-black text-white outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>

                        {RUOLI_CONFIG.map((r) => (
                            <div key={r.key} className="flex flex-col gap-1">
                                <label className={`text-[9px] font-bold uppercase tracking-widest ${r.color}`}>{r.label}</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={config.giocatoriPerRuolo[r.key]}
                                    onChange={(e) => handleChangeRuolo(r.key, e.target.value)}
                                    className="bg-gray-800/60 border border-gray-700 rounded-xl p-2.5 text-lg font-black text-white outline-none focus:border-emerald-500 transition-all"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                            Totale slot rosa: <span className="text-white">{totaleSlot}</span> giocatori
                            {selectedStagione !== null && (
                                <> · Stagione <span className="text-white">{selectedStagione}</span> · {giocatoriStagione.length} giocatori disponibili</>
                            )}
                        </p>

                        <button
                            onClick={handleCalcola}
                            disabled={isCalcolando || selectedStagione === null}
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-black uppercase italic tracking-tight text-sm px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                            {isCalcolando ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Calcolo in corso...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Calcola Rosa Ottimale
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* ERRORE */}
                {errore && (
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-8">
                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm font-bold text-red-400">{errore}</p>
                    </div>
                )}

                {/* RISULTATO */}
                {rosa && statsRosa && (
                    <>
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="flex-1 bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <Wallet className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Crediti Usati</span>
                                </div>
                                <p className="text-3xl font-black text-white">{statsRosa.costoTotale}</p>
                            </div>

                            <div className="flex-1 bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-xl">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <Wallet className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Crediti Residui</span>
                                </div>
                                <p className="text-3xl font-black text-white">{statsRosa.creditiResidui}</p>
                            </div>

                            <div className="flex-1 bg-emerald-900/20 p-4 rounded-2xl border border-emerald-500/30 shadow-xl">
                                <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                    <Trophy className="w-4 h-4" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Punteggio Totale</span>
                                </div>
                                <p className="text-3xl font-black text-emerald-400">{statsRosa.punteggioTotale.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1">
                            {RUOLI_CONFIG.map((ruolo) => {
                                const players = rosa.filter(p => p.r === ruolo.key);
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
                                                    className="flex items-center justify-between p-3 rounded-xl border bg-gray-800/40 border-gray-700/50 hover:border-gray-600 transition-all"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-900 rounded-lg text-[10px] font-black border border-gray-700">
                                                            {p.squadra.substring(0, 3).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm">{p.nome}</p>
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
                    </>
                )}
            </main>
        </div>
    );
};