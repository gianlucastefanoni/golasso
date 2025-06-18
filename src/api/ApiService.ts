import { db } from '../firebase/firebaseconfig';

// Importa le funzioni necessarie da firestore
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { GiocatoreType } from '../types/GiocatoreTypes';

export async function getAllGiocatori(): Promise<GiocatoreType[]> {
    const giocatori: GiocatoreType[] = [];
  
    try {
      // Ottieni un riferimento alla collection 'Giocatori'
      const giocatoriCollectionRef = collection(db, 'Giocatori');
  
      const querySnapshot = await getDocs(giocatoriCollectionRef);
  
      querySnapshot.forEach((doc) => {
        // doc.data() è la funzione per ottenere i dati del documento in formato JavaScript
        // doc.id è l'ID univoco del documento generato da Firestore
        giocatori.push({
          id: doc.id,
          ...doc.data() as Omit<GiocatoreType, 'id'>
        });
      });

      return giocatori;
  
    } catch (e) {
      console.error("Errore nel recuperare i giocatori: ", e);
      throw e;
    }
  }

  export async function addGiocatoriFromData(giocatoriData: GiocatoreType[]): Promise<void> {
    const giocatoriCollectionRef = collection(db, 'Giocatori');
    let addedCount = 0;
  
    console.log(`Inizio elaborazione di ${giocatoriData.length} giocatori...`);
  
    for (const giocatore of giocatoriData) {
      try {
        const q = query(giocatoriCollectionRef, where("cod", "==", giocatore.cod));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          await addDoc(giocatoriCollectionRef, giocatore);
          console.log(`Aggiunto nuovo giocatore con Cod: ${giocatore.cod}`);
          addedCount++;
        }
      } catch (e) {
        console.error(`Errore nell'elaborazione del giocatore con Cod: ${giocatore.cod}`, e);
      }
    }
  
    console.log(`Elaborazione completata. Aggiunti ${addedCount} nuovi giocatori.`);
  }


