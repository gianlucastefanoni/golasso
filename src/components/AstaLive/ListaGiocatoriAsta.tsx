import { Fragment, useMemo, useState } from "react";
import {
  StatisticheGiocatore,
  FantaSquadra,
  GiocatoreAnalisiRow,
} from "../../types/GiocatoreTypes";
import { FasciaRow } from "../../api/fasceApi";
import { RuoloBadge } from "../Home/RuoloBadge";
import {
  getFmColor,
  getMvColor,
  getPvColor,
} from "../FantaSquadra/FantaSquadraUtils";
import { assegnaGiocatore } from "../../api/giocatoriApi";
import { upsertGiocatoreAnalisi } from "../../api/giocatoriAnalisiApi";
import { TrendIndicator } from "./TrendIndicator";
import { Search, Star, MessageSquareText, X } from "lucide-react";

type RuoloAsta = "P" | "D" | "C" | "A";
type SortField =
  | "nome"
  | "squadra"
  | "fanta"
  | "ruolo"
  | "pv"
  | "mv"
  | "fm"
  | "costo"
  | "costo_prev"
  | "adjusted";

type BozzaGiocatore = {
  idFantaSquadra: string;
  costo: string;
  costoPrev: string;
};

type AnalisiOverride = {
  fascia_id?: number | null;
  obiettivo?: boolean | null;
  note?: string | null;
};

const RUOLI_ASTA: RuoloAsta[] = ["P", "D", "C", "A"];
const RUOLO_LABEL: Record<RuoloAsta, string> = {
  P: "Portieri",
  D: "Difensori",
  C: "Centrocampisti",
  A: "Attaccanti",
};
const TOTALE_COLONNE = 20;

const isRuoloAsta = (ruolo: string): ruolo is RuoloAsta =>
  RUOLI_ASTA.includes(ruolo as RuoloAsta);

const isValidNumber = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const parseNumberInput = (value: string): number | null => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

interface Props {
  giocatori: StatisticheGiocatore[];
  giocatoriAnnoPrec: Map<number, StatisticheGiocatore>;
  stagionePrecedente: number | null;
  fantaSquadre: FantaSquadra[];
  fasce: FasciaRow[];
  onAssegnato: (
    id: number,
    stagione: number,
    idFantaSquadra: number | null,
    costo: number | null,
    costoPrev: number | null,
  ) => void;
}

