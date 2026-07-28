import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { getAllAste, getAllStagioni, Asta } from "../api/astaApi";
import { getAllFantaSquadre } from "../api/fantaSquadreApi";
import { getAllGiocatori } from "../api/giocatoriApi";
import { getAllFasce } from "../api/fasceApi";
import {
  StatisticheGiocatore,
  FantaSquadra,
  Ruolo,
  FasciaRow
} from "../types/GiocatoreTypes";
import { SelezioneAsta } from "../components/AstaLive/SelezioneAsta";
import {
  ConfigurazioneSquadre,
  SlotConfig,
} from "../components/AstaLive/ConfigurazioneSquadre";
import { PannelloFantaSquadre } from "../components/AstaLive/PannelloFantaSquadre";
import { ListaGiocatoriAsta } from "../components/AstaLive/ListaGiocatoriAsta.tsx";

const DEFAULT_SLOT_CONFIG: SlotConfig = { P: 3, D: 8, C: 8, A: 6 };

export const AstaLive = () => {
  const [aste, setAste] = useState<Asta[]>([]);
  const [stagioniDisponibili, setStagioniDisponibili] = useState<number[]>([]);
  const [fasce, setFasce] = useState<FasciaRow[]>([])
  const [loadingAste, setLoadingAste] = useState(true);
  const [selectedAstaId, setSelectedAstaId] = useState<number | null>(null);

  const [fantaSquadre, setFantaSquadre] = useState<FantaSquadra[]>([]);
  const [giocatori, setGiocatori] = useState<StatisticheGiocatore[]>([]);
  const [giocatoriAnnoPrec, setGiocatoriAnnoPrec] = useState<
    Map<number, StatisticheGiocatore>
  >(new Map());
  const [loadingGiocatori, setLoadingGiocatori] = useState(false);

  const [slotConfig, setSlotConfig] = useState<SlotConfig>(DEFAULT_SLOT_CONFIG);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getAllAste(), getAllFantaSquadre(), getAllStagioni(), getAllFasce()])
      .then(([asteList, teamsList, stagioniList, fasceList]) => {
        setAste(asteList);
        setFantaSquadre(teamsList);
        setStagioniDisponibili(stagioniList);
        setFasce(fasceList)
        if (asteList.length > 0) setSelectedAstaId(asteList[0].id);
      })
      .catch((err) =>
        console.error("Errore caricamento aste/fanta squadre:", err),
      )
      .finally(() => setLoadingAste(false));
  }, []);

  const astaSelezionata = useMemo(
    () => aste.find((a) => a.id === selectedAstaId) ?? null,
    [aste, selectedAstaId],
  );

  // Stagione immediatamente precedente a quella dell'asta, tra quelle esistenti a DB
  const stagionePrecedente = useMemo(() => {
    if (!astaSelezionata) return null;
    const precedenti = stagioniDisponibili.filter(
      (s) => s < astaSelezionata.stagione,
    );
    if (precedenti.length === 0) return null;
    return Math.max(...precedenti);
  }, [astaSelezionata, stagioniDisponibili]);

  useEffect(() => {
    if (!astaSelezionata) return;
    setLoadingGiocatori(true);
    setSelectedTeamId(null);

    const richieste: Promise<any>[] = [
      getAllGiocatori(astaSelezionata.stagione),
    ];
    if (stagionePrecedente !== null)
      richieste.push(getAllGiocatori(stagionePrecedente));

    Promise.all(richieste)
      .then(([giocatoriCorrente, giocatoriPrec]) => {
        setGiocatori(giocatoriCorrente);
        if (giocatoriPrec) {
          setGiocatoriAnnoPrec(
            new Map(giocatoriPrec.map((g: StatisticheGiocatore) => [g.id, g])),
          );
        } else {
          setGiocatoriAnnoPrec(new Map());
        }
      })
      .catch((err) => console.error("Errore caricamento giocatori:", err))
      .finally(() => setLoadingGiocatori(false));
  }, [astaSelezionata, stagionePrecedente]);

  const giocatoriVisualizzati = useMemo(() => {
    if (selectedTeamId === null) return giocatori;
    return giocatori.filter((g) => g.id_fanta_squadra === selectedTeamId);
  }, [giocatori, selectedTeamId]);

  const handleChangeSlot = (ruolo: Ruolo, value: number) => {
    setSlotConfig((prev) => ({ ...prev, [ruolo]: value }));
  };

  const handleAssegnato = (
    id: number,
    stagione: number,
    idFantaSquadra: number | null,
    costo: number | null,
    costoPrev: number | null,
  ) => {
    setGiocatori((prev) =>
      prev.map((g) =>
        g.id === id && g.stagione === stagione
          ? {
              ...g,
              id_fanta_squadra: idFantaSquadra,
              FantaSquadra:
                fantaSquadre.find((f) => f.id === idFantaSquadra)?.nome ?? "",
              costo,
              costo_prev: costoPrev,
            }
          : g,
      ),
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
            Gestione
          </p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Asta Live
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
            <ConfigurazioneSquadre
              slotConfig={slotConfig}
              onChange={handleChangeSlot}
            />

            <PannelloFantaSquadre
              fantaSquadre={fantaSquadre}
              giocatori={giocatori}
              budgetTotale={astaSelezionata.budget}
              slotConfig={slotConfig}
              selectedTeamId={selectedTeamId}
              onSelectTeam={setSelectedTeamId}
            />

            {loadingGiocatori ? (
              <div className="text-center py-10 text-gray-500 font-bold uppercase tracking-widest text-sm">
                Caricamento giocatori...
              </div>
            ) : (
              <ListaGiocatoriAsta
                giocatori={giocatoriVisualizzati}
                giocatoriAnnoPrec={giocatoriAnnoPrec}
                stagionePrecedente={stagionePrecedente}
                fantaSquadre={fantaSquadre}
                onAssegnato={handleAssegnato}
                fasce={fasce}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
