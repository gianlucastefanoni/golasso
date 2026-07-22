import { useEffect, useMemo, useState } from "react";
import { Header } from "../components/Header";
import { getAllAste, Asta } from "../api/astaApi";
import { getAllFantaSquadre } from "../api/fantaSquadreApi";
import { getAllGiocatori } from "../api/giocatoriApi";
import {
  StatisticheGiocatore,
  FantaSquadra,
  Ruolo,
} from "../types/GiocatoreTypes";
import { SelezioneAsta } from "../components/AstaLive/SelezioneAsta";
import {
  ConfigurazioneSquadre,
  SlotConfig,
} from "../components/AstaLive/ConfigurazioneSquadre";
import { PannelloFantaSquadre } from "../components/AstaLive/PannelloFantaSquadre";
import { ListaGiocatoriAsta } from "../components/AstaLive/ListaGiocatoriAsta";

const DEFAULT_SLOT_CONFIG: SlotConfig = { P: 3, D: 8, C: 8, A: 6 };

export const AstaLive = () => {
  const [aste, setAste] = useState<Asta[]>([]);
  const [loadingAste, setLoadingAste] = useState(true);
  const [selectedAstaId, setSelectedAstaId] = useState<number | null>(null);

  const [fantaSquadre, setFantaSquadre] = useState<FantaSquadra[]>([]);
  const [giocatori, setGiocatori] = useState<StatisticheGiocatore[]>([]);
  const [loadingGiocatori, setLoadingGiocatori] = useState(false);

  const [slotConfig, setSlotConfig] = useState<SlotConfig>(DEFAULT_SLOT_CONFIG);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Carica aste + fanta squadre all'avvio
  useEffect(() => {
    Promise.all([getAllAste(), getAllFantaSquadre()])
      .then(([asteList, teamsList]) => {
        setAste(asteList);
        setFantaSquadre(teamsList);
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

  // Carica i giocatori della stagione dell'asta selezionata
  useEffect(() => {
    if (!astaSelezionata) return;
    setLoadingGiocatori(true);
    setSelectedTeamId(null);
    getAllGiocatori(astaSelezionata.stagione)
      .then(setGiocatori)
      .catch((err) => console.error("Errore caricamento giocatori:", err))
      .finally(() => setLoadingGiocatori(false));
  }, [astaSelezionata]);

  const giocatoriVisualizzati = useMemo(() => {
    if (selectedTeamId === null) return giocatori;
    return giocatori.filter((g) => g.id_fanta_squadra === selectedTeamId);
  }, [giocatori, selectedTeamId]);

  const handleChangeSlot = (ruolo: Ruolo, value: number) => {
    setSlotConfig((prev) => ({ ...prev, [ruolo]: value }));
  };

  // Aggiornamento ottimistico locale dopo un salvataggio riuscito, evita un refetch completo
  const handleAssegnato = (
    id: number,
    stagione: number,
    idFantaSquadra: number | null,
    costo: number | null,
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
                fantaSquadre={fantaSquadre}
                onAssegnato={handleAssegnato}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};
