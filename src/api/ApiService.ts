import { db } from '../firebase/firebaseconfig';

// Importa le funzioni necessarie da firestore
import { collection, doc, getDocs, getFirestore, writeBatch } from 'firebase/firestore';
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
  const db = getFirestore();
  // Il Batch permette di inviare più operazioni insieme (più veloce e sicuro)
  const batch = writeBatch(db);

  console.log(`Inizio elaborazione di ${statisticheData.length} giocatori...`);

  statisticheData.forEach((stats) => {
    // IMPORTANTE: Usiamo il Codice del giocatore come ID del documento.
    // Se stats.Cod esiste già, Firestore sovrascriverà i dati esistenti invece di crearne nuovi.
    // Assicurati che il campo sia quello giusto (stats.Cod o stats.id)
    const playerID = stats.Cod?.toString() || stats.id?.toString();
    
    if (!playerID) {
      console.error("Salto giocatore: ID mancante", stats);
      return;
    }

    const docRef = doc(db, 'Giocatori', playerID);
    
    // setDoc sovrascrive se esiste, crea se non esiste
    batch.set(docRef, stats);
  });

  try {
    await batch.commit();
    console.log(`Sincronizzazione completata con successo.`);
  } catch (e) {
    console.error(`Errore durante il commit del batch:`, e);
    throw e; // Rilanciamo l'errore per gestirlo nel componente UI
  }
}




