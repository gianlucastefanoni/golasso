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
  search,
  setSearch,
  minPv,
  setMinPv,
  minMv,
  setMinMv,
  minFm,
  setMinFm,
  role,
  setRole,
  onReset
}: Props) => {
  return (
    <aside className="w-64 flex flex-col gap-4 overflow-auto custom-scrollbar">
      <input
        type="text"
        placeholder="Cerca per nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-gray-800 text-white rounded px-3 py-2"
      />

      <div className="flex flex-wrap gap-2 justify-between text-xs">
        {["TUTTI", "P", "D", "C", "A"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r as RoleType)}
            className={`flex-1 py-1 rounded cursor-pointer hover:bg-emerald-500 ${
              role === r ? "bg-emerald-500" : "bg-emerald-800"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm">PV ≥ {minPv}</label>
        <input
          type="range"
          min={0}
          max={38}
          value={minPv}
          onChange={(e) => setMinPv(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <label className="text-sm">MV ≥ {minMv}</label>
        <input
          type="range"
          min={2}
          max={10}
          step={0.1}
          value={minMv}
          onChange={(e) => setMinMv(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <div>
        <label className="text-sm">FM ≥ {minFm}</label>
        <input
          type="range"
          min={2}
          max={10}
          step={0.1}
          value={minFm}
          onChange={(e) => setMinFm(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
      </div>

      <button
        onClick={onReset}
        className="bg-emerald-600 rounded py-1 cursor-pointer hover:bg-emerald-500"
      >
        Reset filtri
      </button>
    </aside>
  );
};
