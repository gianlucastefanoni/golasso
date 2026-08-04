import { Wallet } from "lucide-react";
import { Ruolo, StatisticheGiocatore } from "../../types/GiocatoreTypes";
import { RipartizionePercentuali } from "./RipartizioneBudget";

interface Props {
  budgetTotale: number;
  percentuali: RipartizionePercentuali;
  giocatoriSelezionati: StatisticheGiocatore[];
}

const RUOLI: { key: Ruolo; label: string; color: string; bar: string }[] = [
  { key: "P", label: "POR", color: "text-orange-400", bar: "bg-orange-400" },
  {
    key: "D",
    label: "DIF",
    color: "text-emerald-400",
    bar: "bg-emerald-400",
  },
  { key: "C", label: "CEN", color: "text-blue-400", bar: "bg-blue-400" },
  { key: "A", label: "ATT", color: "text-red-400", bar: "bg-red-400" },
];

// Il costo previsto di ogni giocatore (colonna costo_prev) è la base
// su cui viene calcolata la spesa stimata della rosa simulata.
export const RiepilogoSimulazione = ({
  budgetTotale,
  percentuali,
  giocatoriSelezionati,
}: Props) => {
  const spesoPerRuolo = (ruolo?: Ruolo) =>
    giocatoriSelezionati
      .filter((g) => !ruolo || g.r === ruolo)
      .reduce((acc, g) => acc + (g.costo_prev ?? 0), 0);

  const spesoTotale = spesoPerRuolo();
  const residuoTotale = budgetTotale - spesoTotale;

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4 flex flex-col gap-4 lg:w-80 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Wallet className="w-4 h-4 text-emerald-500" />
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          Riepilogo rosa simulata
        </label>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Speso (stima)
          </p>
          <p className="text-2xl font-black italic">{spesoTotale}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Residuo
          </p>
          <p
            className={`text-2xl font-black italic ${
              residuoTotale < 0 ? "text-red-400" : "text-emerald-400"
            }`}
          >
            {residuoTotale}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {RUOLI.map((r) => {
          const allocato = Math.round(
            (budgetTotale * (percentuali[r.key] || 0)) / 100,
          );
          const speso = spesoPerRuolo(r.key);
          const percentualeBarra =
            allocato > 0 ? Math.min(100, (speso / allocato) * 100) : 0;
          const sforato = speso > allocato;
          const numGiocatori = giocatoriSelezionati.filter(
            (g) => g.r === r.key,
          ).length;

          return (
            <div key={r.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className={r.color}>
                  {r.label} · {numGiocatori}
                </span>
                <span className={sforato ? "text-red-400" : "text-gray-400"}>
                  {speso}/{allocato}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    sforato ? "bg-red-500" : r.bar
                  }`}
                  style={{ width: `${percentualeBarra}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};