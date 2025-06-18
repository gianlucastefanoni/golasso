import { useEffect, useState } from "react";
import { GiocatoreType } from "../types/GiocatoreTypes";
import { getAllGiocatori } from "../api/ApiService";
import { ExcelReaderGiocatori } from "../components/ExcelReaderGiocatori";


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
      <div className="p-4 flex flex-col">
      <ExcelReaderGiocatori />
        <h2>Elenco Giocatori</h2>
        {giocatori.length > 0 ? (
          <ul>
            {giocatori.map((giocatore) => (
              <li key={giocatore.id}>
                Codice: {giocatore.cod}, Ruolo: {giocatore.ruolo}, Nome: {giocatore.nome}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nessun giocatore trovato.</p>
        )}
      </div>
    );
}