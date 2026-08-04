import { X } from "lucide-react";
import { Ruolo, StatisticheGiocatore } from "../../types/GiocatoreTypes";
import { RuoloBadge } from "../Home/RuoloBadge";

const RUOLI: Ruolo[] = ["P", "D", "C", "A"];
const RUOLO_LABEL: Record<Ruolo, string> = {
  P: "Portieri",
  D: "Difensori",
  C: "Centrocampisti",
  A: "Attaccanti",
};

interface Props {
  giocatori: StatisticheGiocatore[];
  activeTab: Ruolo;
  onRimuovi: (g: StatisticheGiocatore) => void;
}

// Su mobile mostriamo solo il reparto corrispondente al tab attivo (per
// occupare meno spazio verticale, dato che le due colonne si impilano).
// Da "lg" in su invece la rosa simulata resta sempre visibile per intero,
// con tutti i reparti: il tab continua comunque a filtrare l'elenco dei
// giocatori disponibili nella colonna accanto.
export const RosaSimulata = ({ giocatori, activeTab, onRimuovi }: Props) => {
  const spesoTotale = giocatori.reduce(
    (acc, g) => acc + (g.costo_prev ?? 0),
    0,
  );
  const repartoAttivoVuoto =
    giocatori.length > 0 &&
    giocatori.filter((g) => g.r === activeTab).length === 0;

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 overflow-hidden flex flex-col min-w-0">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between gap-2">
        <h2 className="font-black uppercase italic tracking-tighter text-sm">
          Rosa simulata{" "}
          <span className="text-emerald-500">({giocatori.length})</span>
        </h2>
        <span className="text-sm font-black text-emerald-400 flex-shrink-0">
          {spesoTotale} cr.
        </span>
      </div>

      <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
        {giocatori.length === 0 && (
          <div className="text-center text-gray-600 italic py-10 text-sm px-4">
            Nessun giocatore selezionato. Aggiungilo dall'elenco a destra.
          </div>
        )}

        {/* Messaggio dedicato solo per mobile: capita quando la rosa ha
            giocatori in altri reparti ma non in quello del tab attivo,
            mentre su desktop i gruppi sono comunque tutti visibili. */}
        {repartoAttivoVuoto && (
          <div className="lg:hidden text-center text-gray-600 italic py-10 text-sm px-4">
            Nessun giocatore selezionato in questo reparto.
          </div>
        )}

        {RUOLI.map((r) => {
          const delReparto = giocatori
            .filter((g) => g.r === r)
            .sort((a, b) => (b.costo_prev ?? 0) - (a.costo_prev ?? 0));
          if (delReparto.length === 0) return null;

          const subtotale = delReparto.reduce(
            (acc, g) => acc + (g.costo_prev ?? 0),
            0,
          );
          const isTabAttivo = activeTab === r;

          return (
            <div
              key={r}
              className={`border-b border-gray-800 last:border-b-0 ${
                isTabAttivo ? "block" : "hidden lg:block"
              }`}
            >
              <div className="px-4 py-2 bg-gray-800/40 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {RUOLO_LABEL[r]} · {delReparto.length}
                </span>
                <span className="text-[10px] font-black text-gray-400">
                  {subtotale} cr.
                </span>
              </div>
              <div className="divide-y divide-gray-800">
                {delReparto.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-800/40 transition-all"
                  >
                    <RuoloBadge ruolo={g.r} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{g.nome}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-bold truncate">
                        {g.squadra}
                      </p>
                    </div>
                    <div className="text-right w-12 flex-shrink-0">
                      <p className="text-sm font-black text-emerald-400">
                        {g.costo_prev ?? "-"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRimuovi(g)}
                      aria-label={`Rimuovi ${g.nome} dalla rosa simulata`}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};