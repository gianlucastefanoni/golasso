import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { getAllAste, Asta } from "../api/astaApi";
import { getAllGiocatori } from "../api/giocatoriApi";
import { StatisticheGiocatore, Ruolo } from "../types/GiocatoreTypes";
import { SelezioneAsta } from "../components/AstaLive/SelezioneAsta";
import {
  RipartizioneBudget,
  RipartizionePercentuali,
} from "../components/SimulaRosa/RipartizioneBudget";
import { RiepilogoSimulazione } from "../components/SimulaRosa/RiepilogoSimulazione";
import { RosaSimulata } from "../components/SimulaRosa/RosaSimulata";
import { GiocatoriDisponibili } from "../components/SimulaRosa/GiocatoriDisponibili";
import { SelettoreRuolo } from "../components/SimulaRosa/SelettoreRuolo";

const RUOLI_VALIDI: Ruolo[] = ["P", "D", "C", "A"];

const DEFAULT_PERCENTUALI: RipartizionePercentuali = {
  P: 5,
  D: 20,
  C: 30,
  A: 45,
};

export const SimulaRosa = () => {
  const [aste, setAste] = useState<Asta[]>([]);
  const [loadingAste, setLoadingAste] = useState(true);
  const [selectedAstaId, setSelectedAstaId] = useState<number | null>(null);

  const [giocatori, setGiocatori] = useState<StatisticheGiocatore[]>([]);
  const [loadingGiocatori, setLoadingGiocatori] = useState(false);

  const [percentuali, setPercentuali] = useState<RipartizionePercentuali>(
    DEFAULT_PERCENTUALI,
  );
  const [selezionatiIds, setSelezionatiIds] = useState<Set<number>>(
    new Set(),
  );

  // Tab di reparto condiviso tra "Rosa simulata" e "Giocatori disponibili",
  // così le due liste restano sempre allineate sullo stesso reparto
  // (utile soprattutto su mobile, dove occupano lo spazio una sopra l'altra).
  const [activeTab, setActiveTab] = useState<Ruolo>("P");

  useEffect(() => {
    getAllAste()
      .then((asteList) => {
        setAste(asteList);
        if (asteList.length > 0) setSelectedAstaId(asteList[0].id);
      })
      .catch((err) => console.error("Errore caricamento aste:", err))
      .finally(() => setLoadingAste(false));
  }, []);

  const astaSelezionata = useMemo(
    () => aste.find((a) => a.id === selectedAstaId) ?? null,
    [aste, selectedAstaId],
  );

  useEffect(() => {
    if (!astaSelezionata) return;
    setLoadingGiocatori(true);
    setSelezionatiIds(new Set()); // reset della simulazione al cambio asta
    setActiveTab("P");

    getAllGiocatori(astaSelezionata.stagione)
      .then((lista) => {
        // Preferiamo i giocatori legati esplicitamente a questa asta (id_asta);
        // se nessuno risulta ancora collegato usiamo tutti quelli della stagione
        // dell'asta selezionata, così la simulazione funziona anche prima che
        // l'asta live venga svolta.
        const legatiAllAsta = lista.filter(
          (g) => g.id_asta === astaSelezionata.id,
        );
        setGiocatori(legatiAllAsta.length > 0 ? legatiAllAsta : lista);
      })
      .catch((err) => console.error("Errore caricamento giocatori:", err))
      .finally(() => setLoadingGiocatori(false));
  }, [astaSelezionata]);

  const giocatoriSelezionati = useMemo(
    () => giocatori.filter((g) => selezionatiIds.has(g.id)),
    [giocatori, selezionatiIds],
  );

  const giocatoriDisponibili = useMemo(
    () => giocatori.filter((g) => !selezionatiIds.has(g.id)),
    [giocatori, selezionatiIds],
  );

  const conteggiSelezionati = useMemo(() => {
    const base: Record<Ruolo, number> = { P: 0, D: 0, C: 0, A: 0 };
    giocatoriSelezionati.forEach((g) => {
      if ((RUOLI_VALIDI as string[]).includes(g.r)) {
        base[g.r as Ruolo] += 1;
      }
    });
    return base;
  }, [giocatoriSelezionati]);

  const handleChangePercentuale = (ruolo: Ruolo, value: number) => {
    setPercentuali((prev) => ({ ...prev, [ruolo]: value }));
  };

  const handleSeleziona = (g: StatisticheGiocatore) => {
    setSelezionatiIds((prev) => {
      const next = new Set(prev);
      next.add(g.id);
      return next;
    });
  };

  const handleRimuovi = (g: StatisticheGiocatore) => {
    setSelezionatiIds((prev) => {
      const next = new Set(prev);
      next.delete(g.id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
            Simulazione
          </p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Simula Rosa
          </h1>
        </div>

        <SelezioneAsta
          aste={aste}
          selectedAstaId={selectedAstaId}
          onSelect={setSelectedAstaId}
          loading={loadingAste}
        />

        {astaSelezionata && (
          <>
            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              <RipartizioneBudget
                budgetTotale={astaSelezionata.budget}
                percentuali={percentuali}
                onChange={handleChangePercentuale}
              />
              <RiepilogoSimulazione
                budgetTotale={astaSelezionata.budget}
                percentuali={percentuali}
                giocatoriSelezionati={giocatoriSelezionati}
              />
            </div>

            {loadingGiocatori ? (
              <div className="text-center py-10 text-gray-500 font-bold uppercase tracking-widest text-sm">
                Caricamento giocatori...
              </div>
            ) : (
              <>
                <SelettoreRuolo
                  activeTab={activeTab}
                  onChange={setActiveTab}
                  conteggi={conteggiSelezionati}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                  <RosaSimulata
                    giocatori={giocatoriSelezionati}
                    activeTab={activeTab}
                    onRimuovi={handleRimuovi}
                  />
                  <GiocatoriDisponibili
                    giocatori={giocatoriDisponibili}
                    activeTab={activeTab}
                    onSeleziona={handleSeleziona}
                  />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};