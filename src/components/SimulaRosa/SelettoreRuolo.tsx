import { Ruolo } from "../../types/GiocatoreTypes";

interface Props {
  activeTab: Ruolo;
  onChange: (r: Ruolo) => void;
  conteggi: Record<Ruolo, number>;
}

const RUOLI: { key: Ruolo; label: string }[] = [
  { key: "P", label: "Portieri" },
  { key: "D", label: "Difensori" },
  { key: "C", label: "Centrocampisti" },
  { key: "A", label: "Attaccanti" },
];

// Tab unico condiviso da "Rosa simulata" e "Giocatori disponibili": cambiando
// reparto qui, entrambe le liste seguono di pari passo, così su mobile
// (dove le due colonne si impilano) ogni lista occupa solo lo spazio di un
// reparto alla volta invece di tutti e quattro insieme.
export const SelettoreRuolo = ({ activeTab, onChange, conteggi }: Props) => {
  return (
    <div className="flex bg-gray-900/60 rounded-2xl border border-gray-800 overflow-hidden">
      {RUOLI.map((r) => {
        const isActive = activeTab === r.key;
        const conteggio = conteggi[r.key] ?? 0;

        return (
          <button
            key={r.key}
            type="button"
            onClick={() => onChange(r.key)}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              isActive
                ? "bg-emerald-500 text-white"
                : "text-gray-400 hover:bg-gray-800/60"
            }`}
          >
            <span className="hidden sm:inline">{r.label}</span>
            <span className="sm:hidden">{r.key}</span>
            {conteggio > 0 && (
              <span
                className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black ${
                  isActive
                    ? "bg-white/25 text-white"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {conteggio}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};