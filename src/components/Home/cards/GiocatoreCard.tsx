import { useState } from "react";
import { StatisticheGiocatore } from "../../../types/GiocatoreTypes";
import { RuoloBadge } from "../RuoloBadge";

interface Props {
  giocatore: StatisticheGiocatore;
}

export const GiocatoreCard = ({ giocatore }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg text-white cursor-pointer" onClick={() => setOpen(!open)}>
      {/* Riga compatta */}
      <div className="flex items-center px-4 py-3 gap-3">
        <span className="text-xs w-10 text-gray-400">{giocatore.Cod}</span>
        <RuoloBadge ruolo={giocatore.R} />
        <div className="flex-1 font-bold uppercase">{giocatore.Nome}</div>
        <div className="w-28 text-right">{giocatore.Squadra}</div>
        <div className="w-12 text-right">{giocatore.Pv}</div>
        <div className="w-12 text-right">{giocatore.Mv}</div>
        <div className="w-12 text-right">{giocatore.Fm}</div>
      </div>

      {/* Dettaglio espanso */}
      {open && (
        <div className="px-4 py-3 bg-gray-700 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          <div><b>Gol:</b> {giocatore.Gf}</div>
          <div><b>Assist:</b> {giocatore.Ass}</div>
          <div><b>Ammonizioni:</b> {giocatore.Amm}</div>
          <div><b>Esp:</b> {giocatore.Esp}</div>
          <div><b>Rs:</b> {giocatore.Rs}</div>
          <div><b>Au:</b> {giocatore.Au}</div>
          {/* aggiungi qui le altre colonne che vuoi mostrare */}
        </div>
      )}
    </div>
  );
};