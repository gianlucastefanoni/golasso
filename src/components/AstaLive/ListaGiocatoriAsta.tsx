import { useMemo, useState } from "react";
import { StatisticheGiocatore, FantaSquadra } from "../../types/GiocatoreTypes";
import { RuoloBadge } from "../Home/RuoloBadge";
import {
  getFmColor,
  getMvColor,
  getPvColor,
} from "../FantaSquadra/FantaSquadraUtils";
import { assegnaGiocatore } from "../../api/giocatoriApi";
import { Search, Check, Loader2 } from "lucide-react";

interface Props {
  giocatori: StatisticheGiocatore[]; // già filtrati per stagione (+ eventualmente per team)
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
    id: number,
    patch: Partial<{ idFantaSquadra: string; costo: string }>,
  ) => {
    setBozze((prev) => ({
      ...prev,
      [id]: { ...getBozzaById(prev, id, giocatori), ...patch },
    }));
  };

  const getBozzaById = (
    prev: Record<number, { idFantaSquadra: string; costo: string }>,
    id: number,
    all: StatisticheGiocatore[],
  ) => {
    if (prev[id]) return prev[id];
    const g = all.find((x) => x.id === id);
    return {
      idFantaSquadra: g?.id_fanta_squadra ? String(g.id_fanta_squadra) : "",
      costo: g?.costo !== null && g?.costo !== undefined ? String(g.costo) : "",
    };
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
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Cerca giocatore o squadra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 pl-10 outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
        {filtrati.map((g) => {
          const bozza = getBozza(g);
          const isAssegnato = g.id_fanta_squadra !== null;
          const isSaving = savingId === g.id;

          return (
            <div
              key={g.id}
              className={`grid grid-cols-[35px_minmax(120px,1fr)_80px_1fr_100px_70px] items-center gap-2 px-4 py-3 border-b border-gray-800/50 ${
                isAssegnato ? "bg-emerald-500/5" : ""
              }`}
            >
              <RuoloBadge ruolo={g.r} />

              <div className="truncate">
                <p className="font-bold text-sm truncate">{g.nome}</p>
                <p className="text-[9px] text-gray-500 uppercase">
                  {g.squadra}
                </p>
              </div>

              <div className="text-[10px] text-gray-400 flex flex-col gap-0.5">
                <span>
                  PV <span className={getPvColor(g.pv)}>{g.pv}</span>
                </span>
                <span>
                  MV <span className={getMvColor(g.mv)}>{g.mv.toFixed(2)}</span>
                </span>
                <span>
                  FM <span className={getFmColor(g.fm)}>{g.fm.toFixed(2)}</span>
                </span>
              </div>

              <select
                value={bozza.idFantaSquadra}
                onChange={(e) =>
                  setBozza(g.id, { idFantaSquadra: e.target.value })
                }
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500"
              >
                <option value="">— Non assegnato —</option>
                {fantaSquadre.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nome}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={0}
                placeholder="Costo"
                value={bozza.costo}
                onChange={(e) => setBozza(g.id, { costo: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-emerald-500 w-full"
              />

              <button
                onClick={() => handleSalva(g)}
                disabled={isSaving}
                className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-black uppercase rounded-lg py-1.5 px-2 transition-all"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
                Salva
              </button>
            </div>
          );
        })}

        {filtrati.length === 0 && (
          <p className="text-center text-gray-600 italic py-10">
            Nessun giocatore trovato
          </p>
        )}
      </div>
    </div>
  );
};
