import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStoricoGiocatore } from "../api/giocatoriApi";
import { getAllAste } from "../api/astaApi";
import { StatisticheGiocatore } from "../types/GiocatoreTypes";
import { Header } from "../components/Header";
import { RuoloBadge } from "../components/Home/RuoloBadge";
import {
  getFmColor,
  getMvColor,
  getPvColor,
} from "../components/FantaSquadra/FantaSquadraUtils";

type StoricoGiocatoreConAsta = StatisticheGiocatore & {
  astaBudget: number | null;
};

const formatDelta = (value: number, decimals = 2) => {
  if (value === 0) return "0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}`;
};

const getDeltaTone = (value: number) => {
  if (value > 0)
    return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  if (value < 0) return "text-red-400 border-red-500/30 bg-red-500/10";
  return "text-gray-300 border-gray-700 bg-gray-800/60";
};

export const GiocatoreDettaglio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [storico, setStorico] = useState<StoricoGiocatoreConAsta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    setLoading(true);
    setError(null);
    setStorico([]);

    Promise.allSettled([getStoricoGiocatore(Number(id)), getAllAste()])
      .then((results) => {
        if (!isMounted) return;

        const storicoResult = results[0];
        const asteResult = results[1];

        if (storicoResult.status === "rejected") {
          console.error(
            "Errore nel caricamento dello storico del giocatore:",
            storicoResult.reason,
          );
          setError("Errore nel caricamento dello storico del giocatore.");
          return;
        }

        const budgetByAstaId = new Map<number, number>();

        if (asteResult.status === "fulfilled") {
          asteResult.value.forEach((asta) => {
            budgetByAstaId.set(asta.id, asta.budget);
          });
        } else {
          console.warn(
            "Impossibile recuperare le aste: mostro lo storico senza budget dell'asta.",
            asteResult.reason,
          );
        }

        const storicoConBudget = storicoResult.value.map((s) => ({
          ...s,
          astaBudget:
            s.id_asta !== null && budgetByAstaId.has(s.id_asta)
              ? (budgetByAstaId.get(s.id_asta) ?? null)
              : null,
        }));

        setStorico(storicoConBudget);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const storicoOrdinato = useMemo(
    () => [...storico].sort((a, b) => Number(b.stagione) - Number(a.stagione)),
    [storico],
  );

  const ultimaStagione = storicoOrdinato[0];
  const penultimaStagione = storicoOrdinato[1] ?? null;

  const deltaPrincipali = {
    pv: penultimaStagione ? ultimaStagione.pv - penultimaStagione.pv : 0,
    mv: penultimaStagione ? ultimaStagione.mv - penultimaStagione.mv : 0,
    fm: penultimaStagione ? ultimaStagione.fm - penultimaStagione.fm : 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
          Caricamento...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  if (storico.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-gray-500 font-bold">
          Nessun dato trovato per questo giocatore.
        </p>
      </div>
    );
  }

  const nome = storico[0].nome;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* HEADER GIOCATORE */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
              Storico giocatore
            </p>

            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              {nome}
            </h1>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            ← Indietro
          </button>
        </div>
        {/* MOBILE: vista trend-first */}
        <section className="md:hidden space-y-4">
          <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Ultima stagione
                </p>
                <p className="text-xl font-black uppercase tracking-tight">
                  {ultimaStagione.stagione}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 font-bold uppercase">
                  {ultimaStagione.squadra}
                </p>
                <p className="text-[11px] text-gray-500 font-semibold uppercase">
                  {ultimaStagione.FantaSquadra || "-"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Pv
                </p>
                <p
                  className={`text-base font-black ${getPvColor(ultimaStagione.pv)}`}
                >
                  {ultimaStagione.pv}
                </p>
                <p
                  className={`mt-1 text-[10px] font-bold border rounded-full px-2 py-0.5 inline-block ${getDeltaTone(deltaPrincipali.pv)}`}
                >
                  {formatDelta(deltaPrincipali.pv, 0)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Mv
                </p>
                <p
                  className={`text-base font-black ${getMvColor(ultimaStagione.mv)}`}
                >
                  {ultimaStagione.mv.toFixed(2)}
                </p>
                <p
                  className={`mt-1 text-[10px] font-bold border rounded-full px-2 py-0.5 inline-block ${getDeltaTone(deltaPrincipali.mv)}`}
                >
                  {formatDelta(deltaPrincipali.mv)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Fm
                </p>
                <p
                  className={`text-base font-black ${getFmColor(ultimaStagione.fm)}`}
                >
                  {ultimaStagione.fm.toFixed(2)}
                </p>
                <p
                  className={`mt-1 text-[10px] font-bold border rounded-full px-2 py-0.5 inline-block ${getDeltaTone(deltaPrincipali.fm)}`}
                >
                  {formatDelta(deltaPrincipali.fm)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {storicoOrdinato.map((s, index) => {
              const stagionePrecedente = storicoOrdinato[index + 1] ?? null;
              const deltaPv = stagionePrecedente
                ? s.pv - stagionePrecedente.pv
                : 0;
              const deltaMv = stagionePrecedente
                ? s.mv - stagionePrecedente.mv
                : 0;
              const deltaFm = stagionePrecedente
                ? s.fm - stagionePrecedente.fm
                : 0;

              return (
                <article
                  key={`${s.stagione}-${s.id_asta ?? "na"}`}
                  className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Stagione
                      </p>
                      <p className="text-lg font-black">{s.stagione}</p>
                    </div>
                    <RuoloBadge ruolo={s.r} />
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs font-bold uppercase">
                    <span className="bg-gray-800 px-2 py-1 rounded-lg text-gray-300">
                      {s.squadra}
                    </span>
                    <span className="text-gray-600">/</span>
                    <span className="bg-gray-800 px-2 py-1 rounded-lg text-gray-300">
                      {s.FantaSquadra || "-"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-2 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Pv
                      </p>
                      <p className={`text-base font-black ${getPvColor(s.pv)}`}>
                        {s.pv}
                      </p>
                      <p
                        className={`mt-1 text-[10px] font-bold border rounded-full px-2 py-0.5 inline-block ${getDeltaTone(deltaPv)}`}
                      >
                        {formatDelta(deltaPv, 0)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-2 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Mv
                      </p>
                      <p className={`text-base font-black ${getMvColor(s.mv)}`}>
                        {s.mv.toFixed(2)}
                      </p>
                      <p
                        className={`mt-1 text-[10px] font-bold border rounded-full px-2 py-0.5 inline-block ${getDeltaTone(deltaMv)}`}
                      >
                        {formatDelta(deltaMv)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-2 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Fm
                      </p>
                      <p className={`text-base font-black ${getFmColor(s.fm)}`}>
                        {s.fm.toFixed(2)}
                      </p>
                      <p
                        className={`mt-1 text-[10px] font-bold border rounded-full px-2 py-0.5 inline-block ${getDeltaTone(deltaFm)}`}
                      >
                        {formatDelta(deltaFm)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-gray-800/40 border border-gray-800 rounded-lg p-2 text-center">
                      <p className="uppercase tracking-wider text-gray-500 font-bold">
                        Gf
                      </p>
                      <p className="font-black text-white mt-1">{s.gf}</p>
                    </div>
                    <div className="bg-gray-800/40 border border-gray-800 rounded-lg p-2 text-center">
                      <p className="uppercase tracking-wider text-gray-500 font-bold">
                        Ass
                      </p>
                      <p className="font-black text-white mt-1">{s.ass}</p>
                    </div>
                    <div className="bg-gray-800/40 border border-gray-800 rounded-lg p-2 text-center">
                      <p className="uppercase tracking-wider text-gray-500 font-bold">
                        Costo
                      </p>
                      <p className="font-black text-white mt-1">
                        {s.costo !== null && s.costo !== undefined
                          ? `${s.costo}/${s.astaBudget ?? "-"}cr`
                          : s.astaBudget !== null
                            ? `-/${s.astaBudget}cr`
                            : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-center">
                    <div className="bg-gray-800/30 rounded-md p-1.5">
                      <p className="text-gray-500 uppercase font-bold">
                        {s.r === "P" ? "Gs" : "Rf"}
                      </p>
                      <p className="text-white font-black mt-0.5">
                        {s.r === "P" ? s.gs : s.rf}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-md p-1.5">
                      <p className="text-gray-500 uppercase font-bold">
                        {s.r === "P" ? "Rp" : "Rs"}
                      </p>
                      <p className="text-white font-black mt-0.5">
                        {s.r === "P" ? s.rp : s.rs}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-md p-1.5">
                      <p className="text-gray-500 uppercase font-bold">Amm</p>
                      <p className="text-white font-black mt-0.5">{s.amm}</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-md p-1.5">
                      <p className="text-gray-500 uppercase font-bold">Esp</p>
                      <p className="text-white font-black mt-0.5">{s.esp}</p>
                    </div>
                    <div className="bg-gray-800/30 rounded-md p-1.5">
                      <p className="text-gray-500 uppercase font-bold">Aut</p>
                      <p className="text-white font-black mt-0.5">{s.au}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* DESKTOP: card grid con riepilogo */}
        <section className="hidden md:block space-y-5">
          <div className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 backdrop-blur-md">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">
                  Riepilogo ultima stagione
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-3xl font-black uppercase tracking-tight">
                    {ultimaStagione.stagione}
                  </p>
                  <RuoloBadge ruolo={ultimaStagione.r} />
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-400 font-bold uppercase">
                  {ultimaStagione.squadra}
                </p>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  {ultimaStagione.FantaSquadra || "-"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 xl:grid-cols-6">
              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Pv
                </p>
                <p
                  className={`mt-2 text-2xl font-black ${getPvColor(ultimaStagione.pv)}`}
                >
                  {ultimaStagione.pv}
                </p>
                <p
                  className={`mt-2 text-[10px] font-bold border rounded-full px-2 py-1 inline-block ${getDeltaTone(deltaPrincipali.pv)}`}
                >
                  {formatDelta(deltaPrincipali.pv, 0)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Mv
                </p>
                <p
                  className={`mt-2 text-2xl font-black ${getMvColor(ultimaStagione.mv)}`}
                >
                  {ultimaStagione.mv.toFixed(2)}
                </p>
                <p
                  className={`mt-2 text-[10px] font-bold border rounded-full px-2 py-1 inline-block ${getDeltaTone(deltaPrincipali.mv)}`}
                >
                  {formatDelta(deltaPrincipali.mv)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Fm
                </p>
                <p
                  className={`mt-2 text-2xl font-black ${getFmColor(ultimaStagione.fm)}`}
                >
                  {ultimaStagione.fm.toFixed(2)}
                </p>
                <p
                  className={`mt-2 text-[10px] font-bold border rounded-full px-2 py-1 inline-block ${getDeltaTone(deltaPrincipali.fm)}`}
                >
                  {formatDelta(deltaPrincipali.fm)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Gf
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {ultimaStagione.gf}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Ass
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {ultimaStagione.ass}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  Costo
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {ultimaStagione.costo !== null &&
                  ultimaStagione.costo !== undefined
                    ? `${ultimaStagione.costo}/${ultimaStagione.astaBudget ?? "-"}cr`
                    : ultimaStagione.astaBudget !== null
                      ? `-/${ultimaStagione.astaBudget}cr`
                      : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {storicoOrdinato.map((s, index) => {
              const stagionePrecedente = storicoOrdinato[index + 1] ?? null;
              const deltaPv = stagionePrecedente
                ? s.pv - stagionePrecedente.pv
                : 0;
              const deltaMv = stagionePrecedente
                ? s.mv - stagionePrecedente.mv
                : 0;
              const deltaFm = stagionePrecedente
                ? s.fm - stagionePrecedente.fm
                : 0;

              return (
                <article
                  key={`${s.stagione}-${s.id_asta ?? "na"}`}
                  className="bg-gray-900/60 rounded-3xl border border-gray-800 p-5 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Stagione
                      </p>
                      <p className="mt-1 text-2xl font-black">{s.stagione}</p>
                    </div>
                    <RuoloBadge ruolo={s.r} />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs font-bold uppercase">
                    <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-gray-300">
                      {s.squadra}
                    </span>
                    <span className="text-gray-600">/</span>
                    <span className="bg-gray-800 px-3 py-1.5 rounded-lg text-gray-300">
                      {s.FantaSquadra || "-"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Pv
                      </p>
                      <p
                        className={`mt-2 text-xl font-black ${getPvColor(s.pv)}`}
                      >
                        {s.pv}
                      </p>
                      <p
                        className={`mt-2 text-[10px] font-bold border rounded-full px-2 py-1 inline-block ${getDeltaTone(deltaPv)}`}
                      >
                        {formatDelta(deltaPv, 0)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Mv
                      </p>
                      <p
                        className={`mt-2 text-xl font-black ${getMvColor(s.mv)}`}
                      >
                        {s.mv.toFixed(2)}
                      </p>
                      <p
                        className={`mt-2 text-[10px] font-bold border rounded-full px-2 py-1 inline-block ${getDeltaTone(deltaMv)}`}
                      >
                        {formatDelta(deltaMv)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-3 text-center">
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                        Fm
                      </p>
                      <p
                        className={`mt-2 text-xl font-black ${getFmColor(s.fm)}`}
                      >
                        {s.fm.toFixed(2)}
                      </p>
                      <p
                        className={`mt-2 text-[10px] font-bold border rounded-full px-2 py-1 inline-block ${getDeltaTone(deltaFm)}`}
                      >
                        {formatDelta(deltaFm)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-3 text-center">
                      <p className="uppercase tracking-wider text-gray-500 font-bold">
                        Gf
                      </p>
                      <p className="font-black text-white mt-1 text-lg">
                        {s.gf}
                      </p>
                    </div>
                    <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-3 text-center">
                      <p className="uppercase tracking-wider text-gray-500 font-bold">
                        Ass
                      </p>
                      <p className="font-black text-white mt-1 text-lg">
                        {s.ass}
                      </p>
                    </div>
                    <div className="bg-gray-800/40 border border-gray-800 rounded-xl p-3 text-center">
                      <p className="uppercase tracking-wider text-gray-500 font-bold">
                        Costo
                      </p>
                      <p className="font-black text-white mt-1 text-lg">
                        {s.costo !== null && s.costo !== undefined
                          ? `${s.costo}/${s.astaBudget ?? "-"}cr`
                          : s.astaBudget !== null
                            ? `-/${s.astaBudget}cr`
                            : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-2 text-[11px] text-center">
                    <div className="bg-gray-800/30 rounded-lg p-2.5">
                      <p className="text-gray-500 uppercase font-bold">
                        {s.r === "P" ? "Gs" : "Rf"}
                      </p>
                      <p className="text-white font-black mt-1 text-base">
                        {s.r === "P" ? s.gs : s.rf}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-2.5">
                      <p className="text-gray-500 uppercase font-bold">
                        {s.r === "P" ? "Rp" : "Rs"}
                      </p>
                      <p className="text-white font-black mt-1 text-base">
                        {s.r === "P" ? s.rp : s.rs}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-2.5">
                      <p className="text-gray-500 uppercase font-bold">Amm</p>
                      <p className="text-white font-black mt-1 text-base">
                        {s.amm}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-2.5">
                      <p className="text-gray-500 uppercase font-bold">Esp</p>
                      <p className="text-white font-black mt-1 text-base">
                        {s.esp}
                      </p>
                    </div>
                    <div className="bg-gray-800/30 rounded-lg p-2.5">
                      <p className="text-gray-500 uppercase font-bold">Aut</p>
                      <p className="text-white font-black mt-1 text-base">
                        {s.au}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
