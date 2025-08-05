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
    <div className="bg-gray-800 rounded-lg text-white cursor-pointer" onClick={() => setOpen(!open)}>
      <GiocatoreCardCompact giocatore={giocatore} />
      {open && <GiocatoreCardDetail giocatore={giocatore} />}
    </div>
  );
};
