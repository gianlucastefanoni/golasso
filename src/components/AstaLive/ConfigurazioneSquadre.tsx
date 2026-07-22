import { Settings2 } from "lucide-react";
import { Ruolo } from "../../types/GiocatoreTypes";

export type SlotConfig = Record<Ruolo, number>;

interface Props {
  slotConfig: SlotConfig;
  onChange: (ruolo: Ruolo, value: number) => void;
}

const RUOLI: { key: Ruolo; label: string; color: string }[] = [
  { key: "P", label: "Portieri", color: "text-orange-400" },
  { key: "D", label: "Difensori", color: "text-emerald-400" },
  { key: "C", label: "Centrocampisti", color: "text-blue-400" },
  { key: "A", label: "Attaccanti", color: "text-red-400" },
];

export const ConfigurazioneSquadre = ({ slotConfig, onChange }: Props) => {
  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Settings2 className="w-4 h-4 text-emerald-500" />
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          Slot per ruolo (uguali per tutte le fanta squadre)
        </label>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {RUOLI.map((r) => (
          <div key={r.key} className="flex flex-col gap-1">
            <label
              className={`text-[9px] font-bold uppercase tracking-widest ${r.color}`}
            >
              {r.label}
            </label>
            <input
              type="number"
              min={0}
              value={slotConfig[r.key]}
              onChange={(e) =>
                onChange(
                  r.key,
                  Math.max(0, parseInt(e.target.value || "0", 10)),
                )
              }
              className="bg-gray-800 border border-gray-700 rounded-xl p-2 text-center font-black outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
