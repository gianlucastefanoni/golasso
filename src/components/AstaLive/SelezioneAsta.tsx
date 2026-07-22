import { Calendar } from "lucide-react";
import { Asta } from "../../api/astaApi";

interface Props {
  aste: Asta[];
  selectedAstaId: number | null;
  onSelect: (astaId: number) => void;
  loading: boolean;
}

export const SelezioneAsta = ({
  aste,
  selectedAstaId,
  onSelect,
  loading,
}: Props) => {
  if (loading) {
    return (
      <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 text-gray-500 text-sm font-bold uppercase tracking-widest">
        Caricamento aste...
      </div>
    );
  }

  if (aste.length === 0) {
    return (
      <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-6 text-gray-500 text-sm">
        Nessuna asta configurata. Creane una dalla pagina{" "}
        <span className="text-emerald-400 font-bold">Nuova configurazione</span>
        .
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-4 flex items-center gap-4">
      <Calendar className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          Asta in gestione
        </label>
        <select
          value={selectedAstaId ?? ""}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 font-black text-lg outline-none focus:border-emerald-500 transition-all cursor-pointer"
        >
          {aste.map((a) => (
            <option key={a.id} value={a.id}>
              Stagione {a.stagione} — Budget {a.budget} — {a.partecipanti}{" "}
              partecipanti
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
