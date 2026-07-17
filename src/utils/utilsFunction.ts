import { StatisticheGiocatore, ConfigAsta, Ruolo } from '../types/GiocatoreTypes';

const RUOLI: Ruolo[] = ['P', 'D', 'C', 'A'];

export function valoreGiocatore(giocatore: StatisticheGiocatore): number {
    if (giocatore.R === 'C' || giocatore.R === 'A') {
        return giocatore.Fm;
    }
    return (giocatore.Fm + giocatore.Mv) / 2;
}

/**
 * Knapsack 0/1 per un singolo ruolo: sceglie ESATTAMENTE k giocatori
 * massimizzando il valore totale, per ogni possibile spesa da 0 a budget.
 *
 * dp[kk][c] = miglior valore ottenibile scegliendo esattamente kk giocatori
 *             spendendo AL MASSIMO c crediti.
 *
 * Complessità: O(n * k * budget) in tempo e memoria per ruolo.
 */
interface KnapsackRuolo {
    dp: number[][];              // dp[kk][c]
    scelta: Uint8Array[][];      // scelta[i][kk][c] -> 1 se il giocatore i è incluso in quello stato ottimo
    giocatori: StatisticheGiocatore[];
}

function knapsackRuolo(
    giocatori: StatisticheGiocatore[],
    k: number,
    budget: number
): KnapsackRuolo {
    const n = giocatori.length;
    const NEG = Number.NEGATIVE_INFINITY;

    const dp: number[][] = Array.from({ length: k + 1 }, () =>
        new Array(budget + 1).fill(NEG)
    );
    dp[0].fill(0); // 0 giocatori scelti -> valore 0 con qualunque budget residuo

    const scelta: Uint8Array[][] = Array.from({ length: n }, () =>
        Array.from({ length: k + 1 }, () => new Uint8Array(budget + 1))
    );

    for (let i = 0; i < n; i++) {
        const g = giocatori[i];
        const costo = g.Costo;
        const valore = valoreGiocatore(g);

        // kk e c decrescenti: tecnica standard per knapsack 0/1 (ogni giocatore usato al massimo una volta)
        const kkMax = Math.min(k, i + 1);
        for (let kk = kkMax; kk >= 1; kk--) {
            const rigaPrec = dp[kk - 1];
            const rigaCorr = dp[kk];
            for (let c = budget; c >= costo; c--) {
                if (rigaPrec[c - costo] === NEG) continue;
                const conValore = rigaPrec[c - costo] + valore;
                if (conValore > rigaCorr[c]) {
                    rigaCorr[c] = conValore;
                    scelta[i][kk][c] = 1;
                }
            }
        }
    }

    return { dp, scelta, giocatori };
}

function ricostruisciRuolo(
    knap: KnapsackRuolo,
    k: number,
    costoTotale: number
): StatisticheGiocatore[] {
    const { scelta, giocatori } = knap;
    const risultato: StatisticheGiocatore[] = [];
    let kk = k;
    let c = costoTotale;

    for (let i = giocatori.length - 1; i >= 0 && kk > 0; i--) {
        if (scelta[i][kk][c]) {
            const g = giocatori[i];
            risultato.push(g);
            c -= g.Costo;
            kk -= 1;
        }
    }
    return risultato;
}

/**
 * Trova la rosa che massimizza il punteggio totale rispettando budget
 * e numero di giocatori per ruolo. A differenza del backtracking esaustivo,
 * questa versione è polinomiale (O(ruoli * n * k * budget^2) circa) e quindi
 * utilizzabile anche con centinaia di giocatori: trova SEMPRE l'ottimo esatto,
 * bargain (valore alto / costo basso) inclusi, perché la funzione obiettivo
 * (massimizzare la somma dei valori sotto vincolo di budget) premia
 * automaticamente ogni giocatore che libera credito utile altrove.
 */
export function trovaRosaOttimale(
    giocatori: StatisticheGiocatore[],
    config: ConfigAsta
): StatisticheGiocatore[] {
    const disponibili = giocatori.filter(g => g.Pv >= config.minPartite);
    const budget = config.budget;

    // Controllo esplicito: se manca materiale per riempire un ruolo, fallisce subito e chiaramente
    for (const r of RUOLI) {
        const richiesti = config.giocatoriPerRuolo[r];
        const disponibiliRuolo = disponibili.filter(g => g.R === r).length;
        if (disponibiliRuolo < richiesti) {
            throw new Error(
                `Giocatori insufficienti per il ruolo ${r}: servono ${richiesti}, disponibili ${disponibiliRuolo}`
            );
        }
    }

    const knapsackPerRuolo: Record<Ruolo, KnapsackRuolo> = {} as any;
    const valorePerBudget: Record<Ruolo, number[]> = {} as any;

    for (const r of RUOLI) {
        const giocatoriRuolo = disponibili.filter(g => g.R === r);
        const k = config.giocatoriPerRuolo[r];
        const knap = knapsackRuolo(giocatoriRuolo, k, budget);
        knapsackPerRuolo[r] = knap;
        valorePerBudget[r] = knap.dp[k]; // valore migliore per ogni spesa 0..budget, con esattamente k giocatori
    }

    // Combina i ruoli trovando la ripartizione di budget che massimizza la somma totale
    let comb = valorePerBudget[RUOLI[0]].slice();
    const splitLog: number[][] = [];

    for (let idx = 1; idx < RUOLI.length; idx++) {
        const nuovo = valorePerBudget[RUOLI[idx]];
        const nuovaComb = new Array(budget + 1).fill(Number.NEGATIVE_INFINITY);
        const split = new Array(budget + 1).fill(0);

        for (let c = 0; c <= budget; c++) {
            let migliore = Number.NEGATIVE_INFINITY;
            let migliorSplit = 0;
            for (let c1 = 0; c1 <= c; c1++) {
                const v = comb[c - c1] + nuovo[c1];
                if (v > migliore) {
                    migliore = v;
                    migliorSplit = c1;
                }
            }
            nuovaComb[c] = migliore;
            split[c] = migliorSplit;
        }
        comb = nuovaComb;
        splitLog.push(split);
    }

    // Miglior costo totale entro il budget
    let migliorC = 0;
    for (let c = 1; c <= budget; c++) {
        if (comb[c] > comb[migliorC]) migliorC = c;
    }

    if (comb[migliorC] === Number.NEGATIVE_INFINITY) {
        return []; // nessuna combinazione fattibile col budget dato
    }

    // Ricostruzione a ritroso della ripartizione di budget tra i ruoli
    const budgetPerRuolo: Record<Ruolo, number> = {} as any;
    let cResiduo = migliorC;
    for (let idx = RUOLI.length - 1; idx >= 1; idx--) {
        const split = splitLog[idx - 1];
        const cNuovoRuolo = split[cResiduo];
        budgetPerRuolo[RUOLI[idx]] = cNuovoRuolo;
        cResiduo -= cNuovoRuolo;
    }
    budgetPerRuolo[RUOLI[0]] = cResiduo;

    let rosaFinale: StatisticheGiocatore[] = [];
    for (const r of RUOLI) {
        const k = config.giocatoriPerRuolo[r];
        const c = budgetPerRuolo[r];
        rosaFinale = rosaFinale.concat(ricostruisciRuolo(knapsackPerRuolo[r], k, c));
    }

    return rosaFinale;
}