export const ListaGiocatoriAsta = ({
  giocatori,
  giocatoriAnnoPrec,
  stagionePrecedente,
  fantaSquadre,
  fasce,
  onAssegnato,
}: Props) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<RuoloAsta>("P");
  const [filtroSquadra, setFiltroSquadra] = useState("ALL");
  const [filtroFantaSquadra, setFiltroFantaSquadra] = useState("ALL");
  const [soloSvincolati, setSoloSvincolati] = useState(false);
  const [sortField, setSortField] = useState<SortField>("costo_prev");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [bozze, setBozze] = useState<Record<number, BozzaGiocatore>>({});
  const [savingIds, setSavingIds] = useState<Record<number, boolean>>({});
  const [analisiOverrides, setAnalisiOverrides] = useState<
    Record<number, AnalisiOverride>
  >({});
  const [noteModal, setNoteModal] = useState<{
    giocatoreId: number;
    stagione: number;
    nome: string;
    testo: string;
  } | null>(null);

  // Applica eventuali override locali (fascia/obiettivo/note) sopra i dati ricevuti da props,
  // così l'interfaccia reagisce subito senza aspettare un refetch dal parent.
  const effettivi = useMemo(
    () =>
      giocatori.map((g) => {
        const override = analisiOverrides[g.id];
        if (!override) return g;
        return {
          ...g,
          fascia_id:
            override.fascia_id !== undefined ? override.fascia_id : g.fascia_id,
          obiettivo:
            override.obiettivo !== undefined ? override.obiettivo : g.obiettivo,
          note: override.note !== undefined ? override.note : g.note,
        };
      }),
    [giocatori, analisiOverrides],
  );

  const fasceOrdinate = useMemo(
    () => fasce.slice().sort((a, b) => a.id - b.id),
    [fasce],
  );

  const percentualiDiffPerRuolo = useMemo<Record<RuoloAsta, number>>(() => {
    const aggregati = {
      P: { sumDiff: 0, count: 0 },
      D: { sumDiff: 0, count: 0 },
      C: { sumDiff: 0, count: 0 },
      A: { sumDiff: 0, count: 0 },
    };

    for (const g of effettivi) {
      if (
        !isRuoloAsta(g.r) ||
        !isValidNumber(g.costo) ||
        !isValidNumber(g.costo_prev) ||
        g.costo_prev <= 0
      ) {
        continue;
      }

      const diffPercent = (g.costo - g.costo_prev) / g.costo_prev;
      aggregati[g.r].sumDiff += diffPercent;
      aggregati[g.r].count += 1;
    }

    return {
      P: aggregati.P.count ? aggregati.P.sumDiff / aggregati.P.count : 0,
      D: aggregati.D.count ? aggregati.D.sumDiff / aggregati.D.count : 0,
      C: aggregati.C.count ? aggregati.C.sumDiff / aggregati.C.count : 0,
      A: aggregati.A.count ? aggregati.A.sumDiff / aggregati.A.count : 0,
    };
  }, [effettivi]);

  const opzioniSquadre = useMemo(
    () =>
      Array.from(new Set(effettivi.map((g) => g.squadra).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [effettivi],
  );

  const opzioniFantaSquadre = useMemo(
    () => fantaSquadre.slice().sort((a, b) => a.nome.localeCompare(b.nome)),
    [fantaSquadre],
  );

  const calcolaAdjusted = (ruolo: string, costoPrev: number | null) => {
    if (!isRuoloAsta(ruolo) || !isValidNumber(costoPrev)) return null;
    const percentuale = percentualiDiffPerRuolo[ruolo];
    if (!isValidNumber(percentuale)) return null;
    return Math.max(1, Math.round(costoPrev * (1 + percentuale)));
  };

  const getSortValue = (g: StatisticheGiocatore): string | number => {
    switch (sortField) {
      case "nome":
        return g.nome;
      case "squadra":
        return g.squadra;
      case "fanta":
        return g.FantaSquadra ?? "";
      case "ruolo":
        return g.r;
      case "pv":
        return g.pv;
      case "mv":
        return g.mv;
      case "fm":
        return g.fm;
      case "costo":
        return isValidNumber(g.costo) ? g.costo : -1;
      case "costo_prev":
        return isValidNumber(g.costo_prev) ? g.costo_prev : -1;
      case "adjusted": {
        const adjusted = calcolaAdjusted(g.r, g.costo_prev);
        return isValidNumber(adjusted) ? adjusted : -1;
      }
      default:
        return isValidNumber(g.costo_prev) ? g.costo_prev : -1;
    }
  };

  const ordina = (lista: StatisticheGiocatore[]) =>
    lista.slice().sort((a, b) => {
      const av = getSortValue(a);
      const bv = getSortValue(b);
      let result = 0;

      if (typeof av === "string" && typeof bv === "string") {
        result = av.localeCompare(bv);
      } else {
        result = Number(av) - Number(bv);
      }

      return sortDirection === "asc" ? result : -result;
    });

  // Filtra per tab (ruolo) + filtri secondari, poi raggruppa per fascia (ordinata per id).
  // Il gruppo "senza fascia" (fascia_id null o non più esistente) va sempre in fondo.
  const gruppi = useMemo(() => {
    const s = search.toLowerCase().trim();

    const candidati = effettivi.filter((g) => {
      const matchTab = g.r === activeTab;
      const matchSearch =
        s.length === 0 ||
        g.nome.toLowerCase().includes(s) ||
        g.squadra.toLowerCase().includes(s);
      const matchSquadra =
        filtroSquadra === "ALL" || g.squadra === filtroSquadra;
      const matchFanta =
        filtroFantaSquadra === "ALL" ||
        String(g.id_fanta_squadra ?? "") === filtroFantaSquadra;
      const matchSvincolati = !soloSvincolati || g.id_fanta_squadra === null;

      return (
        matchTab && matchSearch && matchSquadra && matchFanta && matchSvincolati
      );
    });

    const risultato: {
      fascia: FasciaRow | null;
      giocatori: StatisticheGiocatore[];
    }[] = [];

    for (const fascia of fasceOrdinate) {
      const delGruppo = candidati.filter((g) => g.fascia_id === fascia.id);
      if (delGruppo.length > 0) {
        risultato.push({ fascia, giocatori: ordina(delGruppo) });
      }
    }

    const idFasceNote = new Set(fasceOrdinate.map((f) => f.id));
    const senzaFascia = candidati.filter(
      (g) => g.fascia_id == null || !idFasceNote.has(g.fascia_id),
    );
    if (senzaFascia.length > 0) {
      risultato.push({ fascia: null, giocatori: ordina(senzaFascia) });
    }

    return risultato;
  }, [
    effettivi,
    activeTab,
    search,
    filtroSquadra,
    filtroFantaSquadra,
    soloSvincolati,
    fasceOrdinate,
    sortField,
    sortDirection,
    percentualiDiffPerRuolo,
  ]);

  const totaleRisultati = gruppi.reduce(
    (acc, g) => acc + g.giocatori.length,
    0,
  );

  const getBozza = (g: StatisticheGiocatore) =>
    bozze[g.id] ?? {
      idFantaSquadra: g.id_fanta_squadra ? String(g.id_fanta_squadra) : "",
      costo: g.costo !== null ? String(g.costo) : "",
      costoPrev: g.costo_prev !== null ? String(g.costo_prev) : "",
    };

  const setBozza = (
    g: StatisticheGiocatore,
    patch: Partial<BozzaGiocatore>,
  ) => {
    setBozze((prev) => ({
      ...prev,
      [g.id]: { ...getBozza(g), ...prev[g.id], ...patch },
    }));
  };

  const handleSalva = async (
    g: StatisticheGiocatore,
    patch?: Partial<BozzaGiocatore>,
  ) => {
    const bozza = patch ? { ...getBozza(g), ...patch } : getBozza(g);
    const idFantaSquadra = bozza.idFantaSquadra
      ? Number(bozza.idFantaSquadra)
      : null;
    const costo = parseNumberInput(bozza.costo);
    const costoPrev = parseNumberInput(bozza.costoPrev);

    const nessunaModifica =
      g.id_fanta_squadra === idFantaSquadra &&
      g.costo === costo &&
      g.costo_prev === costoPrev;
    if (nessunaModifica || savingIds[g.id]) return;

    setSavingIds((prev) => ({ ...prev, [g.id]: true }));
    try {
      await assegnaGiocatore(
        g.id,
        g.stagione,
        idFantaSquadra,
        costo,
        costoPrev,
      );
      onAssegnato(g.id, g.stagione, idFantaSquadra, costo, costoPrev);
    } catch (err) {
      alert("Errore durante il salvataggio: " + err);
    } finally {
      setSavingIds((prev) => {
        const next = { ...prev };
        delete next[g.id];
        return next;
      });
    }
  };

  // Salva su Giocatori_analisi passando sempre i tre campi (fascia/obiettivo/note)
  // così un upsert non "cancella" involontariamente gli altri due se non toccati.
  const persistiAnalisi = async (
    g: StatisticheGiocatore,
    patch: AnalisiOverride,
  ) => {
    const merged: Partial<
      Omit<GiocatoreAnalisiRow, "id" | "stagione" | "creazione_dt">
    > = {
      fascia_id:
        patch.fascia_id !== undefined ? patch.fascia_id : (g.fascia_id ?? null),
      obiettivo:
        patch.obiettivo !== undefined
          ? patch.obiettivo
          : (g.obiettivo ?? false),
      note: patch.note !== undefined ? patch.note : (g.note ?? null),
    };

    setAnalisiOverrides((prev) => ({ ...prev, [g.id]: merged }));

    try {
      await upsertGiocatoreAnalisi(g.id, g.stagione, merged);
    } catch (err) {
      alert("Errore durante il salvataggio dell'analisi: " + err);
    }
  };

  const handleToggleObiettivo = (g: StatisticheGiocatore) => {
    persistiAnalisi(g, { obiettivo: !(g.obiettivo ?? false) });
  };

  const handleCambiaFascia = (g: StatisticheGiocatore, value: string) => {
    const fasciaId = value === "" ? null : Number(value);
    persistiAnalisi(g, { fascia_id: fasciaId });
  };

  const apriModaleNote = (g: StatisticheGiocatore) => {
    setNoteModal({
      giocatoreId: g.id,
      stagione: g.stagione,
      nome: g.nome,
      testo: g.note ?? "",
    });
  };

  const salvaNoteModale = async () => {
    if (!noteModal) return;
    const giocatore = effettivi.find(
      (g) =>
        g.id === noteModal.giocatoreId && g.stagione === noteModal.stagione,
    );
    if (!giocatore) {
      setNoteModal(null);
      return;
    }
    await persistiAnalisi(giocatore, {
      note: noteModal.testo.trim() === "" ? null : noteModal.testo.trim(),
    });
    setNoteModal(null);
  };

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 overflow-hidden">
      {/* TAB RUOLI */}
      <div className="flex border-b border-gray-800">
        {RUOLI_ASTA.map((ruolo) => (
          <button
            key={ruolo}
            type="button"
            onClick={() => setActiveTab(ruolo)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === ruolo
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:bg-gray-800/60"
            }`}
          >
            {RUOLO_LABEL[ruolo]}
          </button>
        ))}
      </div>

      <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Cerca giocatore o squadra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-10 outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
        </div>
        {stagionePrecedente !== null && (
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Confronto vs stagione {stagionePrecedente}
          </p>
        )}
      </div>

      <div className="p-4 border-b border-gray-800 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select
          value={filtroSquadra}
          onChange={(e) => setFiltroSquadra(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          <option value="ALL">Squadra: tutte</option>
          {opzioniSquadre.map((squadra) => (
            <option key={squadra} value={squadra}>
              {squadra}
            </option>
          ))}
        </select>

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          <option value="nome">Ordina: nome</option>
          <option value="squadra">Ordina: squadra</option>
          <option value="fanta">Ordina: fantasquadra</option>
          <option value="mv">Ordina: media voto</option>
          <option value="fm">Ordina: fanta media</option>
          <option value="pv">Ordina: presenze voto</option>
          <option value="costo_prev">Ordina: costo prev</option>
          <option value="adjusted">Ordina: previsione adjusted</option>
          <option value="costo">Ordina: costo reale</option>
        </select>

        <select
          value={sortDirection}
          onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          <option value="asc">Ordine: crescente</option>
          <option value="desc">Ordine: decrescente</option>
        </select>

        <label className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
          <input
            type="checkbox"
            checked={soloSvincolati}
            onChange={(e) => setSoloSvincolati(e.target.checked)}
            className="accent-emerald-500"
          />
          Solo svincolati
        </label>

        <button
          type="button"
          onClick={() => {
            setFiltroSquadra("ALL");
            setFiltroFantaSquadra("ALL");
            setSoloSvincolati(false);
            setSortField("nome");
            setSortDirection("asc");
            setSearch("");
          }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs font-bold hover:border-emerald-500 transition-all"
        >
          Reset filtri
        </button>
      </div>

      <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-900">
            <tr className="border-b border-gray-800 text-left">
              {[
                "",
                "Giocatore",
                "Squadra",
                "Fascia",
                "★",
                "Note",
                "Assegna a",
                "Costo prev",
                "Prev adjust",
                "Costo",
                "Pv",
                "Mv",
                "Fm",
                "Gf",
                "Ass",
                "Gs/Rf",
                "Rp/Rs",
                "Amm",
                "Esp",
                "Aut",
              ].map((h, i) => (
                <th
                  key={i}
                  className="py-3 px-2 text-[9px] uppercase tracking-widest text-gray-500 font-black whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gruppi.map(({ fascia, giocatori: giocatoriFascia }) => (
              <Fragment key={`gruppo-${fascia?.id ?? "none"}`}>
                <tr key={`fascia-${fascia?.id ?? "none"}`}>
                  <td
                    colSpan={TOTALE_COLONNE}
                    className="py-2 px-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      backgroundColor: fascia?.colore ?? "#374151",
                      color: fascia?.colore ? "#FFFFFF" : "#d1d5db",
                    }}
                  >
                    {fascia?.nome ?? "Senza fascia"}
                  </td>
                </tr>

                {giocatoriFascia.map((g) => {
                  const bozza = getBozza(g);
                  const isAssegnato = g.id_fanta_squadra !== null;
                  const isSaving = Boolean(savingIds[g.id]);
                  const prec = giocatoriAnnoPrec.get(g.id);
                  const costoPrevBozza = parseNumberInput(bozza.costoPrev);
                  const adjustedPrev = calcolaAdjusted(
                    g.r,
                    costoPrevBozza ?? g.costo_prev ?? null,
                  );
                  const haNote = Boolean(g.note && g.note.trim() !== "");

                  return (
                    <tr
                      key={g.id}
                      className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-all ${
                        isAssegnato ? "bg-emerald-500/5" : ""
                      }`}
                    >
                      <td className="py-2 px-2">
                        <RuoloBadge ruolo={g.r} />
                      </td>

                      <td className="py-2 px-2 font-bold whitespace-nowrap">
                        {g.nome}
                      </td>

                      <td className="py-2 px-2">
                        <span className="bg-gray-800 px-2 py-0.5 rounded-lg text-[10px] font-black whitespace-nowrap">
                          {g.squadra}
                        </span>
                      </td>

                      <td className="py-2 px-2">
                        <select
                          value={g.fascia_id ?? ""}
                          onChange={(e) =>
                            handleCambiaFascia(g, e.target.value)
                          }
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 min-w-[110px]"
                        >
                          <option value="">— Nessuna —</option>
                          {fasceOrdinate.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.nome}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleObiettivo(g)}
                          title={
                            g.obiettivo
                              ? "Rimuovi dagli obiettivi"
                              : "Segna come obiettivo"
                          }
                          className="inline-flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              g.obiettivo
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => apriModaleNote(g)}
                          title={haNote ? (g.note ?? "") : "Aggiungi una nota"}
                          className="inline-flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <MessageSquareText
                            className={`w-4 h-4 ${
                              haNote ? "text-emerald-400" : "text-gray-600"
                            }`}
                          />
                        </button>
                      </td>

                      <td className="py-2 px-2">
                        <select
                          value={bozza.idFantaSquadra}
                          onChange={(e) =>
                            setBozza(g, { idFantaSquadra: e.target.value })
                          }
                          onBlur={() => handleSalva(g)}
                          disabled={isSaving}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 min-w-[130px] disabled:opacity-60"
                        >
                          <option value="">— Non assegnato —</option>
                          {opzioniFantaSquadre.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.nome}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          placeholder="—"
                          value={bozza.costoPrev}
                          onChange={(e) =>
                            setBozza(g, { costoPrev: e.target.value })
                          }
                          onBlur={() => handleSalva(g)}
                          disabled={isSaving}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 w-16 disabled:opacity-60"
                        />
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap">
                        {isValidNumber(adjustedPrev) ? adjustedPrev : "-"}
                      </td>

                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min={0}
                          placeholder="—"
                          value={bozza.costo}
                          onChange={(e) =>
                            setBozza(g, { costo: e.target.value })
                          }
                          onBlur={() => handleSalva(g)}
                          disabled={isSaving}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 w-16 disabled:opacity-60"
                        />
                        {prec?.costo ? (
                          <span className="ml-1 text-[10px] text-gray-500">
                            {prec.costo}
                          </span>
                        ) : null}
                      </td>

                      <td
                        className={
                          "py-2 px-2 whitespace-nowrap " + getPvColor(g.pv)
                        }
                      >
                        {g.pv}
                        <TrendIndicator current={g.pv} previous={prec?.pv} />
                      </td>

                      <td
                        className={
                          "py-2 px-2 whitespace-nowrap " + getMvColor(g.mv)
                        }
                      >
                        {g.mv.toFixed(2)}
                        <TrendIndicator
                          current={g.mv}
                          previous={prec?.mv}
                          decimals={2}
                        />
                      </td>

                      <td
                        className={
                          "py-2 px-2 whitespace-nowrap " + getFmColor(g.fm)
                        }
                      >
                        {g.fm.toFixed(2)}
                        <TrendIndicator
                          current={g.fm}
                          previous={prec?.fm}
                          decimals={2}
                        />
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap">
                        {g.gf}
                        {prec?.gf ? (
                          <span className="ml-1 text-[10px] text-gray-500">
                            {prec.gf}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap">
                        {g.ass}
                        {prec?.ass ? (
                          <span className="ml-1 text-[10px] text-gray-500">
                            {prec.ass}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap">
                        {g.r === "P" ? g.gs : g.rf}
                        {g.r === "P" ? (
                          prec?.gs ? (
                            <span className="ml-1 text-[10px] text-gray-500">
                              {prec.gs}
                            </span>
                          ) : null
                        ) : prec?.rf ? (
                          <span className="ml-1 text-[10px] text-gray-500">
                            {prec.rf}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap">
                        {g.r === "P" ? g.rp : g.rs}
                        {g.r === "P" ? (
                          prec?.rp ? (
                            <span className="ml-1 text-[10px] text-gray-500">
                              {prec.rp}
                            </span>
                          ) : null
                        ) : prec?.rs ? (
                          <span className="ml-1 text-[10px] text-gray-500">
                            {prec.rs}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap">
                        {g.amm}
                        {prec?.amm ? (
                          <span className="ml-1 text-[10px] text-gray-500">
                            {prec.amm}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap">
                        {g.esp}
                        {prec?.esp ? (
                          <span className="ml-1 text-[10px] text-gray-500">
                            {prec.esp}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2 px-2 whitespace-nowrap">
                        {g.au}
                        {prec?.au ? (
                          <span className="ml-1 text-[10px] text-gray-500">
                            {prec.au}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}

            {totaleRisultati === 0 && (
              <tr>
                <td
                  colSpan={TOTALE_COLONNE}
                  className="text-center text-gray-600 italic py-10"
                >
                  Nessun giocatore trovato
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALE NOTE */}
      {noteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black uppercase italic tracking-tighter text-sm">
                Nota —{" "}
                <span className="text-emerald-500">{noteModal.nome}</span>
              </h3>
              <button
                type="button"
                onClick={() => setNoteModal(null)}
                className="text-gray-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              value={noteModal.testo}
              onChange={(e) =>
                setNoteModal((prev) =>
                  prev ? { ...prev, testo: e.target.value } : prev,
                )
              }
              rows={5}
              placeholder="Scrivi qui la tua nota..."
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 transition-all resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setNoteModal(null)}
                className="flex-1 bg-gray-800 rounded-xl py-2.5 text-xs font-black uppercase tracking-widest hover:bg-gray-700 transition-all"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={salvaNoteModale}
                className="flex-1 bg-emerald-500 text-black rounded-xl py-2.5 text-xs font-black uppercase tracking-widest hover:bg-emerald-400 transition-all"
              >
                Salva
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
