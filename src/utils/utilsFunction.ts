import { StatisticheGiocatore, ConfigAsta, Ruolo } from '../types/GiocatoreTypes';

const RUOLI: Ruolo[] = ['P', 'D', 'C', 'A'];

export function valoreGiocatore(giocatore: StatisticheGiocatore): number {
    if (giocatore.r === 'C' || giocatore.r === 'A') {
        return giocatore.fm;
    }
    return (giocatore.fm + giocatore.mv) / 2;
}

interface KnapsackRuolo {
    dp: number[][];
    scelta: Uint8Array[][];
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
    dp[0].fill(0);

    const scelta: Uint8Array[][] = Array.from({ length: n }, () =>
        Array.from({ length: k + 1 }, () => new Uint8Array(budget + 1))
    );

    for (let i = 0; i < n; i++) {
        const g = giocatori[i];
        const costo = g.costo ?? 0;
        const valore = valoreGiocatore(g);

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
            c -= (g.costo ?? 0);
            kk -= 1;
        }
    }
    return risultato;
}

export function trovaRosaOttimale(
    giocatori: StatisticheGiocatore[],
    config: ConfigAsta
): StatisticheGiocatore[] {
    const disponibili = giocatori.filter(g => g.pv >= config.minPartite);
    const budget = config.budget;

    for (const r of RUOLI) {
        const richiesti = config.giocatoriPerRuolo[r];
        const disponibiliRuolo = disponibili.filter(g => g.r === r).length;
        if (disponibiliRuolo < richiesti) {
            throw new Error(
                `Giocatori insufficienti per il ruolo ${r}: servono ${richiesti}, disponibili ${disponibiliRuolo}`
            );
        }
    }

    const knapsackPerRuolo: Record<Ruolo, KnapsackRuolo> = {} as any;
    const valorePerBudget: Record<Ruolo, number[]> = {} as any;

    for (const r of RUOLI) {
        const giocatoriRuolo = disponibili.filter(g => g.r === r);
        const k = config.giocatoriPerRuolo[r];
        const knap = knapsackRuolo(giocatoriRuolo, k, budget);
        knapsackPerRuolo[r] = knap;
        valorePerBudget[r] = knap.dp[k];
    }

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

    let migliorC = 0;
    for (let c = 1; c <= budget; c++) {
        if (comb[c] > comb[migliorC]) migliorC = c;
    }

    if (comb[migliorC] === Number.NEGATIVE_INFINITY) {
        return [];
    }

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