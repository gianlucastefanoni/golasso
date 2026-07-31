import { useEffect, useState } from "react";
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
        {/* TABELLA */}
        <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-6 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  {[
                    "Stagione",
                    "Squadra",
                    "Fanta squadra",
                    "Ruolo",
                    "Pv",
                    "Mv",
                    "Fm",
                    "Gf",
                    "Ass",
                    "Costo",
                    storico[0].r === "P" ? "Gs" : "Rf",
                    storico[0].r === "P" ? "Rp" : "Rs",
                    "Amm",
                    "Esp",
                    "Aut",
                  ].map((header) => (
                    <th
                      key={header}
                      className="py-4 px-3 text-[10px] uppercase tracking-widest text-gray-500 font-black"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {storico.map((s) => (
                  <tr
                    key={s.stagione}
                    className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-all"
                  >
                    <td className="py-4 px-3 font-bold">{s.stagione}</td>

                    <td className="py-4 px-3">
                      <span className="bg-gray-800 px-3 py-1 rounded-lg text-xs font-black">
                        {s.squadra}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <span className="bg-gray-800 px-3 py-1 rounded-lg text-xs font-black">
                        {s.FantaSquadra ? s.FantaSquadra : "-"}
                      </span>
                    </td>

                    <td className="py-4 px-3 text-emerald-400 font-black">
                      <RuoloBadge ruolo={s.r} />
                    </td>

                    <td className={"py-4 px-3 " + getPvColor(s.pv)}>{s.pv}</td>

                    <td className={"py-4 px-3 " + getMvColor(s.mv)}>{s.mv}</td>

                    <td className={"py-4 px-3 " + getFmColor(s.fm)}>{s.fm}</td>

                    <td className="py-4 px-3">{s.gf}</td>

                    <td className="py-4 px-3">{s.ass}</td>

                    <td className="py-4 px-3">
                      {s.costo !== null && s.costo !== undefined
                        ? `${s.costo}/${s.astaBudget ?? "-"}cr`
                        : s.astaBudget !== null
                          ? `${s.astaBudget}cr`
                          : "-"}
                    </td>

                    <td className="py-4 px-3">{s.r === "P" ? s.gs : s.rf}</td>

                    <td className="py-4 px-3">{s.r === "P" ? s.rp : s.rs}</td>

                    <td className="py-4 px-3">{s.amm}</td>

                    <td className="py-4 px-3">{s.esp}</td>

                    <td className="py-4 px-3">{s.au}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
