import { useMemo, useState } from "react";
import { StatisticheGiocatore, FantaSquadra } from "../../types/GiocatoreTypes";
import { RuoloBadge } from "../Home/RuoloBadge";
import {
  getFmColor,
  getMvColor,
  getPvColor,
} from "../FantaSquadra/FantaSquadraUtils";
import { assegnaGiocatore } from "../../api/giocatoriApi";
import { TrendIndicator } from "./TrendIndicator";
import { Search } from "lucide-react";

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

const RUOLI_ASTA: RuoloAsta[] = ["P", "D", "C", "A"];

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
  onAssegnato,
}: Props) => {
  const [search, setSearch] = useState("");
  const [filtroRuolo, setFiltroRuolo] = useState<"ALL" | RuoloAsta>("ALL");
  const [filtroSquadra, setFiltroSquadra] = useState("ALL");
  const [filtroFantaSquadra, setFiltroFantaSquadra] = useState("ALL");
  const [soloSvincolati, setSoloSvincolati] = useState(false);
  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [bozze, setBozze] = useState<Record<number, BozzaGiocatore>>({});
  const [savingIds, setSavingIds] = useState<Record<number, boolean>>({});

  const percentualiDiffPerRuolo = useMemo<Record<RuoloAsta, number>>(() => {
    const aggregati = {
      P: { sumDiff: 0, count: 0 },
      D: { sumDiff: 0, count: 0 },
      C: { sumDiff: 0, count: 0 },
      A: { sumDiff: 0, count: 0 },
    };

    for (const g of giocatori) {
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
  }, [giocatori]);

  const opzioniSquadre = useMemo(
    () =>
      Array.from(new Set(giocatori.map((g) => g.squadra).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [giocatori],
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

  const filtrati = useMemo(() => {
    const s = search.toLowerCase().trim();

    const candidati = giocatori.filter((g) => {
      const matchSearch =
        s.length === 0 ||
        g.nome.toLowerCase().includes(s) ||
        g.squadra.toLowerCase().includes(s);
      const matchRuolo = filtroRuolo === "ALL" || g.r === filtroRuolo;
      const matchSquadra =
        filtroSquadra === "ALL" || g.squadra === filtroSquadra;
      const matchFanta =
        filtroFantaSquadra === "ALL" ||
        String(g.id_fanta_squadra ?? "") === filtroFantaSquadra;
      const matchSvincolati = !soloSvincolati || g.id_fanta_squadra === null;

      return (
        matchSearch &&
        matchRuolo &&
        matchSquadra &&
        matchFanta &&
        matchSvincolati
      );
    });

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
          return g.nome;
      }
    };

    return candidati.slice().sort((a, b) => {
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
  }, [
    giocatori,
    search,
    filtroRuolo,
    filtroSquadra,
    filtroFantaSquadra,
    soloSvincolati,
    sortField,
    sortDirection,
    percentualiDiffPerRuolo,
  ]);

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

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 overflow-hidden">
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

      <div className="p-4 border-b border-gray-800 grid grid-cols-1 md:grid-cols-7 gap-3">
        <select
          value={filtroRuolo}
          onChange={(e) => setFiltroRuolo(e.target.value as "ALL" | RuoloAsta)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          <option value="ALL">Ruolo: tutti</option>
          {RUOLI_ASTA.map((ruolo) => (
            <option key={ruolo} value={ruolo}>
              Ruolo: {ruolo}
            </option>
          ))}
        </select>

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
          value={filtroFantaSquadra}
          onChange={(e) => setFiltroFantaSquadra(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          <option value="ALL">Fantasquadra: tutte</option>
          {opzioniFantaSquadre.map((f) => (
            <option key={f.id} value={String(f.id)}>
              {f.nome}
            </option>
          ))}
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

        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500"
        >
          <option value="nome">Ordina: nome</option>
          <option value="ruolo">Ordina: ruolo</option>
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

        <button
          type="button"
          onClick={() => {
            setFiltroRuolo("ALL");
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
            {filtrati.map((g) => {
              const bozza = getBozza(g);
              const isAssegnato = g.id_fanta_squadra !== null;
              const isSaving = Boolean(savingIds[g.id]);
              const prec = giocatoriAnnoPrec.get(g.id);
              const costoPrevBozza = parseNumberInput(bozza.costoPrev);
              const adjustedPrev = calcolaAdjusted(
                g.r,
                costoPrevBozza ?? g.costo_prev ?? null,
              );

              return (
                <tr
                  key={g.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-all ${isAssegnato ? "bg-emerald-500/5" : ""}`}
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
                      value={bozza.idFantaSquadra}
                      onChange={(e) =>
                        setBozza(g, { idFantaSquadra: e.target.value })
                      }
                      onBlur={() => handleSalva(g)}
                      disabled={isSaving}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 min-w-[130px] disabled:opacity-60"
                    >
                      <option value="">— Non assegnato —</option>
                      {fantaSquadre.map((f) => (
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
                      onChange={(e) => setBozza(g, { costo: e.target.value })}
                      onBlur={() => handleSalva(g)}
                      disabled={isSaving}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 w-16 disabled:opacity-60"
                    />
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

            {filtrati.length === 0 && (
              <tr>
                <td
                  colSpan={17}
                  className="text-center text-gray-600 italic py-10"
                >
                  Nessun giocatore trovato
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
