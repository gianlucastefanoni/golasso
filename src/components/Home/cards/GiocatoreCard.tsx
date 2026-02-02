import { useState } from "react";
import { StatisticheGiocatore } from "../../../types/GiocatoreTypes";
import { GiocatoreCardCompact } from "./GiocatoreCardCompact";
import { GiocatoreCardDetail } from "./GiocatoreCardDetail";

interface Props {
  giocatore: StatisticheGiocatore;
}

export const GiocatoreCard = ({ giocatore }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className={`group bg-gray-800/50 rounded-xl border transition-all duration-200 ${
        open ? "border-emerald-500 shadow-lg shadow-emerald-900/20" : "border-gray-700 hover:border-gray-500 shadow-md"
      }`}
      onClick={() => setOpen(!open)}
    >
      <GiocatoreCardCompact giocatore={giocatore} isOpen={open} />
      {open && <GiocatoreCardDetail giocatore={giocatore} />}
    </div>
  );
};
