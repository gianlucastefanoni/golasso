import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { StatisticheGiocatore, Ruolo } from "../../types/GiocatoreTypes";
import { RuoloBadge } from "../Home/RuoloBadge";
import { getFmColor, getMvColor } from "../FantaSquadra/FantaSquadraUtils";

interface Props {
  giocatori: StatisticheGiocatore[];
  activeTab: Ruolo;
  onSeleziona: (g: StatisticheGiocatore) => void;
}

// Il tab di reparto (P/D/C/A) è condiviso col genitore (vedi SelettoreRuolo),
// così questa lista resta sempre allineata a "Rosa simulata".
export const GiocatoriDisponibili = ({
  giocatori,
  activeTab,
  onSeleziona,
}: Props) => {
  const [search, setSearch] = useState("");
  const [soloSvincolati, setSoloSvincolati] = useState(false);

  const filtrati = useMemo(() => {
    const s = search.toLowerCase().trim();
    return giocatori
      .filter((g) => g.r === activeTab)
      .filter(
        (g) =>
          s.length === 0 ||
          g.nome.toLowerCase().includes(s) ||
          g.squadra.toLowerCase().includes(s),
      )
      .filter((g) => !soloSvincolati || g.id_fanta_squadra === null)
      .sort((a, b) => (b.costo_prev ?? 0) - (a.costo_prev ?? 0));
  }, [giocatori, activeTab, search, soloSvincolati]);

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 overflow-hidden flex flex-col min-w-0">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-black uppercase italic tracking-tighter text-sm mb-3">
          Giocatori disponibili{" "}
          <span className="text-emerald-500">({filtrati.length})</span>
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Cerca giocatore o squadra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-10 text-sm outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
        </div>
        <label className="flex items-center gap-2 mt-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={soloSvincolati}
            onChange={(e) => setSoloSvincolati(e.target.checked)}
            className="accent-emerald-500"
          />
          Solo svincolati
        </label>
      </div>

      <div className="max-h-[600px] overflow-y-auto custom-scrollbar divide-y divide-gray-800">
        {filtrati.map((g) => (
          <div
            key={g.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/40 transition-all"
          >
            <RuoloBadge ruolo={g.r} />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm truncate">{g.nome}</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold truncate">
                {g.squadra}
                {g.id_fanta_squadra ? ` · ${g.FantaSquadra}` : ""}
              </p>
            </div>
            <div className="text-right hidden sm:block flex-shrink-0">
              <p className={`text-xs font-bold ${getMvColor(g.mv)}`}>
                {g.mv.toFixed(2)}
              </p>
              <p className={`text-xs font-black ${getFmColor(g.fm)}`}>
                {g.fm.toFixed(2)}
              </p>
            </div>
            <div className="text-right w-12 flex-shrink-0">
              <p className="text-sm font-black text-emerald-400">
                {g.costo_prev ?? "-"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSeleziona(g)}
              aria-label={`Aggiungi ${g.nome} alla rosa simulata`}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}

        {filtrati.length === 0 && (
          <div className="text-center text-gray-600 italic py-10 text-sm">
            Nessun giocatore trovato
          </div>
        )}
      </div>
    </div>
  );
};