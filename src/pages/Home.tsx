import { useEffect, useState } from "react";
import { GiocatoreType } from "../types/GiocatoreTypes";
import { getAllGiocatori } from "../api/ApiService";
import { ERGiocatori } from "../components/Home/ERGiocatori";
import { GiocatoriTable } from "../components/Home/GiocatoriTable";
import { ERStatistiche } from "../components/Home/ERStatistiche";


export const Home = () => {
  const [giocatori, setGiocatori] = useState<GiocatoreType[]>([]); // Stato per salvare i giocatori

  useEffect(() => {
    const fetchGiocatori = async () => {
      const data = await getAllGiocatori();
      setGiocatori(data);
    }

    fetchGiocatori()
  }, [])

  return (
    <div className="p-4 flex flex-col gap-3 bg-gray-900 text-white">
      <ERGiocatori />
      <ERStatistiche />
      <h2>Elenco Giocatori</h2>
      <GiocatoriTable giocatori={giocatori} />
    </div>
  );
}