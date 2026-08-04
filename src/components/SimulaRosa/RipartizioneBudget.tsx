import { Percent } from "lucide-react";
import { Ruolo } from "../../types/GiocatoreTypes";

export type RipartizionePercentuali = Record<Ruolo, number>;

interface Props {
  budgetTotale: number;
  percentuali: RipartizionePercentuali;
  onChange: (ruolo: Ruolo, value: number) => void;
}

const RUOLI: { key: Ruolo; label: string; color: string }[] = [
  { key: "P", label: "Portieri", color: "text-orange-400" },
  { key: "D", label: "Difensori", color: "text-emerald-400" },
  { key: "C", label: "Centrocampisti", color: "text-blue-400" },
  { key: "A", label: "Attaccanti", color: "text-red-400" },
];

export const RipartizioneBudget = ({
  budgetTotale,
  percentuali,
  onChange,
}: Props) => {
  const totalePercentuali = RUOLI.reduce(
    (acc, r) => acc + (percentuali[r.key] || 0),
    0,
  );
  const isValido = totalePercentuali === 100;

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4 flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-emerald-500" />
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
            Divisione crediti per reparto
          </label>
        </div>
        <span
          className={`text-[10px] font-black uppercase tracking-widest ${
            isValido ? "text-emerald-400" : "text-amber-400"
          }`}
        >
          Totale {totalePercentuali}% {isValido ? "" : "(deve fare 100%)"}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {RUOLI.map((r) => (
          <div key={r.key} className="flex flex-col gap-1">
            <label
              className={`text-[10px] font-bold uppercase tracking-widest ${r.color}`}
            >
              {r.label}
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={percentuali[r.key]}
                onChange={(e) =>
                  onChange(
                    r.key,
                    Math.max(
                      0,
                      Math.min(100, parseInt(e.target.value || "0", 10)),
                    ),
                  )
                }
                className="w-full bg-gray-800 border border-gray-700 rounded-xl p-2 pr-7 text-center font-black outline-none focus:border-emerald-500 transition-all"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-bold">
                %
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-bold text-center">
              {Math.round((budgetTotale * (percentuali[r.key] || 0)) / 100)}{" "}
              crediti
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};