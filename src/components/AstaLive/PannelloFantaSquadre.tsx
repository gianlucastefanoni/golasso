import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  FantaSquadra,
  StatisticheGiocatore,
  Ruolo,
} from "../../types/GiocatoreTypes";
import { SlotConfig } from "./ConfigurazioneSquadre";

interface Props {
  fantaSquadre: FantaSquadra[];
  giocatori: StatisticheGiocatore[]; // già filtrati per la stagione dell'asta
  budgetTotale: number;
  slotConfig: SlotConfig;
  selectedTeamId: number | null;
  onSelectTeam: (id: number | null) => void;
}

const RUOLI: Ruolo[] = ["P", "D", "C", "A"];

const RUOLO_EMPTY_STYLE: Record<Ruolo, string> = {
  P: "bg-sky-500/15 border-sky-500/40 text-sky-300",
  D: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  C: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  A: "bg-rose-500/15 border-rose-500/40 text-rose-300",
};

export const PannelloFantaSquadre = ({
  fantaSquadre,
  giocatori,
  budgetTotale,
  slotConfig,
  selectedTeamId,
  onSelectTeam,
}: Props) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectTeam(null)}
          className={`flex-1 text-left px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            selectedTeamId === null
              ? "bg-emerald-600 text-white"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Mostra tutti i giocatori
        </button>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={
            mobileOpen ? "Nascondi fanta squadre" : "Mostra fanta squadre"
          }
          aria-expanded={mobileOpen}
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 transition-all flex-shrink-0"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              mobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`${
          mobileOpen ? "grid" : "hidden"
        } md:grid grid-cols-3 md:grid-cols-12 gap-4 w-full overflow-x-auto pb-2 custom-scrollbar`}
      >
        {fantaSquadre.map((team) => {
          const rosa = giocatori.filter((g) => g.id_fanta_squadra === team.id);
          const speso = rosa.reduce((acc, g) => acc + (g.costo ?? 0), 0);
          const residui = budgetTotale - speso;

          const slotOccupati = RUOLI.reduce(
            (acc, r) => {
              acc[r] = rosa.filter((g) => g.r === r).length;
              return acc;
            },
            {} as Record<Ruolo, number>,
          );

          const isSelected = selectedTeamId === team.id;

          return (
            <button
              key={team.id}
              onClick={() => onSelectTeam(isSelected ? null : team.id)}
              className={`text-left p-3 rounded-2xl border transition-all shrink-0 ${
                isSelected
                  ? "bg-emerald-900/20 border-emerald-500/50 shadow-lg shadow-emerald-900/20"
                  : "bg-gray-900/60 border-gray-800 hover:border-gray-600"
              }`}
            >
              <div className="flex flex-col justify-between items-start mb-3">
                <div className="min-w-0 w-full">
                  <p className="w-full font-black uppercase italic tracking-tighter text-sm truncate whitespace-nowrap overflow-hidden text-ellipsis">
                    {team.nome}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-emerald-400 flex-shrink-0">
                  <span
                    className={`font-black text-sm ${residui < 0 ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {residui}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {RUOLI.map((r) => {
                  const occupati = slotOccupati[r];
                  const target = slotConfig[r];
                  const pieno = occupati >= target && target > 0;
                  return (
                    <div
                      key={r}
                      className={`text-center py-1 rounded-lg text-[10px] font-bold border ${
                        pieno
                          ? "bg-gray-800 border-gray-700 text-gray-400"
                          : RUOLO_EMPTY_STYLE[r]
                      }`}
                    >
                      {r} {occupati}/{target}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};