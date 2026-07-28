import { useEffect, useState } from "react";
import {
  createAsta,
  getAstaByStagione,
  getAllAste,
  updateAsta,
  type Asta,
} from "../api/astaApi";
import {
  createFantaSquadra,
  getAllFantaSquadre,
  updateFantaSquadra,
} from "../api/fantaSquadreApi";
import {
  createFascia,
  getAllFasce,
  updateFascia,
  type FasciaRow,
} from "../api/fasceApi";
import { FantaSquadra } from "../types/GiocatoreTypes";
import { Header } from "../components/Header";

export const NuovaConfigurazione = () => {
  // ---------- ASTA ----------
  const [aste, setAste] = useState<Asta[]>([]);
  const [astaSelezionataId, setAstaSelezionataId] = useState<string | "new">(
    "new"
  );

  const [stagione, setStagione] = useState<number>(new Date().getFullYear());
  const [budget, setBudget] = useState<number>(500);
  const [partecipanti, setPartecipanti] = useState<number>(8);
  const [astaMsg, setAstaMsg] = useState<string | null>(null);
  const [astaError, setAstaError] = useState<string | null>(null);
  const [savingAsta, setSavingAsta] = useState(false);

  const astaInModifica = astaSelezionataId !== "new";

  // ---------- FANTA SQUADRA ----------
  const [squadre, setSquadre] = useState<FantaSquadra[]>([]);
  const [squadraSelezionataId, setSquadraSelezionataId] = useState<
    string | "new"
  >("new");

  const [nomeSquadra, setNomeSquadra] = useState("");
  const [squadraMsg, setSquadraMsg] = useState<string | null>(null);
  const [squadraError, setSquadraError] = useState<string | null>(null);
  const [savingSquadra, setSavingSquadra] = useState(false);

  const squadraInModifica = squadraSelezionataId !== "new";

  // ---------- FASCIA ----------
  const [fasce, setFasce] = useState<FasciaRow[]>([]);
  const [fasciaSelezionataId, setFasciaSelezionataId] = useState<
    string | "new"
  >("new");

  const [nomeFascia, setNomeFascia] = useState("");
  const [coloreFascia, setColoreFascia] = useState("#22c55e");
  const [fasciaMsg, setFasciaMsg] = useState<string | null>(null);
  const [fasciaError, setFasciaError] = useState<string | null>(null);
  const [savingFascia, setSavingFascia] = useState(false);

  const fasciaInModifica = fasciaSelezionataId !== "new";

  // ---------- CARICAMENTO LISTE ----------
  useEffect(() => {
    getAllAste()
      .then(setAste)
      .catch(() => {
        /* silenzioso: la dropdown resterà solo su "Nuova asta" */
      });
    getAllFantaSquadre()
      .then(setSquadre)
      .catch(() => {
        /* silenzioso: la dropdown resterà solo su "Nuova squadra" */
      });
    getAllFasce()
      .then(setFasce)
      .catch(() => {
        /* silenzioso: la dropdown resterà solo su "Nuova fascia" */
      });
  }, []);

  // ---------- SELEZIONE ASTA DA MODIFICARE ----------
  function handleSelezionaAsta(id: string | "new") {
    setAstaSelezionataId(id);
    setAstaMsg(null);
    setAstaError(null);

    if (id === "new") {
      setStagione(new Date().getFullYear());
      setBudget(500);
      setPartecipanti(8);
      return;
    }

    const asta = aste.find((a) => (a.id as unknown as string) == id);
    if (asta) {
      setStagione(asta.stagione);
      setBudget(asta.budget);
      setPartecipanti(asta.partecipanti);
    }
  }

  // ---------- SELEZIONE SQUADRA DA MODIFICARE ----------
  function handleSelezionaSquadra(id: string | "new") {
    setSquadraSelezionataId(id);
    setSquadraMsg(null);
    setSquadraError(null);

    if (id === "new") {
      setNomeSquadra("");
      return;
    }

    const squadra = squadre.find((s) => (s.id as unknown as string) === id);
    if (squadra) {
      setNomeSquadra(squadra.nome);
    }
  }

  // ---------- SELEZIONE FASCIA DA MODIFICARE ----------
  function handleSelezionaFascia(id: string | "new") {
    setFasciaSelezionataId(id);
    setFasciaMsg(null);
    setFasciaError(null);

    if (id === "new") {
      setNomeFascia("");
      setColoreFascia("#22c55e");
      return;
    }

    const fascia = fasce.find((f) => (f.id as unknown as string) == id);
    if (fascia) {
      setNomeFascia(fascia.nome ?? "");
      setColoreFascia(fascia.colore ?? "#22c55e");
    }
  }

  // ---------- SALVATAGGIO ASTA (CREATE O UPDATE) ----------
  async function handleSalvaAsta() {
    setAstaMsg(null);
    setAstaError(null);
    setSavingAsta(true);

    try {
      if (astaInModifica) {
        const aggiornata = await updateAsta(Number(astaSelezionataId), {
          stagione,
          budget,
          partecipanti,
        });
        setAste((prev) =>
          prev.map((a) => (a.id === aggiornata.id ? aggiornata : a))
        );
        setAstaMsg(
          `Asta aggiornata: stagione ${aggiornata.stagione}, budget ${aggiornata.budget}, ${aggiornata.partecipanti} partecipanti.`
        );
        return;
      }

      const esistente = await getAstaByStagione(stagione);
      if (esistente) {
        setAstaError(`Esiste già un'asta per la stagione ${stagione}.`);
        return;
      }

      const nuova = await createAsta({ stagione, budget, partecipanti });
      setAste((prev) => [...prev, nuova]);
      setAstaMsg(
        `Asta creata: stagione ${nuova.stagione}, budget ${nuova.budget}, ${nuova.partecipanti} partecipanti.`
      );
    } catch {
      setAstaError(
        astaInModifica
          ? "Errore durante l'aggiornamento dell'asta. Riprova."
          : "Errore durante la creazione dell'asta. Riprova."
      );
    } finally {
      setSavingAsta(false);
    }
  }

  // ---------- SALVATAGGIO SQUADRA (CREATE O UPDATE) ----------
  async function handleSalvaFantaSquadra() {
    setSquadraMsg(null);
    setSquadraError(null);

    if (!nomeSquadra.trim()) {
      setSquadraError("Inserisci un nome valido.");
      return;
    }

    setSavingSquadra(true);

    try {
      if (squadraInModifica) {
        const aggiornata = await updateFantaSquadra(
          Number(squadraSelezionataId),
          {
            nome: nomeSquadra.trim(),
          }
        );
        setSquadre((prev) =>
          prev.map((s) => (s.id === aggiornata.id ? aggiornata : s))
        );
        setSquadraMsg(`Fanta squadra aggiornata: ${aggiornata.nome}`);
        return;
      }

      const nuova = await createFantaSquadra(nomeSquadra.trim());
      setSquadre((prev) => [...prev, nuova]);
      setSquadraMsg(`Fanta squadra creata: ${nuova.nome}`);
      setNomeSquadra("");
    } catch {
      setSquadraError(
        squadraInModifica
          ? "Errore durante l'aggiornamento della fanta squadra. Riprova."
          : "Errore durante la creazione della fanta squadra. Riprova."
      );
    } finally {
      setSavingSquadra(false);
    }
  }

  // ---------- SALVATAGGIO FASCIA (CREATE O UPDATE) ----------
  async function handleSalvaFascia() {
    setFasciaMsg(null);
    setFasciaError(null);

    if (!nomeFascia.trim()) {
      setFasciaError("Inserisci un nome valido.");
      return;
    }

    setSavingFascia(true);

    try {
      if (fasciaInModifica) {
        const aggiornata = await updateFascia(Number(fasciaSelezionataId), {
          nome: nomeFascia.trim(),
          colore: coloreFascia,
        });
        setFasce((prev) =>
          prev.map((f) => (f.id === aggiornata.id ? aggiornata : f))
        );
        setFasciaMsg(`Fascia aggiornata: ${aggiornata.nome}`);
        return;
      }

      const nuova = await createFascia({
        nome: nomeFascia.trim(),
        colore: coloreFascia,
      });
      setFasce((prev) => [...prev, nuova]);
      setFasciaMsg(`Fascia creata: ${nuova.nome}`);
      setNomeFascia("");
      setColoreFascia("#22c55e");
    } catch {
      setFasciaError(
        fasciaInModifica
          ? "Errore durante l'aggiornamento della fascia. Riprova."
          : "Errore durante la creazione della fascia. Riprova."
      );
    } finally {
      setSavingFascia(false);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* ASTA */}
          <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">
                {astaInModifica ? (
                  <>
                    Modifica <span className="text-emerald-500">asta</span>
                  </>
                ) : (
                  <>
                    Nuova <span className="text-emerald-500">asta</span>
                  </>
                )}
              </h2>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Seleziona asta
              </label>
              <select
                value={astaSelezionataId}
                onChange={(e) =>
                  handleSelezionaAsta(e.target.value as string | "new")
                }
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
              >
                <option value="new">+ Nuova asta</option>
                {aste.map((a) => (
                  <option key={a.id} value={a.id}>
                    Stagione {a.stagione}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-5">
              {[
                {
                  label: "Stagione",
                  value: stagione,
                  set: setStagione,
                },
                {
                  label: "Budget",
                  value: budget,
                  set: setBudget,
                },
                {
                  label: "Numero partecipanti",
                  value: partecipanti,
                  set: setPartecipanti,
                },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.set(Number(e.target.value))}
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
                onClick={handleSalvaAsta}
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
                {savingAsta
                  ? "Salvataggio..."
                  : astaInModifica
                  ? "Salva modifiche"
                  : "Crea asta"}
              </button>
              {astaMsg && (
                <p className="text-emerald-400 text-sm font-bold">{astaMsg}</p>
              )}
              {astaError && (
                <p className="text-red-400 text-sm font-bold">{astaError}</p>
              )}
            </div>
          </section>

          {/* FANTA SQUADRA */}
          <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">
                {squadraInModifica ? (
                  <>
                    Modifica <span className="text-emerald-500">squadra</span>
                  </>
                ) : (
                  <>
                    Nuova <span className="text-emerald-500">squadra</span>
                  </>
                )}
              </h2>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Seleziona squadra
              </label>
              <select
                value={squadraSelezionataId}
                onChange={(e) =>
                  handleSelezionaSquadra(e.target.value as string | "new")
                }
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
              >
                <option value="new">+ Nuova squadra</option>
                {squadre.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Nome squadra
                </label>
                <input
                  type="text"
                  value={nomeSquadra}
                  onChange={(e) => setNomeSquadra(e.target.value)}
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
                onClick={handleSalvaFantaSquadra}
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
                {savingSquadra
                  ? "Salvataggio..."
                  : squadraInModifica
                  ? "Salva modifiche"
                  : "Crea squadra"}
              </button>
              {squadraMsg && (
                <p className="text-emerald-400 text-sm font-bold">
                  {squadraMsg}
                </p>
              )}
              {squadraError && (
                <p className="text-red-400 text-sm font-bold">{squadraError}</p>
              )}
            </div>
          </section>

          {/* FASCIA */}
          <section className="bg-gray-900/60 rounded-3xl border border-gray-800 p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic tracking-tighter">
                {fasciaInModifica ? (
                  <>
                    Modifica <span className="text-emerald-500">fascia</span>
                  </>
                ) : (
                  <>
                    Nuova <span className="text-emerald-500">fascia</span>
                  </>
                )}
              </h2>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Seleziona fascia
              </label>
              <select
                value={fasciaSelezionataId}
                onChange={(e) =>
                  handleSelezionaFascia(e.target.value as string | "new")
                }
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
              >
                <option value="new">+ Nuova fascia</option>
                {fasce.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Nome fascia
                </label>
                <input
                  type="text"
                  value={nomeFascia}
                  onChange={(e) => setNomeFascia(e.target.value)}
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
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                  Colore
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={coloreFascia}
                    onChange={(e) => setColoreFascia(e.target.value)}
                    className="w-14 h-12 bg-gray-800 border-2 border-gray-700 rounded-xl cursor-pointer outline-none focus:border-emerald-500 transition-all"
                  />
                  <input
                    type="text"
                    value={coloreFascia}
                    onChange={(e) => setColoreFascia(e.target.value)}
                    placeholder="#22c55e"
                    className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 font-bold outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleSalvaFascia}
                disabled={savingFascia}
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
                {savingFascia
                  ? "Salvataggio..."
                  : fasciaInModifica
                  ? "Salva modifiche"
                  : "Crea fascia"}
              </button>
              {fasciaMsg && (
                <p className="text-emerald-400 text-sm font-bold">
                  {fasciaMsg}
                </p>
              )}
              {fasciaError && (
                <p className="text-red-400 text-sm font-bold">{fasciaError}</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
