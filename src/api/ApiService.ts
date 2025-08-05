import { db } from '../firebase/firebaseconfig';

// Importa le funzioni necessarie da firestore
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { StatisticheGiocatore } from '../types/GiocatoreTypes';

export async function getAllGiocatori(): Promise<StatisticheGiocatore[]> {
  const giocatori: StatisticheGiocatore[] = [];

  try {
    // Ottieni un riferimento alla collection 'Giocatori'
    const giocatoriCollectionRef = collection(db, 'Giocatori');

    const querySnapshot = await getDocs(giocatoriCollectionRef);

    querySnapshot.forEach((doc) => {
      // doc.data() è la funzione per ottenere i dati del documento in formato JavaScript
      // doc.id è l'ID univoco del documento generato da Firestore
      giocatori.push({
        id: doc.id,
        ...doc.data() as Omit<StatisticheGiocatore, 'id'>
      });
    });

    return giocatori;

  } catch (e) {
    console.error("Errore nel recuperare i giocatori: ", e);
    throw e;
  }
}


export async function addStatisticheFromData(statisticheData: StatisticheGiocatore[]): Promise<void> {
  const giocatoriCollectionRef = collection(db, 'Giocatori');
  let addedCount = 0;

  console.log(`Inizio elaborazione di ${statisticheData.length} giocatori...`);

  for (const stats of statisticheData) {
    try {
      await addDoc(giocatoriCollectionRef, stats);
      console.log(`Aggiunto nuove statistiche con Cod: ${stats.id}`);
      addedCount++;
    } catch (e) {
      console.error(`Errore nell'elaborazione del giocatore con Cod: ${stats.id}`, e);
    }
  }

  console.log(`Elaborazione completata. Aggiunti ${addedCount} nuove statistiche.`);
}

