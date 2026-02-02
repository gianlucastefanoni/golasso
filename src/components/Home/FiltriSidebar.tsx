import { Search, RotateCcw, Filter } from "lucide-react"; // Se non hai lucide-react, puoi usare SVG o ignorare le icone

type RoleType = "TUTTI" | "P" | "D" | "C" | "A";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  minPv: number;
  setMinPv: (v: number) => void;
  minMv: number;
  setMinMv: (v: number) => void;
  minFm: number;
  setMinFm: (v: number) => void;
  role: RoleType;
  setRole: (r: RoleType) => void;
  onReset: () => void;
}

export const FiltriSidebar = ({
  search, setSearch,
  minPv, setMinPv,
  minMv, setMinMv,
  minFm, setMinFm,
  role, setRole,
  onReset
}: Props) => {
  
  const roleLabels: Record<RoleType, string> = {
    TUTTI: "Tutti",
    P: "Por",
    D: "Dif",
    C: "Cen",
    A: "Att"
  };

  return (
    <aside className="w-64 flex flex-col gap-6 bg-gray-800/40 p-4 rounded-2xl border border-gray-700/50 backdrop-blur-sm overflow-auto custom-scrollbar h-fit">
      
      {/* SEZIONE: RICERCA */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Cerca Giocatore</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Nome, squadra..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2.5 pl-10 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-600"
          />
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* SEZIONE: RUOLI */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Ruolo</label>
        <div className="grid grid-cols-5 gap-1 bg-gray-900 p-1 rounded-xl border border-gray-700">
          {(["TUTTI", "P", "D", "C", "A"] as RoleType[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                role === r 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              {roleLabels[r]}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[1px] bg-gray-700/50 w-full my-1"></div>

      {/* SEZIONE: RANGE SLIDERS */}
      <div className="flex flex-col gap-5">
        
        {/* PV */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Partite a Voto</label>
            <span className="text-emerald-500 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">≥ {minPv}</span>
          </div>
          <input
            type="range" min={0} max={38} value={minPv}
            onChange={(e) => setMinPv(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* MV */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Media Voto</label>
            <span className="text-emerald-500 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">≥ {minMv.toFixed(1)}</span>
          </div>
          <input
            type="range" min={2} max={10} step={0.1} value={minMv}
            onChange={(e) => setMinMv(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* FM */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold ml-1">Fanta Media</label>
            <span className="text-emerald-500 font-mono font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">≥ {minFm.toFixed(1)}</span>
          </div>
          <input
            type="range" min={2} max={10} step={0.1} value={minFm}
            onChange={(e) => setMinFm(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* TASTO RESET */}
      <button
        onClick={onReset}
        className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-700 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-gray-700 hover:text-white transition-all active:scale-95"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset Filtri
      </button>

    </aside>
  );
};