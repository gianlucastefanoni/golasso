import { useState } from "react";
import { createAsta, getAstaByStagione } from "../api/astaApi";
import { createFantaSquadra } from "../api/fantaSquadreApi";
import { Header } from "../components/Header";

export const NuovaConfigurazione = () => {
  const [stagione, setStagione] = useState<number>(new Date().getFullYear());
  const [budget, setBudget] = useState<number>(500);
  const [partecipanti, setPartecipanti] = useState<number>(8);
  const [astaMsg, setAstaMsg] = useState<string | null>(null);
  const [astaError, setAstaError] = useState<string | null>(null);
  const [savingAsta, setSavingAsta] = useState(false);

  const [nomeSquadra, setNomeSquadra] = useState("");
  const [squadraMsg, setSquadraMsg] = useState<string | null>(null);
  const [squadraError, setSquadraError] = useState<string | null>(null);
  const [savingSquadra, setSavingSquadra] = useState(false);

  async function handleCreateAsta() {
    setAstaMsg(null);
    setAstaError(null);
    setSavingAsta(true);

    try {
      const esistente = await getAstaByStagione(stagione);

      if (esistente) {
        setAstaError(`Esiste già un'asta per la stagione ${stagione}.`);
        return;
      }

      const nuova = await createAsta({ stagione, budget, partecipanti });

      setAstaMsg(
        `Asta creata: stagione ${nuova.stagione}, budget ${nuova.budget}, ${nuova.partecipanti} partecipanti.`
      );
    } catch {
      setAstaError("Errore durante la creazione dell'asta. Riprova.");
    } finally {
      setSavingAsta(false);
    }
  }

  async function handleCreateFantaSquadra() {
    setSquadraMsg(null);
    setSquadraError(null);

    if (!nomeSquadra.trim()) {
      setSquadraError("Inserisci un nome valido.");
      return;
    }

    setSavingSquadra(true);

    try {
      const nuova = await createFantaSquadra(nomeSquadra.trim());

      setSquadraMsg(`Fanta squadra creata: ${nuova.nome}`);
      setNomeSquadra("");
    } catch {
      setSquadraError("Errore durante la creazione della fanta squadra. Riprova.");
    } finally {
      setSavingSquadra(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
            Configurazione
          </p>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Nuova stagione
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ASTA */}
          <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-8 backdrop-blur-md">
            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-6">
              Nuova <span className="text-emerald-500">asta</span>
            </h2>
            <div className="space-y-5">
              {[
                {
                  label: "Stagione",
                  value: stagione,
                  set: setStagione
                },
                {
                  label: "Budget",
                  value: budget,
                  set: setBudget
                },
                {
                  label: "Numero partecipanti",
                  value: partecipanti,
                  set: setPartecipanti
                }
              ].map(field => (
                <div key={field.label}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    value={field.value}
                    onChange={e => field.set(Number(e.target.value))}
                    className="
                                            w-full
                                            bg-gray-800
                                            border-2
                                            border-gray-700
                                            rounded-xl
                                            px-4
                                            py-3
                                            font-bold
                                            outline-none
                                            focus:border-emerald-500
                                            transition-all
                                        "
                  />
                </div>
              ))}
              <button
                onClick={handleCreateAsta}
                disabled={savingAsta}
                className="
                                    w-full
                                    bg-emerald-500
                                    text-black
                                    rounded-xl
                                    py-3
                                    font-black
                                    uppercase
                                    tracking-widest
                                    text-sm
                                    hover:bg-emerald-400
                                    transition-all
                                    disabled:opacity-50
                                "
              >
                {savingAsta ? "Creazione..." : "Crea asta"}
              </button>
              {astaMsg && (
                <p className="text-emerald-400 text-sm font-bold">
                  {astaMsg}
                </p>
              )}
              {astaError && (
                <p className="text-red-400 text-sm font-bold">
                  {astaError}
                </p>
              )}

            </div>
          </section>
          {/* FANTA SQUADRA */}
          <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-8 backdrop-blur-md">
            <h2 className="text-xl font-black uppercase italic tracking-tighter mb-6">
              Nuova <span className="text-emerald-500">squadra</span>
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Nome squadra
                </label>
                <input
                  type="text"
                  value={nomeSquadra}
                  onChange={e => setNomeSquadra(e.target.value)}
                  className="
                                        w-full
                                        bg-gray-800
                                        border-2
                                        border-gray-700
                                        rounded-xl
                                        px-4
                                        py-3
                                        font-bold
                                        outline-none
                                        focus:border-emerald-500
                                        transition-all
                                    "
                />
              </div>
              <button
                onClick={handleCreateFantaSquadra}
                disabled={savingSquadra}
                className="
                                    w-full
                                    bg-emerald-500
                                    text-black
                                    rounded-xl
                                    py-3
                                    font-black
                                    uppercase
                                    tracking-widest
                                    text-sm
                                    hover:bg-emerald-400
                                    transition-all
                                    disabled:opacity-50
                                "
              >
                {savingSquadra ? "Creazione..." : "Crea squadra"}
              </button>
              {squadraMsg && (
                <p className="text-emerald-400 text-sm font-bold">
                  {squadraMsg}
                </p>
              )}
              {squadraError && (
                <p className="text-red-400 text-sm font-bold">
                  {squadraError}
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};