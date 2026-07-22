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
import { Search, Check, Loader2 } from "lucide-react";

interface Props {
  giocatori: StatisticheGiocatore[]; // già filtrati per stagione (+ eventualmente per team)
  giocatoriAnnoPrec: Map<number, StatisticheGiocatore>;
  stagionePrecedente: number | null;
  fantaSquadre: FantaSquadra[];
  onAssegnato: (
    id: number,
    stagione: number,
    idFantaSquadra: number | null,
    costo: number | null,
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
  const [bozze, setBozze] = useState<
    Record<number, { idFantaSquadra: string; costo: string }>
  >({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const filtrati = useMemo(() => {
    const s = search.toLowerCase();
    return giocatori.filter(
      (g) =>
        g.nome.toLowerCase().includes(s) || g.squadra.toLowerCase().includes(s),
    );
  }, [giocatori, search]);

  const getBozza = (g: StatisticheGiocatore) =>
    bozze[g.id] ?? {
      idFantaSquadra: g.id_fanta_squadra ? String(g.id_fanta_squadra) : "",
      costo: g.costo !== null ? String(g.costo) : "",
    };

  const setBozza = (
    g: StatisticheGiocatore,
    patch: Partial<{ idFantaSquadra: string; costo: string }>,
  ) => {
    setBozze((prev) => ({
      ...prev,
      [g.id]: { ...getBozza(g), ...prev[g.id], ...patch },
    }));
  };

  const handleSalva = async (g: StatisticheGiocatore) => {
    const bozza = getBozza(g);
    const idFantaSquadra = bozza.idFantaSquadra
      ? Number(bozza.idFantaSquadra)
      : null;
    const costo = bozza.costo !== "" ? Number(bozza.costo) : null;

    setSavingId(g.id);
    try {
      await assegnaGiocatore(g.id, g.stagione, idFantaSquadra, costo);
      onAssegnato(g.id, g.stagione, idFantaSquadra, costo);
    } catch (err) {
      alert("Errore durante il salvataggio: " + err);
    } finally {
      setSavingId(null);
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

      <div className="overflow-x-auto max-h-[650px] overflow-y-auto custom-scrollbar">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-gray-900">
            <tr className="border-b border-gray-800 text-left">
              {[
                "",
                "Giocatore",
                "Squadra",
                "Assegna a",
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
                "",
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
              const isSaving = savingId === g.id;
              const prec = giocatoriAnnoPrec.get(g.id);
              const stessoRuoloAnnoPrec = prec && prec.r === g.r; // Gs/Rp vs Rf/Rs ha senso solo se il ruolo non è cambiato

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
                      className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 min-w-[130px]"
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
                      value={bozza.costo}
                      onChange={(e) => setBozza(g, { costo: e.target.value })}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 w-16"
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
                    <TrendIndicator current={g.gf} previous={prec?.gf} />
                  </td>

                  <td className="py-2 px-2 whitespace-nowrap">
                    {g.ass}
                    <TrendIndicator current={g.ass} previous={prec?.ass} />
                  </td>

                  <td className="py-2 px-2 whitespace-nowrap">
                    {g.r === "P" ? g.gs : g.rf}
                    {stessoRuoloAnnoPrec && (
                      <TrendIndicator
                        current={g.r === "P" ? g.gs : g.rf}
                        previous={g.r === "P" ? prec?.gs : prec?.rf}
                        invert={g.r === "P"} // per il portiere: meno gol subiti = meglio
                      />
                    )}
                  </td>

                  <td className="py-2 px-2 whitespace-nowrap">
                    {g.r === "P" ? g.rp : g.rs}
                    {stessoRuoloAnnoPrec && (
                      <TrendIndicator
                        current={g.r === "P" ? g.rp : g.rs}
                        previous={g.r === "P" ? prec?.rp : prec?.rs}
                        invert={g.r !== "P"} // rigori sbagliati (rs) per i non portieri: meno = meglio
                      />
                    )}
                  </td>

                  <td className="py-2 px-2 whitespace-nowrap">
                    {g.amm}
                    <TrendIndicator
                      current={g.amm}
                      previous={prec?.amm}
                      invert
                    />
                  </td>

                  <td className="py-2 px-2 whitespace-nowrap">
                    {g.esp}
                    <TrendIndicator
                      current={g.esp}
                      previous={prec?.esp}
                      invert
                    />
                  </td>

                  <td className="py-2 px-2 whitespace-nowrap">
                    {g.au}
                    <TrendIndicator current={g.au} previous={prec?.au} invert />
                  </td>

                  <td className="py-2 px-2">
                    <button
                      onClick={() => handleSalva(g)}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-black uppercase rounded-lg py-1.5 px-2 transition-all whitespace-nowrap"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Salva
                    </button>
                  </td>
                </tr>
              );
            })}

            {filtrati.length === 0 && (
              <tr>
                <td
                  colSpan={16}
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
