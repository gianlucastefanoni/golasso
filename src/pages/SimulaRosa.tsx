import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { getAllAste, Asta } from "../api/astaApi";
import { getAllFasce } from "../api/fasceApi";
import { getAllGiocatori } from "../api/giocatoriApi";
import {
  StatisticheGiocatore,
  Ruolo,
  FasciaRow,
} from "../types/GiocatoreTypes";
import { SelezioneAsta } from "../components/AstaLive/SelezioneAsta";
import {
  RipartizioneBudget,
  RipartizionePercentuali,
} from "../components/SimulaRosa/RipartizioneBudget";
import { RiepilogoSimulazione } from "../components/SimulaRosa/RiepilogoSimulazione";
import { RosaSimulata } from "../components/SimulaRosa/RosaSimulata";
import { GiocatoriDisponibili } from "../components/SimulaRosa/GiocatoriDisponibili";
import { SelettoreRuolo } from "../components/SimulaRosa/SelettoreRuolo";

import { supabase } from "../supabase/supabaseClient";

import {
  getSimulazioneRosa,
  aggiungiGiocatoreSimulazione,
  rimuoviGiocatoreSimulazione,
} from "../api/simulazioneRosaApi";

const RUOLI_VALIDI: Ruolo[] = ["P", "D", "C", "A"];

const DEFAULT_PERCENTUALI: RipartizionePercentuali = {
  P: 5,
  D: 20,
  C: 30,
  A: 45,
};

export const SimulaRosa = () => {
  const [aste, setAste] = useState<Asta[]>([]);
  const [fasce, setFasce] = useState<FasciaRow[]>([]);
  const [loadingAste, setLoadingAste] = useState(true);
  const [selectedAstaId, setSelectedAstaId] = useState<number | null>(null);
  const [giocatori, setGiocatori] = useState<StatisticheGiocatore[]>([]);
  const [loadingGiocatori, setLoadingGiocatori] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [loadingSimulazione, setLoadingSimulazione] = useState(false);
  const [percentuali, setPercentuali] =
    useState<RipartizionePercentuali>(DEFAULT_PERCENTUALI);
  const [selezionatiIds, setSelezionatiIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<Ruolo>("P");

  /**
   * Recupero utente autenticato
   */
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setProfileId(user.id);
      }
    };

    loadProfile();
  }, []);

  /**
   * Caricamento aste
   */
  useEffect(() => {
    Promise.all([getAllAste(), getAllFasce()])
      .then(([asteList, fasceList]) => {
        setAste(asteList);
        setFasce(fasceList);

        if (asteList.length > 0) {
          setSelectedAstaId(asteList[0].id);
        }
      })
      .catch((err) => console.error("Errore caricamento aste:", err))
      .finally(() => setLoadingAste(false));
  }, []);

  const astaSelezionata = useMemo(
    () => aste.find((a) => a.id === selectedAstaId) ?? null,
    [aste, selectedAstaId],
  );

  /**
   * Caricamento giocatori + simulazione salvata
   */
  useEffect(() => {
    if (!astaSelezionata || !profileId) return;

    const loadData = async () => {
      setLoadingGiocatori(true);
      setLoadingSimulazione(true);

      try {
        setActiveTab("P");

        const lista = await getAllGiocatori(astaSelezionata.stagione);

        const legatiAllAsta = lista.filter(
          (g) => g.id_asta === astaSelezionata.id,
        );

        const giocatoriAsta = legatiAllAsta.length > 0 ? legatiAllAsta : lista;

        setGiocatori(giocatoriAsta);

        const simulazione = await getSimulazioneRosa(
          String(astaSelezionata.id),
          profileId,
        );

        setSelezionatiIds(
          new Set(simulazione.map((x) => Number(x.id_giocatore))),
        );
      } catch (err) {
        console.error("Errore caricamento simulazione:", err);
      } finally {
        setLoadingGiocatori(false);
        setLoadingSimulazione(false);
      }
    };

    loadData();
  }, [astaSelezionata, profileId]);

  const giocatoriSelezionati = useMemo(
    () => giocatori.filter((g) => selezionatiIds.has(g.id)),
    [giocatori, selezionatiIds],
  );

  const giocatoriDisponibili = useMemo(
    () => giocatori.filter((g) => !selezionatiIds.has(g.id)),
    [giocatori, selezionatiIds],
  );

  const conteggiSelezionati = useMemo(() => {
    const base: Record<Ruolo, number> = {
      P: 0,
      D: 0,
      C: 0,
      A: 0,
    };

    giocatoriSelezionati.forEach((g) => {
      if ((RUOLI_VALIDI as string[]).includes(g.r)) {
        base[g.r as Ruolo]++;
      }
    });

    return base;
  }, [giocatoriSelezionati]);

  const handleChangePercentuale = (ruolo: Ruolo, value: number) => {
    setPercentuali((prev) => ({
      ...prev,
      [ruolo]: value,
    }));
  };

  const handleSeleziona = async (g: StatisticheGiocatore) => {
    if (!astaSelezionata || !profileId) return;

    setSelezionatiIds((prev) => {
      const next = new Set(prev);

      next.add(g.id);

      return next;
    });

    try {
      await aggiungiGiocatoreSimulazione(
        String(astaSelezionata.id),
        profileId,
        String(g.id),
      );
    } catch (err) {
      console.error("Errore salvataggio giocatore:", err);

      setSelezionatiIds((prev) => {
        const next = new Set(prev);

        next.delete(g.id);

        return next;
      });
    }
  };

  const handleRimuovi = async (g: StatisticheGiocatore) => {
    if (!astaSelezionata || !profileId) return;

    setSelezionatiIds((prev) => {
      const next = new Set(prev);

      next.delete(g.id);

      return next;
    });

    try {
      await rimuoviGiocatoreSimulazione(
        String(astaSelezionata.id),
        profileId,
        String(g.id),
      );
    } catch (err) {
      console.error("Errore rimozione giocatore:", err);

      setSelezionatiIds((prev) => {
        const next = new Set(prev);

        next.add(g.id);

        return next;
      });
    }
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

            {loadingGiocatori || loadingSimulazione ? (
              <div className="text-center py-10 text-gray-500 font-bold uppercase tracking-widest text-sm">
                Caricamento simulazione...
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
                    fasce={fasce}
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
